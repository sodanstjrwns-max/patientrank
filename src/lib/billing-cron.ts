// ===================================================================
// Day 6: 정기결제 자동 청구 Cron Handler
// 매일 06:00 KST (= UTC 21:00) 실행
//
// 흐름:
// 1) next_billing_date <= 오늘인 active 구독 조회
// 2) 빌링키로 자동 청구 (chargeBillingKey)
// 3) 성공 → 다음 결제일 +1개월 / 결제 카카오 알림
// 4) 실패 → 1차: 3일 후 재시도 (status='past_due')
//          2차: 7일 누적 실패 시 구독 정지 (status='expired')
// ===================================================================

import type { Bindings } from './types'
import {
  chargeBillingKey,
  generateOrderId,
  savePayment,
  updatePaymentSuccess,
  updatePaymentFailure,
} from './toss-payments'
import { sendPaymentSuccess, sendKakaoMessage } from './kakao-notify'

interface BillingResult {
  charged_success: number
  charged_failed: number
  retried: number
  expired: number
  total_revenue_krw: number
  errors: string[]
}

export async function runDailyBillingCron(env: Bindings): Promise<BillingResult> {
  const startedAt = new Date().toISOString()
  const today = new Date()
  const todayISO = today.toISOString().slice(0, 10)

  // cron 로그 시작
  const logRes = await env.DB.prepare(`
    INSERT INTO cron_runs (job_name, started_at, status)
    VALUES ('daily_billing', ?, 'running')
  `).bind(startedAt).run()
  const cronRunId = Number(logRes.meta.last_row_id)

  let chargedSuccess = 0
  let chargedFailed = 0
  let retried = 0
  let expired = 0
  let totalRevenue = 0
  const errors: string[] = []

  try {
    // ─────────────────────────────────────────────────────────
    // 1) 청구 대상 조회: active 또는 past_due + 결제일 도래
    // ─────────────────────────────────────────────────────────
    const due = await env.DB.prepare(`
      SELECT s.*, u.email, u.name, u.phone
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      WHERE s.status IN ('active', 'past_due')
        AND s.toss_billing_key IS NOT NULL
        AND s.next_billing_date <= ?
        AND s.final_price_krw > 0
      ORDER BY s.next_billing_date ASC
      LIMIT 200
    `).bind(today.toISOString()).all<any>()

    for (const sub of due.results || []) {
      try {
        // 2) 자동 청구
        const orderId = generateOrderId()
        await savePayment(env, sub.user_id, sub.id, orderId, sub.final_price_krw, 'subscription_renewal')

        const chargeRes = await chargeBillingKey(env, {
          billingKey: sub.toss_billing_key,
          customerKey: sub.toss_customer_key,
          amount: sub.final_price_krw,
          orderId,
          orderName: `PatientRank ${(sub.plan || '').toUpperCase()} 월정액`,
          customerEmail: sub.email,
          customerName: sub.name || sub.email.split('@')[0],
        })

        // 3) 성공 → DB 업데이트 + 다음 결제일 산정
        await updatePaymentSuccess(env, orderId, chargeRes)

        const nextBilling = new Date()
        nextBilling.setMonth(nextBilling.getMonth() + 1)

        await env.DB.prepare(`
          UPDATE subscriptions SET
            status = 'active',
            current_period_start = ?,
            current_period_end = ?,
            next_billing_date = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          today.toISOString(),
          nextBilling.toISOString(),
          nextBilling.toISOString(),
          sub.id,
        ).run()

        // 4) 카카오 알림
        if (sub.phone) {
          await sendPaymentSuccess(env, sub.user_id, sub.phone, {
            name: sub.name || sub.email.split('@')[0],
            plan: (sub.plan || '').toUpperCase(),
            amount: `${sub.final_price_krw.toLocaleString()}원`,
            next_billing: nextBilling.toISOString().slice(0, 10),
            receipt_url: chargeRes.receipt?.url,
          })
        }

        chargedSuccess++
        totalRevenue += sub.final_price_krw
      } catch (e: any) {
        chargedFailed++
        const errMsg = e.message || 'unknown'
        errors.push(`USER:${sub.user_id} PLAN:${sub.plan}: ${errMsg}`)

        // 5) 실패 처리: past_due 전환 + 재시도 일정
        const wasAlreadyPastDue = sub.status === 'past_due'
        const firstFailedAt = sub.notes && sub.notes.startsWith('past_due_since:')
          ? sub.notes.split(':')[1]
          : todayISO

        const daysSinceFail = Math.floor(
          (today.getTime() - new Date(firstFailedAt).getTime()) / (1000 * 60 * 60 * 24),
        )

        if (daysSinceFail >= 7) {
          // 7일 누적 실패 → 구독 정지
          await env.DB.prepare(`
            UPDATE subscriptions SET
              status = 'expired',
              cancelled_at = CURRENT_TIMESTAMP,
              notes = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(`expired_after_7d_fail: ${errMsg}`, sub.id).run()

          // 유저 플랜 free로 강등
          await env.DB.prepare(`UPDATE users SET plan = 'free' WHERE id = ?`)
            .bind(sub.user_id).run()

          expired++

          // 카카오 정지 알림
          if (sub.phone) {
            const pfId = (env as any).KAKAO_PFID
            const tplFail = (env as any).KAKAO_TEMPLATE_ID_PAYMENT_FAIL
            if (pfId && tplFail) {
              await sendKakaoMessage(env, {
                to: sub.phone,
                templateId: tplFail,
                pfId,
                variables: {
                  '#{name}': sub.name || '고객',
                  '#{plan}': (sub.plan || '').toUpperCase(),
                  '#{message}': '결제 실패가 7일간 지속되어 구독이 정지되었습니다.',
                },
              })
            }
          }
        } else {
          // 3일 후 재시도
          const retryDate = new Date(today)
          retryDate.setDate(retryDate.getDate() + 3)

          await env.DB.prepare(`
            UPDATE subscriptions SET
              status = 'past_due',
              next_billing_date = ?,
              notes = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            retryDate.toISOString(),
            wasAlreadyPastDue ? sub.notes : `past_due_since:${todayISO}`,
            sub.id,
          ).run()

          retried++
        }

        await updatePaymentFailure(env, sub.toss_order_id || '', 'CHARGE_FAIL', errMsg)
      }
    }

    // 6) cron 로그 마감
    await env.DB.prepare(`
      UPDATE cron_runs SET
        finished_at = CURRENT_TIMESTAMP,
        status = ?,
        domains_processed = ?,
        domains_failed = ?,
        cost_usd = ?,
        error_log = ?
      WHERE id = ?
    `).bind(
      chargedFailed === 0 ? 'success' : 'partial',
      chargedSuccess,
      chargedFailed,
      totalRevenue / 1000,  // 천원 단위 매출 기록 (cost_usd 필드 재활용)
      errors.length > 0 ? errors.slice(0, 20).join('\n') : null,
      cronRunId,
    ).run()
  } catch (e: any) {
    await env.DB.prepare(`
      UPDATE cron_runs SET
        finished_at = CURRENT_TIMESTAMP,
        status = 'failed',
        error_log = ?
      WHERE id = ?
    `).bind(`FATAL: ${e.message}`, cronRunId).run()
    throw e
  }

  return {
    charged_success: chargedSuccess,
    charged_failed: chargedFailed,
    retried,
    expired,
    total_revenue_krw: totalRevenue,
    errors,
  }
}
