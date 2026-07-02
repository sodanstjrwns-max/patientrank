// 플랜 가격 + 쿠폰 적용 계산 (checkout / payment init / payment success 3곳 공용)
// 중복 계산 로직을 한 곳으로 모아 "화면 가격 ≠ 청구 가격" 사고를 구조적으로 방지한다.
import type { Bindings } from './types'
import { PLAN_PRICES, type PlanName } from './types'
import { validateCoupon } from './toss-payments'

export interface ResolvedPrice {
  plan: PlanName
  basePrice: number
  finalPrice: number
  discountRate: number
  couponCode: string | null
  couponValid: boolean
}

/** 결제 가능한 유료 플랜인지 검증 */
export function isPaidPlan(plan: string): plan is Exclude<PlanName, 'free'> {
  return plan === 'basic' || plan === 'pro' || plan === 'agency'
}

/**
 * 플랜 + 쿠폰 → 최종 청구 금액 계산.
 * 쿠폰이 invalid면 조용히 원가로 폴백 (couponValid=false로 구분 가능).
 */
export async function resolvePlanPrice(
  env: Bindings,
  plan: PlanName,
  couponCodeRaw?: string | null,
): Promise<ResolvedPrice> {
  const basePrice = PLAN_PRICES[plan]
  const couponCode = (couponCodeRaw || '').trim().toUpperCase() || null

  let finalPrice: number = basePrice
  let discountRate = 0
  let couponValid = false

  if (couponCode) {
    const v = await validateCoupon(env, couponCode, basePrice)
    if (v.valid) {
      finalPrice = v.final_price
      discountRate = v.discount_rate
      couponValid = true
    }
  }

  return { plan, basePrice, finalPrice, discountRate, couponCode, couponValid }
}
