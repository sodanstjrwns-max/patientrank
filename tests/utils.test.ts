// lib/utils.ts + beta-service 헬퍼 테스트
import { describe, it, expect } from 'vitest'
import { extractDomain, computeCounters, safeJsonParse, escapeHtml } from '../src/lib/utils'
import { isValidPatientFunnelCode, buildBetaInvite } from '../src/lib/beta-service'
import { normalizeDomain } from '../src/lib/competitor-service'

describe('extractDomain', () => {
  it('일반 URL에서 도메인 추출', () => {
    expect(extractDomain('https://www.bdbddc.com/about')).toBe('bdbddc.com')
    expect(extractDomain('http://bdbddc.com')).toBe('bdbddc.com')
    expect(extractDomain('bdbddc.com')).toBe('bdbddc.com')
  })
  it('잘못된 입력은 null', () => {
    expect(extractDomain('')).toBeNull()
    expect(extractDomain('not a url')).toBeNull()
  })
})

describe('normalizeDomain', () => {
  it('프로토콜/www/경로 제거', () => {
    expect(normalizeDomain('https://www.Example.com/path/')).toBe('example.com')
    expect(normalizeDomain('EXAMPLE.COM')).toBe('example.com')
  })
})

describe('computeCounters', () => {
  it('TOP3/10/30/100 카운트 + 트래픽 합산', () => {
    const kws = [
      { rank: 1, etv: 100 },
      { rank: 3, etv: 50 },
      { rank: 8, etv: 30 },
      { rank: 25, etv: 10 },
      { rank: 99, etv: 5 },
    ]
    const c = computeCounters(kws)
    expect(c.top3).toBe(2)
    expect(c.top10).toBe(3)
    expect(c.top30).toBe(4)
    expect(c.top100).toBe(5)
    expect(c.total).toBe(5)
    expect(c.estimated_traffic).toBe(195)
  })
  it('빈 배열은 전부 0', () => {
    const c = computeCounters([])
    expect(c.total).toBe(0)
    expect(c.estimated_traffic).toBe(0)
  })
})

describe('safeJsonParse', () => {
  it('정상 JSON 파싱', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 })
  })
  it('깨진 JSON/null은 폴백', () => {
    expect(safeJsonParse('not json', { fb: true })).toEqual({ fb: true })
    expect(safeJsonParse(null, [])).toEqual([])
  })
})

describe('escapeHtml', () => {
  it('XSS 위험 문자 이스케이프', () => {
    expect(escapeHtml('<script>alert(1)</script>')).not.toContain('<script>')
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })
})

describe('isValidPatientFunnelCode', () => {
  it('PF코드 형식 검증 (PF2024-12345)', () => {
    expect(isValidPatientFunnelCode('PF2024-12345')).toBe(true)
    expect(isValidPatientFunnelCode('pf2025-123')).toBe(true) // 대소문자 무관
  })
  it('잘못된 형식 거부', () => {
    expect(isValidPatientFunnelCode('PF-12345')).toBe(false)
    expect(isValidPatientFunnelCode('HELLO')).toBe(false)
    expect(isValidPatientFunnelCode(null)).toBe(false)
    expect(isValidPatientFunnelCode('')).toBe(false)
  })
})

describe('buildBetaInvite', () => {
  it('PF 수료생 → PATIENTFUNNEL50 쿠폰', () => {
    const r = buildBetaInvite({ APP_URL: 'https://patientrank.kr' } as any, 1)
    expect(r.couponCode).toBe('PATIENTFUNNEL50')
    expect(r.inviteUrl).toBe('https://patientrank.kr/checkout?plan=pro&coupon=PATIENTFUNNEL50')
  })
  it('일반 신청자 → BETA100 쿠폰', () => {
    const r = buildBetaInvite({} as any, 0)
    expect(r.couponCode).toBe('BETA100')
    expect(r.inviteUrl).toContain('coupon=BETA100')
  })
  it('APP_URL 트레일링 슬래시 제거', () => {
    const r = buildBetaInvite({ APP_URL: 'https://patientrank.kr/' } as any, false)
    expect(r.inviteUrl).toBe('https://patientrank.kr/checkout?plan=pro&coupon=BETA100')
  })
})
