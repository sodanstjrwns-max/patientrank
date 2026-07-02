// lib/pricing.ts — 플랜/쿠폰 가격 계산 단일 소스 테스트
import { describe, it, expect, vi } from 'vitest'
import { resolvePlanPrice, isPaidPlan } from '../src/lib/pricing'
import { PLAN_PRICES } from '../src/lib/types'

function mockEnv(couponRow: any) {
  const run = vi.fn(async () => ({ meta: {} }))
  const first = vi.fn(async () => couponRow)
  const bind = vi.fn(() => ({ first, run }))
  const prepare = vi.fn((_sql: string) => ({ bind }))
  return { env: { DB: { prepare } } as any, prepare, bind, first, run }
}

describe('isPaidPlan', () => {
  it('basic/pro/agency만 결제 가능', () => {
    expect(isPaidPlan('basic')).toBe(true)
    expect(isPaidPlan('pro')).toBe(true)
    expect(isPaidPlan('agency')).toBe(true)
  })
  it('free/이상한 값은 거부', () => {
    expect(isPaidPlan('free')).toBe(false)
    expect(isPaidPlan('admin')).toBe(false)
    expect(isPaidPlan('')).toBe(false)
    expect(isPaidPlan('PRO')).toBe(false) // 대문자는 호출 전에 lowercase 필요
  })
})

describe('resolvePlanPrice', () => {
  it('쿠폰 없음 → 원가 그대로', async () => {
    const { env } = mockEnv(null)
    const r = await resolvePlanPrice(env, 'pro')
    expect(r.basePrice).toBe(PLAN_PRICES.pro)
    expect(r.finalPrice).toBe(PLAN_PRICES.pro)
    expect(r.discountRate).toBe(0)
    expect(r.couponCode).toBeNull()
    expect(r.couponValid).toBe(false)
  })

  it('유효한 percent 쿠폰 50% → 반값', async () => {
    const { env } = mockEnv({
      code: 'PATIENTFUNNEL50',
      discount_type: 'percent',
      discount_value: 50,
      is_active: 1,
      max_uses: null,
      current_uses: 0,
      valid_until: null,
    })
    const r = await resolvePlanPrice(env, 'pro', 'patientfunnel50')
    expect(r.couponValid).toBe(true)
    expect(r.couponCode).toBe('PATIENTFUNNEL50') // 대문자 정규화
    expect(r.finalPrice).toBe(Math.round(PLAN_PRICES.pro * 0.5))
    expect(r.discountRate).toBeGreaterThan(0)
  })

  it('존재하지 않는 쿠폰 → 조용히 원가 폴백 (couponValid=false)', async () => {
    const { env } = mockEnv(null)
    const r = await resolvePlanPrice(env, 'basic', 'NOPE123')
    expect(r.couponValid).toBe(false)
    expect(r.finalPrice).toBe(PLAN_PRICES.basic)
  })

  it('공백/빈 쿠폰 문자열 → 쿠폰 조회 자체를 스킵', async () => {
    const { env, prepare } = mockEnv(null)
    const r = await resolvePlanPrice(env, 'pro', '   ')
    expect(r.couponCode).toBeNull()
    expect(prepare).not.toHaveBeenCalled()
  })

  it('100% 쿠폰 → finalPrice 0 (첫 청구 생략 조건)', async () => {
    const { env } = mockEnv({
      code: 'BETA100',
      discount_type: 'percent',
      discount_value: 100,
      is_active: 1,
      max_uses: 50,
      current_uses: 3,
      valid_until: null,
    })
    const r = await resolvePlanPrice(env, 'pro', 'BETA100')
    expect(r.couponValid).toBe(true)
    expect(r.finalPrice).toBe(0)
  })
})
