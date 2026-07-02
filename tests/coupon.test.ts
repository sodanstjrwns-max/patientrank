// 쿠폰 검증/사용 로직 단위 테스트 (D1 목 사용)
import { describe, it, expect, vi } from 'vitest'
import { validateCoupon, consumeCoupon } from '../src/lib/toss-payments'

// D1 목 팩토리: first()가 반환할 쿠폰 행을 주입
function mockEnv(couponRow: any) {
  const run = vi.fn(async () => ({ meta: {} }))
  const first = vi.fn(async () => couponRow)
  const bind = vi.fn(() => ({ first, run }))
  const prepare = vi.fn((_sql: string) => ({ bind }))
  return { env: { DB: { prepare } } as any, prepare, bind, first, run }
}

const BASE = 149_000 // pro 플랜

describe('validateCoupon', () => {
  it('존재하지 않는 쿠폰 → invalid, 원가 유지', async () => {
    const { env } = mockEnv(null)
    const r = await validateCoupon(env, 'NOPE', BASE)
    expect(r.valid).toBe(false)
    expect(r.final_price).toBe(BASE)
    expect(r.reason).toContain('존재하지')
  })

  it('percent 쿠폰 30% → 104,300원', async () => {
    const { env } = mockEnv({
      code: 'LAUNCH30', discount_type: 'percent', discount_value: 30,
      max_uses: null, current_uses: 0, valid_from: null, valid_until: null, is_active: 1,
    })
    const r = await validateCoupon(env, 'LAUNCH30', BASE)
    expect(r.valid).toBe(true)
    expect(r.discount_rate).toBe(30)
    expect(r.final_price).toBe(104_300)
  })

  it('fixed 쿠폰 50,000원 할인 → 99,000원, 할인율 34%', async () => {
    const { env } = mockEnv({
      code: 'FIX50K', discount_type: 'fixed', discount_value: 50_000,
      max_uses: null, current_uses: 0, valid_from: null, valid_until: null, is_active: 1,
    })
    const r = await validateCoupon(env, 'FIX50K', BASE)
    expect(r.valid).toBe(true)
    expect(r.final_price).toBe(99_000)
    expect(r.discount_rate).toBe(34)
  })

  it('fixed 할인이 원가보다 커도 음수 방지 (0원 하한)', async () => {
    const { env } = mockEnv({
      code: 'HUGE', discount_type: 'fixed', discount_value: 999_999,
      max_uses: null, current_uses: 0, valid_from: null, valid_until: null, is_active: 1,
    })
    const r = await validateCoupon(env, 'HUGE', BASE)
    expect(r.final_price).toBe(0)
  })

  it('사용 횟수 초과 → invalid', async () => {
    const { env } = mockEnv({
      code: 'FULL', discount_type: 'percent', discount_value: 10,
      max_uses: 5, current_uses: 5, valid_from: null, valid_until: null, is_active: 1,
    })
    const r = await validateCoupon(env, 'FULL', BASE)
    expect(r.valid).toBe(false)
    expect(r.reason).toContain('횟수')
  })

  it('만료된 쿠폰 → invalid', async () => {
    const { env } = mockEnv({
      code: 'OLD', discount_type: 'percent', discount_value: 10,
      max_uses: null, current_uses: 0, valid_from: null, valid_until: '2020-01-01', is_active: 1,
    })
    const r = await validateCoupon(env, 'OLD', BASE)
    expect(r.valid).toBe(false)
    expect(r.reason).toContain('만료')
  })

  it('아직 시작 전 쿠폰 → invalid', async () => {
    const { env } = mockEnv({
      code: 'FUTURE', discount_type: 'percent', discount_value: 10,
      max_uses: null, current_uses: 0, valid_from: '2099-01-01', valid_until: null, is_active: 1,
    })
    const r = await validateCoupon(env, 'FUTURE', BASE)
    expect(r.valid).toBe(false)
    expect(r.reason).toContain('아직')
  })

  it('소문자 입력도 대문자로 정규화하여 조회', async () => {
    const { env, bind } = mockEnv({
      code: 'LAUNCH30', discount_type: 'percent', discount_value: 30,
      max_uses: null, current_uses: 0, valid_from: null, valid_until: null, is_active: 1,
    })
    await validateCoupon(env, 'launch30', BASE)
    expect(bind).toHaveBeenCalledWith('LAUNCH30')
  })
})

describe('consumeCoupon', () => {
  it('결제 성공 시 current_uses 증가 UPDATE 실행', async () => {
    const { env, prepare, bind, run } = mockEnv(null)
    await consumeCoupon(env, 'launch30')
    expect(prepare.mock.calls[0][0]).toContain('current_uses')
    expect(bind).toHaveBeenCalledWith('LAUNCH30')
    expect(run).toHaveBeenCalled()
  })
})
