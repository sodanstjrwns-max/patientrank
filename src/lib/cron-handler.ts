// Day 1-C, 1-D: Cron Trigger 핸들러
// 매주 월요일 06:00 KST (= UTC 21:00 일요일)
// 1) 모든 유료 가입자 도메인 자동 재스캔
// 2) 시계열 스냅샷 저장
// 3) AI 액션 가이드 자동 생성

import type { Bindings } from './types'
import { runScan } from './scan-service'
import { generateActionGuide, saveActionGuide } from './ai-action-guide'
import { getWeeklyDelta } from './snapshot-service'
import { sendWeeklyReport } from './kakao-notify'
import { generatePrescriptions } from './content-prescription'

export async function runWeeklyRescanCron(env: Bindings): Promise<{
  domains_processed: number
  domains_failed: number
  cost_usd: number
  kakao_sent: number
  kakao_failed: number
}> {
  const startedAt = new Date().toISOString()
  const appUrl = (env as any).APP_URL || 'https://patientrank.pages.dev'

  // Cron 실행 로그 시작
  const logRes = await env.DB.prepare(`
    INSERT INTO cron_runs (job_name, started_at, status)
    VALUES ('weekly_rescan', ?, 'running')
  `).bind(startedAt).run()
  const cronRunId = Number(logRes.meta.last_row_id)

  let domainsProcessed = 0
  let domainsFailed = 0
  let totalCost = 0
  let kakaoSent = 0
  let kakaoFailed = 0
  const errors: string[] = []

  try {
    // 1) 유료 가입자 + 어드민 대상 (Free는 수동 스캔만)
    //    phone 컬럼도 함께 가져와서 알림톡 발송 결정
    const users = await env.DB.prepare(`
      SELECT DISTINCT u.id, u.email, u.name, u.phone, u.plan, u.is_admin
      FROM users u
      WHERE u.plan IN ('basic', 'pro', 'agency') OR u.is_admin = 1
    `).all<{ id: number; email: string; name: string | null; phone: string | null; plan: string; is_admin: number }>()

    for (const user of users.results || []) {
      // 각 유저의 최근 스캔 도메인 가져오기 (중복 제거, 대표 도메인 1개)
      const scans = await env.DB.prepare(`
        SELECT DISTINCT url
        FROM scans
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `).bind(user.id).all<{ url: string }>()

      const scansList = scans.results || []
      // 카카오 발송용: 첫 번째(대표) 도메인의 결과만 저장 → 1유저당 1톡
      let primaryDelta: any = null
      let primaryDomain = ''
      let primaryScanId = 0
      let primaryTopRx = '' // 이번 주 1순위 콘텐츠 처방

      for (let i = 0; i < scansList.length; i++) {
        const s = scansList[i]
        try {
          // 재스캔 (longtail은 비용 절감을 위해 제외, 메인 KPI만)
          const summary = await runScan(env, s.url, {
            userId: user.id,
            maxRank: 100,
            longtail: false,
          })

          // 첫 번째 도메인은 카카오 발송 대상으로 기록
          if (i === 0) {
            primaryDomain = summary.domain
            primaryScanId = summary.scanId
            try {
              primaryDelta = await getWeeklyDelta(env, summary.domain)
            } catch (e) { /* 첫 스캔이면 delta 없음 */ }

            // 콘텐츠 처방전: 1순위 처방을 카카오 리포트에 포함
            try {
              const rx = await generatePrescriptions(env, summary, { limit: 3, userId: user.id })
              if (rx.prescriptions.length > 0) {
                const top = rx.prescriptions[0]
                primaryTopRx = `'${top.keyword}' — ${top.headline}`
                // 카카오 변수 길이 안전한도 (알림톡 변수 최대 길이 대비)
                if (primaryTopRx.length > 80) primaryTopRx = primaryTopRx.slice(0, 77) + '...'
              }
            } catch (rxErr: any) {
              console.error(`Prescription failed for ${s.url}:`, rxErr.message)
            }
          }

          // 도메인 평가가 있으면 AI 가이드도 생성 (Pro/Agency만)
          if (user.plan === 'pro' || user.plan === 'agency' || user.is_admin === 1) {
            try {
              const result = await generateActionGuide(env, summary)
              await saveActionGuide(env, {
                user_id: user.id,
                scan_id: summary.scanId,
                domain: summary.domain,
                guide: result.guide,
                cost_usd: result.cost_usd,
                tokens: result.tokens,
              })
              totalCost += result.cost_usd
            } catch (aiErr: any) {
              console.error(`AI guide failed for ${s.url}:`, aiErr.message)
              errors.push(`AI:${s.url}: ${aiErr.message}`)
            }
          }

          domainsProcessed++
        } catch (e: any) {
          domainsFailed++
          errors.push(`SCAN:${s.url}: ${e.message}`)
          console.error(`Scan failed for ${s.url}:`, e)
        }
      }

      // ─────────────────────────────────────────────────────
      // Day 5-B: 주간 카카오 리포트 발송 (대표 도메인 기준 1유저당 1톡)
      // ─────────────────────────────────────────────────────
      if (user.phone && primaryDelta && primaryDelta.previous) {
        try {
          const d = primaryDelta.delta
          const scoreChange = d.top10_count >= 0 ? `+${d.top10_count}점` : `${d.top10_count}점`
          const top10Change = `TOP10 ${d.top10_count >= 0 ? '+' : ''}${d.top10_count}개`
          const resultUrl = `${appUrl}/result/${primaryScanId}`

          const kakaoRes = await sendWeeklyReport(env, user.id, user.phone, {
            name: user.name || user.email.split('@')[0],
            domain: primaryDomain,
            score_change: scoreChange,
            top10_change: top10Change,
            result_url: resultUrl,
            top_rx: primaryTopRx || undefined,
          })
          if (kakaoRes.success) kakaoSent++
          else kakaoFailed++
        } catch (kakaoErr: any) {
          kakaoFailed++
          errors.push(`KAKAO:user_${user.id}: ${kakaoErr.message}`)
        }
      }
    }

    // 로그 마감
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
      domainsFailed === 0 ? 'success' : 'partial',
      domainsProcessed,
      domainsFailed,
      totalCost,
      errors.length > 0 ? errors.slice(0, 20).join('\n') : null,
      cronRunId,
    ).run()
  } catch (e: any) {
    // 치명적 실패
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
    domains_processed: domainsProcessed,
    domains_failed: domainsFailed,
    cost_usd: totalCost,
    kakao_sent: kakaoSent,
    kakao_failed: kakaoFailed,
  }
}
