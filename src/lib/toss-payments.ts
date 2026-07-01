// ===================================================================
// 토스페이먼츠 (TossPayments) 서버사이드 SDK
// - 결제 승인 (confirmPayment)
// - 빌링키 발급 (issueBillingKey)
// - 빌링키로 자동결제 (chargeBillingKey)
// - 결제 취소 (cancelPayment)
//
// Docs: https://docs.tosspayments.com/reference
// ===================================================================

import type { Bindings } from './types'

const TOSS_API_BASE = 'https://api.tosspayments.com/v1'

// Basic Auth: base64(secretKey + ':')
function buildAuthHeader(secretKey: string): string {
  // Cloudflare Workers btoa는 ASCII만 → secretKey는 ASCII이므로 OK
  return 'Basic ' + btoa(secretKey + ':')
}

// ─────────────────────────────────────────────────────────────────
// 1. 결제 승인 (결제창 결제 후 redirect → 서버에서 호출)
// ─────────────────────────────────────────────────────────────────
export interface TossConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export interface TossConfirmResponse {
  paymentKey: string
  orderId: string
  orderName: string
  status: string
  totalAmount: number
  method: string
  approvedAt: string
  receipt?: { url: string }
  card?: {
    company: string
    number: string
    installmentPlanMonths: number
    cardType: string
  }
  failure?: { code: string; message: string }
}

export async function confirmPayment(
  env: Bindings,
  req: TossConfirmRequest,
): Promise<TossConfirmResponse> {
  const secretKey = env.TOSS_SECRET_KEY
  if (!secretKey) throw new Error('TOSS_SECRET_KEY 미설정')

  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: buildAuthHeader(secretKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  const data = (await res.json()) as TossConfirmResponse
  if (!res.ok) {
    throw new Error(
      `Toss confirmPayment failed: ${data.failure?.code} ${data.failure?.message}`,
    )
  }
  return data
}

// ─────────────────────────────────────────────────────────────────
// 2. 빌링키 발급 (자동결제용 카드 등록)
// ─────────────────────────────────────────────────────────────────
export interface TossBillingAuthRequest {
  customerKey: string
  authKey: string
}

export interface TossBillingAuthResponse {
  mId: string
  customerKey: string
  authenticatedAt: string
  method: string
  billingKey: string
  card: {
    company: string
    number: string
    cardType: string
    ownerType: string
  }
}

export async function issueBillingKey(
  env: Bindings,
  req: TossBillingAuthRequest,
): Promise<TossBillingAuthResponse> {
  const secretKey = env.TOSS_SECRET_KEY
  if (!secretKey) throw new Error('TOSS_SECRET_KEY 미설정')

  const res = await fetch(`${TOSS_API_BASE}/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      Authorization: buildAuthHeader(secretKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  const data = (await res.json()) as any
  if (!res.ok) {
    throw new Error(`Toss issueBillingKey failed: ${data.code} ${data.message}`)
  }
  return data as TossBillingAuthResponse
}

// ─────────────────────────────────────────────────────────────────
// 3. 빌링키로 자동결제 (월간 청구 시 사용)
// ─────────────────────────────────────────────────────────────────
export interface TossChargeBillingRequest {
  billingKey: string
  customerKey: string
  amount: number
  orderId: string
  orderName: string
  customerEmail?: string
  customerName?: string
}

export async function chargeBillingKey(
  env: Bindings,
  req: TossChargeBillingRequest,
): Promise<TossConfirmResponse> {
  const secretKey = env.TOSS_SECRET_KEY
  if (!secretKey) throw new Error('TOSS_SECRET_KEY 미설정')

  const { billingKey, ...payload } = req
  const res = await fetch(`${TOSS_API_BASE}/billing/${billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: buildAuthHeader(secretKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await res.json()) as TossConfirmResponse
  if (!res.ok) {
    throw new Error(
      `Toss chargeBillingKey failed: ${data.failure?.code} ${data.failure?.message}`,
    )
  }
  return data
}

// ─────────────────────────────────────────────────────────────────
// 4. 결제 취소
// ─────────────────────────────────────────────────────────────────
export async function cancelPayment(
  env: Bindings,
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number, // 부분 취소 시
): Promise<TossConfirmResponse> {
  const secretKey = env.TOSS_SECRET_KEY
  if (!secretKey) throw new Error('TOSS_SECRET_KEY 미설정')

  const body: any = { cancelReason }
  if (cancelAmount !== undefined) body.cancelAmount = cancelAmount

  const res = await fetch(`${TOSS_API_BASE}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: buildAuthHeader(secretKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as TossConfirmResponse
  if (!res.ok) {
    throw new Error(
      `Toss cancelPayment failed: ${data.failure?.code} ${data.failure?.message}`,
    )
  }
  return data
}

// ─────────────────────────────────────────────────────────────────
// 5. 주문 ID 생성 (UUID v4 기반, 64자 이내)
// ─────────────────────────────────────────────────────────────────
export function generateOrderId(): string {
  // patientrank-{timestamp}-{random8}
  const ts = Date.now().toString(36)
  const rnd = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  return `pr-${ts}-${rnd}`
}

// ─────────────────────────────────────────────────────────────────
// 6. 결제 정보 D1 저장
// ─────────────────────────────────────────────────────────────────
export async function savePayment(
  env: Bindings,
  userId: number,
  subscriptionId: number | null,
  orderId: string,
  amount: number,
  reason: string,
): Promise<number> {
  const result = await env.DB.prepare(
    `INSERT INTO payments (user_id, subscription_id, toss_order_id, amount_krw, status, reason)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
  )
    .bind(userId, subscriptionId, orderId, amount, reason)
    .run()
  return result.meta.last_row_id as number
}

export async function updatePaymentSuccess(
  env: Bindings,
  orderId: string,
  resp: TossConfirmResponse,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE payments SET
      toss_payment_key = ?,
      toss_transaction_key = ?,
      status = ?,
      method = ?,
      card_company = ?,
      card_number_masked = ?,
      receipt_url = ?,
      raw_response = ?,
      paid_at = CURRENT_TIMESTAMP
     WHERE toss_order_id = ?`,
  )
    .bind(
      resp.paymentKey,
      (resp as any).transactionKey || null,
      // 토스 응답은 'DONE' — 내부 집계는 'paid'로 통일 (원본은 raw_response에 보존)
      resp.status === 'DONE' ? 'paid' : resp.status.toLowerCase(),
      resp.method,
      resp.card?.company || null,
      resp.card?.number || null,
      resp.receipt?.url || null,
      JSON.stringify(resp),
      orderId,
    )
    .run()
}

export async function updatePaymentFailure(
  env: Bindings,
  orderId: string,
  failureCode: string,
  failureMessage: string,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE payments SET
      status = 'ABORTED',
      failure_code = ?,
      failure_message = ?
     WHERE toss_order_id = ?`,
  )
    .bind(failureCode, failureMessage, orderId)
    .run()
}

// ─────────────────────────────────────────────────────────────────
// 7. 구독 생성/갱신
// ─────────────────────────────────────────────────────────────────
export async function upsertSubscription(
  env: Bindings,
  userId: number,
  plan: string,
  priceKrw: number,
  discountRate: number,
  finalPriceKrw: number,
  billingKey: string | null,
  customerKey: string | null,
  cardCompany: string | null,
  cardNumberMasked: string | null,
): Promise<number> {
  // 활성 구독 있으면 업데이트, 없으면 생성
  const existing = await env.DB.prepare(
    `SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' LIMIT 1`,
  )
    .bind(userId)
    .first<{ id: number }>()

  const now = new Date()
  const nextBilling = new Date(now)
  nextBilling.setMonth(nextBilling.getMonth() + 1)

  if (existing) {
    await env.DB.prepare(
      `UPDATE subscriptions SET
        plan = ?, price_krw = ?, discount_rate = ?, final_price_krw = ?,
        toss_billing_key = COALESCE(?, toss_billing_key),
        toss_customer_key = COALESCE(?, toss_customer_key),
        toss_card_company = COALESCE(?, toss_card_company),
        toss_card_number_masked = COALESCE(?, toss_card_number_masked),
        current_period_start = ?,
        current_period_end = ?,
        next_billing_date = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
      .bind(
        plan,
        priceKrw,
        discountRate,
        finalPriceKrw,
        billingKey,
        customerKey,
        cardCompany,
        cardNumberMasked,
        now.toISOString(),
        nextBilling.toISOString(),
        nextBilling.toISOString(),
        existing.id,
      )
      .run()
    return existing.id
  } else {
    const result = await env.DB.prepare(
      `INSERT INTO subscriptions
        (user_id, plan, status, price_krw, discount_rate, final_price_krw,
         billing_cycle, toss_billing_key, toss_customer_key,
         toss_card_company, toss_card_number_masked,
         current_period_start, current_period_end, next_billing_date)
       VALUES (?, ?, 'active', ?, ?, ?, 'monthly', ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        userId,
        plan,
        priceKrw,
        discountRate,
        finalPriceKrw,
        billingKey,
        customerKey,
        cardCompany,
        cardNumberMasked,
        now.toISOString(),
        nextBilling.toISOString(),
        nextBilling.toISOString(),
      )
      .run()
    return result.meta.last_row_id as number
  }
}

// ─────────────────────────────────────────────────────────────────
// 8. 쿠폰 검증 + 할인 적용
// ─────────────────────────────────────────────────────────────────
/**
 * 쿠폰 사용 처리 — 결제 성공 시에만 호출 (current_uses 증가)
 */
export async function consumeCoupon(env: Bindings, code: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE coupons SET current_uses = COALESCE(current_uses, 0) + 1 WHERE code = ? AND is_active = 1`,
  )
    .bind(code.toUpperCase())
    .run()
}

export async function validateCoupon(
  env: Bindings,
  code: string,
  basePriceKrw: number,
): Promise<{ valid: boolean; discount_rate: number; final_price: number; coupon?: any; reason?: string }> {
  const coupon = await env.DB.prepare(
    `SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1`,
  )
    .bind(code.toUpperCase())
    .first<any>()

  if (!coupon) {
    return { valid: false, discount_rate: 0, final_price: basePriceKrw, reason: '존재하지 않는 쿠폰입니다.' }
  }

  // 사용 횟수 체크
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, discount_rate: 0, final_price: basePriceKrw, reason: '쿠폰 사용 횟수가 초과되었습니다.' }
  }

  // 유효 기간 체크
  const now = new Date()
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { valid: false, discount_rate: 0, final_price: basePriceKrw, reason: '아직 사용 기간이 아닙니다.' }
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, discount_rate: 0, final_price: basePriceKrw, reason: '만료된 쿠폰입니다.' }
  }

  // 할인 계산
  let finalPrice: number
  let discountRate: number
  if (coupon.discount_type === 'percent') {
    discountRate = coupon.discount_value
    finalPrice = Math.round(basePriceKrw * (100 - coupon.discount_value) / 100)
  } else {
    finalPrice = Math.max(basePriceKrw - coupon.discount_value, 0)
    discountRate = Math.round((1 - finalPrice / basePriceKrw) * 100)
  }

  return { valid: true, discount_rate: discountRate, final_price: finalPrice, coupon }
}
