// 결제 라우트 (토스페이먼츠) — checkout 페이지 / 쿠폰 검증 / 주문 init / 성공·실패 콜백 / 웹훅
// index.tsx에서 분리 (2026-07 코드 개선). 가격 계산은 lib/pricing.ts 단일 소스 사용.
import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { PLAN_PRICES, type PlanName } from '../lib/types'
import { getUserFromCookie } from '../lib/auth'
import { resolvePlanPrice, isPaidPlan } from '../lib/pricing'
import {
  validateCoupon,
  consumeCoupon,
  generateOrderId,
  savePayment,
  chargeBillingKey,
  issueBillingKey,
  updatePaymentFailure,
  upsertSubscription,
} from '../lib/toss-payments'
import { Layout, NavBar, Footer } from '../pages/layout'
import { CheckoutPage, PaymentSuccessPage, PaymentFailPage } from '../pages/checkout'

const payments = new Hono<{ Bindings: Bindings }>()

// ===================================================================
// 결제 페이지 (로그인 필수)
// ===================================================================
payments.get('/checkout', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login?next=/checkout')

  const planRaw = (c.req.query('plan') || 'pro').toLowerCase()
  if (!isPaidPlan(planRaw)) return c.redirect('/pricing')

  const price = await resolvePlanPrice(c.env, planRaw, c.req.query('coupon'))

  // TOSS_CLIENT_KEY 미설정 시 결제 진입 차단 (테스트 키 폴백은 실결제 사고 위험)
  const tossClientKey = (c.env as any).TOSS_CLIENT_KEY
  if (!tossClientKey) {
    return c.html(
      <Layout title="결제 준비 중 · Patient Rank">
        <NavBar loggedIn />
        <main class="max-w-xl mx-auto px-5 py-24 text-center">
          <div class="text-6xl mb-4">🛠️</div>
          <h1 class="text-2xl font-bold text-slate-900">결제 시스템 준비 중입니다</h1>
          <p class="mt-3 text-slate-600">잠시 후 다시 시도해주세요. 급하신 경우 카카오 채널로 문의 부탁드립니다.</p>
          <a href="/pricing" class="mt-8 inline-block px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600">가격 안내로</a>
        </main>
        <Footer />
      </Layout>,
      503,
    )
  }

  return c.html(
    <CheckoutPage
      plan={planRaw}
      basePrice={price.basePrice}
      finalPrice={price.finalPrice}
      discountRate={price.discountRate}
      couponCode={price.couponValid ? price.couponCode || undefined : undefined}
      user={{ id: user.id, email: user.email, name: user.name || undefined }}
      tossClientKey={tossClientKey}
    />
  )
})

// ===================================================================
// 쿠폰 검증 API
// ===================================================================
payments.post('/api/coupon/validate', async (c) => {
  try {
    const { code, plan } = await c.req.json<{ code: string; plan: PlanName }>()
    if (!code || !plan || !(plan in PLAN_PRICES)) {
      return c.json({ valid: false, reason: '잘못된 요청입니다.' }, 400)
    }
    const result = await validateCoupon(c.env, code, PLAN_PRICES[plan])
    return c.json(result)
  } catch (e: any) {
    return c.json({ valid: false, reason: e.message }, 500)
  }
})

// ===================================================================
// 주문 초기화 API (결제창 호출 직전)
// ===================================================================
payments.post('/api/payment/init', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.json({ error: '로그인이 필요합니다.' }, 401)
  try {
    const { plan, coupon } = await c.req.json<{ plan: PlanName; coupon?: string }>()
    if (!plan || !isPaidPlan(plan)) {
      return c.json({ error: '잘못된 플랜' }, 400)
    }
    const price = await resolvePlanPrice(c.env, plan, coupon)

    const orderId = generateOrderId()
    await savePayment(c.env, user.id, null, orderId, price.finalPrice, 'first_payment')
    return c.json({ order_id: orderId, amount: price.finalPrice })
  } catch (e: any) {
    return c.json({ error: e.message || '주문 생성 실패' }, 500)
  }
})

// ===================================================================
// 결제 성공 콜백 (토스 successUrl 리다이렉트 도착)
// ===================================================================
payments.get('/payment/success', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login')

  const orderId = c.req.query('order_id') || ''
  const authKey = c.req.query('authKey') || ''
  const customerKey = c.req.query('customerKey') || `customer-${user.id}`
  const planRaw = (c.req.query('plan') || 'pro').toLowerCase()

  if (!orderId || !authKey) {
    return c.html(<PaymentFailPage code="MISSING_PARAMS" message="주문 정보가 누락되었습니다." />)
  }
  if (!isPaidPlan(planRaw)) {
    return c.html(<PaymentFailPage code="INVALID_PLAN" message="잘못된 플랜입니다." />)
  }

  // 멱등성 가드: 이미 paid 처리된 주문이면 재청구 없이 성공 화면만
  // (새로고침/뒤로가기로 콜백 재진입 시 이중 청구 방지)
  const existing = await c.env.DB.prepare(
    `SELECT status, amount_krw FROM payments WHERE toss_order_id = ?`,
  ).bind(orderId).first<{ status: string; amount_krw: number }>()
  if (existing?.status === 'paid') {
    return c.html(<PaymentSuccessPage orderId={orderId} plan={planRaw} amount={Number(existing.amount_krw || 0)} />)
  }

  try {
    // 1) 빌링키 발급 (자동결제용 카드 등록)
    const billing = await issueBillingKey(c.env, { customerKey, authKey })

    // 2) 가격 재계산 (보안: 클라이언트 신뢰 금지)
    const price = await resolvePlanPrice(c.env, planRaw, c.req.query('coupon'))

    // 3) 첫 결제 즉시 청구 (0원 쿠폰이면 청구 생략 — 카드 등록만)
    let firstCharge: Awaited<ReturnType<typeof chargeBillingKey>> | null = null
    if (price.finalPrice > 0) {
      firstCharge = await chargeBillingKey(c.env, {
        billingKey: billing.billingKey,
        customerKey,
        amount: price.finalPrice,
        orderId,
        orderName: `Patient Rank ${planRaw.toUpperCase()} 월 구독`,
        customerEmail: user.email,
        customerName: user.name || undefined,
      })
    }

    // 4) 구독 활성화
    const subId = await upsertSubscription(
      c.env,
      user.id,
      planRaw,
      price.basePrice,
      price.discountRate,
      price.finalPrice,
      billing.billingKey,
      customerKey,
      billing.card.company,
      billing.card.number,
    )

    // 5) 결제 정보 업데이트 (status는 통일된 'paid' 사용)
    if (firstCharge) {
      await c.env.DB.prepare(
        `UPDATE payments SET subscription_id = ?, status = 'paid',
          toss_payment_key = ?, method = 'CARD',
          card_company = ?, card_number_masked = ?,
          receipt_url = ?, paid_at = CURRENT_TIMESTAMP
         WHERE toss_order_id = ?`
      ).bind(
        subId,
        firstCharge.paymentKey || null,
        billing.card.company,
        billing.card.number,
        firstCharge.receipt?.url || null,
        orderId,
      ).run()
    } else {
      // 100% 쿠폰: 청구 없이 결제 레코드는 0원 paid 처리
      await c.env.DB.prepare(
        `UPDATE payments SET subscription_id = ?, status = 'paid',
          method = 'CARD', card_company = ?, card_number_masked = ?, paid_at = CURRENT_TIMESTAMP
         WHERE toss_order_id = ?`
      ).bind(subId, billing.card.company, billing.card.number, orderId).run()
    }

    // 6) 쿠폰 사용 카운트 증가 (결제 성공 시에만)
    if (price.couponValid && price.couponCode) {
      try {
        await consumeCoupon(c.env, price.couponCode)
      } catch (e) {
        console.error('coupon consume failed:', e)
      }
    }

    // 7) 유저 플랜 업그레이드
    await c.env.DB.prepare(`UPDATE users SET plan = ? WHERE id = ?`)
      .bind(planRaw, user.id).run()

    return c.html(<PaymentSuccessPage orderId={orderId} plan={planRaw} amount={price.finalPrice} />)
  } catch (e: any) {
    await updatePaymentFailure(c.env, orderId, 'BILLING_FAIL', e.message || 'unknown')
    return c.html(<PaymentFailPage code="BILLING_FAIL" message={e.message} />)
  }
})

// 결제 실패 콜백
payments.get('/payment/fail', (c) => {
  const code = c.req.query('code') || undefined
  const message = c.req.query('message') || undefined
  return c.html(<PaymentFailPage code={code} message={message} />)
})

// ===================================================================
// 토스페이먼츠 웹훅 — 카드사/토스 측 상태 변경(취소·환불·실패) DB 동기화
// 등록: 토스 개발자센터 > 웹훅 > https://patientrank.kr/api/webhook/toss
// 검증: 이벤트를 신뢰하지 않고 paymentKey로 토스 API 재조회 (위조 방지)
// ===================================================================
payments.post('/api/webhook/toss', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ ok: false, error: 'INVALID_JSON' }, 400)
  }

  // 토스 웹훅 페이로드: { eventType, createdAt, data: { paymentKey, orderId, status, ... } }
  const eventType = String(body?.eventType || '')
  const data = body?.data || {}
  const paymentKey = String(data?.paymentKey || '')
  const orderId = String(data?.orderId || '')

  console.log(`[toss-webhook] ${eventType} order=${orderId}`)
  if (!paymentKey && !orderId) return c.json({ ok: true, skipped: 'no identifiers' })

  const secretKey = (c.env as any).TOSS_SECRET_KEY
  if (!secretKey) return c.json({ ok: false, error: 'NOT_CONFIGURED' }, 503)

  try {
    // 위조 방지: 웹훅 내용을 믿지 않고 토스 API에서 결제 상태 재조회
    const lookupUrl = paymentKey
      ? `https://api.tosspayments.com/v1/payments/${paymentKey}`
      : `https://api.tosspayments.com/v1/payments/orders/${orderId}`
    const res = await fetch(lookupUrl, {
      headers: { Authorization: 'Basic ' + btoa(secretKey + ':') },
    })
    if (!res.ok) {
      console.error(`[toss-webhook] lookup failed ${res.status}`)
      return c.json({ ok: false, error: 'LOOKUP_FAILED' }, 502)
    }
    const payment: any = await res.json()
    const tossStatus = String(payment?.status || '')
    const verifiedOrderId = String(payment?.orderId || orderId)

    // 상태 매핑 (내부 표준: paid / canceled / failed)
    let internal: string | null = null
    if (tossStatus === 'DONE') internal = 'paid'
    else if (tossStatus === 'CANCELED' || tossStatus === 'PARTIAL_CANCELED') internal = 'canceled'
    else if (['ABORTED', 'EXPIRED'].includes(tossStatus)) internal = 'failed'
    if (!internal) return c.json({ ok: true, skipped: `unhandled status ${tossStatus}` })

    if (internal === 'canceled') {
      const cancels = Array.isArray(payment?.cancels) ? payment.cancels : []
      const refundTotal = cancels.reduce((s: number, x: any) => s + Number(x?.cancelAmount || 0), 0)
      const lastReason = cancels.length ? String(cancels[cancels.length - 1]?.cancelReason || '') : ''
      await c.env.DB.prepare(
        `UPDATE payments SET status = 'canceled', refunded_at = CURRENT_TIMESTAMP,
           refund_amount_krw = ?, refund_reason = ?, raw_response = ?
         WHERE toss_order_id = ?`,
      ).bind(refundTotal, lastReason.slice(0, 200), JSON.stringify(payment).slice(0, 8000), verifiedOrderId).run()

      // 전액 취소면 해당 구독 past_due 처리 (다음 빌링 크론이 재청구/만료 판단)
      const payRow = await c.env.DB.prepare(
        `SELECT user_id, subscription_id, amount_krw FROM payments WHERE toss_order_id = ?`,
      ).bind(verifiedOrderId).first<any>()
      if (payRow?.subscription_id && refundTotal >= Number(payRow.amount_krw || 0)) {
        await c.env.DB.prepare(
          `UPDATE subscriptions SET status = 'past_due', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        ).bind(payRow.subscription_id).run()
        console.log(`[toss-webhook] subscription ${payRow.subscription_id} → past_due (full refund)`)
      }
    } else {
      await c.env.DB.prepare(
        `UPDATE payments SET status = ?, raw_response = ? WHERE toss_order_id = ?`,
      ).bind(internal, JSON.stringify(payment).slice(0, 8000), verifiedOrderId).run()
    }

    return c.json({ ok: true, order_id: verifiedOrderId, status: internal })
  } catch (e: any) {
    console.error('[toss-webhook] error:', e)
    return c.json({ ok: false, error: e.message }, 500)
  }
})

export default payments
