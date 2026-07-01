// 콘텐츠 처방전 스코어링/분류 로직 단위 테스트
import { describe, it, expect } from 'vitest'
import { generatePrescriptions } from '../src/lib/content-prescription'
import type { ScanSummary } from '../src/lib/types'

// GSC 스냅샷 조회가 실패해도 무시되도록 설계됨 → DB 목은 throw
const envNoGsc = {
  DB: {
    prepare: () => ({ bind: () => ({ all: async () => { throw new Error('no table') } }) }),
  },
} as any

// GSC 데이터를 주입하는 목
function envWithGsc(rows: any[]) {
  return {
    DB: { prepare: () => ({ bind: () => ({ all: async () => ({ results: rows }) }) }) },
  } as any
}

function baseScan(partial: Partial<ScanSummary>): ScanSummary {
  return {
    scanId: 1,
    domain: 'example-dental.co.kr',
    keywords: [],
    ...partial,
  } as ScanSummary
}

const kw = (keyword: string, rank: number, volume: number | null) =>
  ({ keyword, rank, search_volume: volume, ranked_url: '/', etv: 0 }) as any

describe('generatePrescriptions — 분류 규칙', () => {
  it('11~30위 → quick_win, 4~10위(검색량 50+) → defend', async () => {
    const scan = baseScan({
      keywords: [
        kw('임플란트 가격', 15, 5000),   // quick_win
        kw('교정 후기', 7, 800),          // defend
        kw('스케일링', 2, 3000),          // TOP3 — 처방 대상 아님
        kw('사랑니 발치', 45, 100),       // 31위 밖 — quick_win 아님
      ],
    })
    const r = await generatePrescriptions(envNoGsc, scan)
    const types = Object.fromEntries(r.prescriptions.map((p) => [p.keyword, p.type]))
    expect(types['임플란트 가격']).toBe('quick_win')
    expect(types['교정 후기']).toBe('defend')
    expect(types['스케일링']).toBeUndefined()
    expect(types['사랑니 발치']).toBeUndefined()
  })

  it('경쟁사 TOP10 + 우리 부재 → gap_attack', async () => {
    const scan = baseScan({
      keyword_gaps: [
        { keyword: '치아미백 비용', competitor_domain: 'rival.co.kr', competitor_rank: 3, our_rank: null, search_volume: 2000 },
        { keyword: '레진 치료', competitor_domain: 'rival.co.kr', competitor_rank: 15, our_rank: null, search_volume: 500 }, // 경쟁사도 10위 밖 → 제외
      ] as any,
    })
    const r = await generatePrescriptions(envNoGsc, scan)
    expect(r.prescriptions.some((p) => p.type === 'gap_attack' && p.keyword === '치아미백 비용')).toBe(true)
    expect(r.prescriptions.some((p) => p.keyword === '레진 치료')).toBe(false)
  })

  it('랭킹 없는 롱테일 → new_content (matrix 소스 가산점)', async () => {
    const scan = baseScan({
      longtail_keywords: [
        { keyword: '홍성 라미네이트', rank: null, search_volume: 90, source: 'matrix' },
        { keyword: '서울 임플란트 잘하는곳', rank: null, search_volume: 90, source: 'api' },
      ] as any,
    })
    const r = await generatePrescriptions(envNoGsc, scan)
    const matrix = r.prescriptions.find((p) => p.keyword === '홍성 라미네이트')!
    const api = r.prescriptions.find((p) => p.keyword === '서울 임플란트 잘하는곳')!
    expect(matrix.type).toBe('new_content')
    expect(matrix.score).toBeGreaterThan(api.score) // matrix 가산점 +8 vs +4
  })

  it('GSC 저CTR (노출 100+, 기대치 미달) → ctr_fix', async () => {
    const env = envWithGsc([
      { keyword: '치과 야간진료', clicks: 2, impressions: 1000, ctr: 0.002, avg_position: 5 }, // 기대 3% >> 0.2%
      { keyword: '충치 치료', clicks: 50, impressions: 500, ctr: 0.1, avg_position: 5 },       // 정상 CTR → 제외
    ])
    const r = await generatePrescriptions(env, baseScan({}))
    expect(r.prescriptions.some((p) => p.type === 'ctr_fix' && p.keyword === '치과 야간진료')).toBe(true)
    expect(r.prescriptions.some((p) => p.keyword === '충치 치료')).toBe(false)
  })
})

describe('generatePrescriptions — 스코어링/정렬/중복', () => {
  it('검색량 클수록 스코어 높음 (로그 스케일)', async () => {
    const scan = baseScan({
      keywords: [kw('키워드A', 15, 10000), kw('키워드B', 15, 100)],
    })
    const r = await generatePrescriptions(envNoGsc, scan)
    const a = r.prescriptions.find((p) => p.keyword === '키워드A')!
    const b = r.prescriptions.find((p) => p.keyword === '키워드B')!
    expect(a.score).toBeGreaterThan(b.score)
  })

  it('11~20위가 21~30위보다 진입 확률 가산점 높음', async () => {
    const scan = baseScan({
      keywords: [kw('가까운키워드', 15, 1000), kw('먼키워드', 25, 1000)],
    })
    const r = await generatePrescriptions(envNoGsc, scan)
    const near = r.prescriptions.find((p) => p.keyword === '가까운키워드')!
    const far = r.prescriptions.find((p) => p.keyword === '먼키워드')!
    expect(near.score).toBeGreaterThan(far.score)
  })

  it('스코어 내림차순 정렬 + limit 적용', async () => {
    const scan = baseScan({
      keywords: Array.from({ length: 20 }, (_, i) => kw(`키워드${i}`, 15, (i + 1) * 500)),
    })
    const r = await generatePrescriptions(envNoGsc, scan, { limit: 5 })
    expect(r.prescriptions).toHaveLength(5)
    expect(r.total_opportunities).toBe(20)
    for (let i = 1; i < r.prescriptions.length; i++) {
      expect(r.prescriptions[i - 1].score).toBeGreaterThanOrEqual(r.prescriptions[i].score)
    }
  })

  it('동일 키워드 중복 시 스코어 높은 처방만 유지', async () => {
    const scan = baseScan({
      keywords: [kw('임플란트 가격', 15, 5000)],
      longtail_keywords: [{ keyword: '임플란트 가격', rank: null, search_volume: 5000, source: 'api' }] as any,
    })
    const r = await generatePrescriptions(envNoGsc, scan)
    const dupes = r.prescriptions.filter((p) => p.keyword === '임플란트 가격')
    expect(dupes).toHaveLength(1)
    expect(dupes[0].type).toBe('quick_win') // quick_win 스코어가 더 높음
  })

  it('summary 카운트가 전체 기회 수와 일치', async () => {
    const scan = baseScan({
      keywords: [kw('a', 15, 1000), kw('b', 7, 500)],
      keyword_gaps: [{ keyword: 'c', competitor_domain: 'x.kr', competitor_rank: 2, our_rank: null, search_volume: 300 }] as any,
    })
    const r = await generatePrescriptions(envNoGsc, scan)
    const total = Object.values(r.summary).reduce((s, n) => s + n, 0)
    expect(total).toBe(r.total_opportunities)
    expect(r.summary.quick_win).toBe(1)
    expect(r.summary.defend).toBe(1)
    expect(r.summary.gap_attack).toBe(1)
  })

  it('빈 스캔 → 처방 0건, 에러 없음', async () => {
    const r = await generatePrescriptions(envNoGsc, baseScan({}))
    expect(r.prescriptions).toHaveLength(0)
    expect(r.total_opportunities).toBe(0)
  })
})
