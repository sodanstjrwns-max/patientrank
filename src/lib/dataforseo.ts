// DataForSEO Labs API 클라이언트
// 엔드포인트: /v3/dataforseo_labs/google/ranked_keywords/live
// 백링크: /v3/backlinks/backlinks/live

import type { KeywordRow } from './types'

const DFS_BASE = 'https://api.dataforseo.com/v3'

export interface DfsCreds {
  login: string
  password: string
}

function authHeader(creds: DfsCreds): string {
  const raw = `${creds.login}:${creds.password}`
  // btoa는 Cloudflare Workers 런타임에서 지원됨
  const b64 = typeof btoa !== 'undefined'
    ? btoa(raw)
    : Buffer.from(raw, 'utf-8').toString('base64')
  return 'Basic ' + b64
}

/**
 * Ranked Keywords 조회 (핵심)
 * @param maxRank 최대 순위 (기본 500: TOP 500까지, 정밀 모드로는 100까지)
 */
export async function fetchRankedKeywords(
  creds: DfsCreds,
  target: string,
  limit = 1000,
  maxRank = 500,
): Promise<{ keywords: KeywordRow[]; raw: any; cost: number }> {
  const body = [{
    target,
    location_name: 'South Korea',
    language_name: 'Korean',
    limit,
    order_by: ['keyword_data.keyword_info.search_volume,desc'],
    filters: [
      ['ranked_serp_element.serp_item.rank_group', '<=', maxRank],
    ],
  }]

  const res = await fetch(`${DFS_BASE}/dataforseo_labs/google/ranked_keywords/live`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader(creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`DataForSEO HTTP ${res.status}: ${txt.slice(0, 200)}`)
  }

  const json: any = await res.json()
  const task = json?.tasks?.[0]
  if (!task) throw new Error('DataForSEO: empty tasks')
  if (task.status_code !== 20000) {
    throw new Error(`DataForSEO task error: ${task.status_code} ${task.status_message}`)
  }

  const items: any[] = task.result?.[0]?.items ?? []
  const keywords: KeywordRow[] = items.map(it => {
    const kw = it?.keyword_data?.keyword ?? ''
    const sv = Number(it?.keyword_data?.keyword_info?.search_volume ?? 0)
    const serp = it?.ranked_serp_element?.serp_item ?? {}
    const rank = Number(serp?.rank_group ?? serp?.rank_absolute ?? 999)
    const url = String(serp?.url ?? '')
    const etv = Number(serp?.etv ?? 0)
    return { keyword: kw, rank, search_volume: sv, ranked_url: url, etv }
  }).filter(k => k.keyword && k.rank > 0 && k.rank <= maxRank)

  // 검색량 desc로 정렬 (API도 이미 정렬하지만 안전장치)
  keywords.sort((a, b) => (b.search_volume - a.search_volume) || (a.rank - b.rank))

  const cost = Number(json?.cost ?? task?.cost ?? 0)
  return { keywords, raw: json, cost }
}

/**
 * Domain Intersection (경쟁사 키워드 갭 분석)
 * - targets: [우리 도메인, 경쟁사 도메인]
 * - intersections=false → 경쟁사만 랭크하는 키워드 (= 우리가 놓친 기회)
 */
export interface KeywordGapRow {
  keyword: string
  search_volume: number
  cpc: number
  keyword_difficulty: number
  // 경쟁사 정보
  competitor_rank: number
  competitor_url: string
  competitor_etv: number
  // 우리 정보 (대부분 null. intersections=false면 우리는 랭크 안 함)
  our_rank?: number | null
  our_url?: string | null
}

export async function fetchCompetitorKeywordGap(
  creds: DfsCreds,
  ourDomain: string,
  competitorDomain: string,
  limit = 100,
): Promise<{ rows: KeywordGapRow[]; cost: number }> {
  const body = [{
    target1: competitorDomain,  // 경쟁사
    target2: ourDomain,          // 우리
    location_name: 'South Korea',
    language_name: 'Korean',
    intersections: false,        // 경쟁사만 랭크하는 키워드 (우리 아님)
    limit,
    order_by: ['first_domain_serp_element.serp_item.etv,desc'],
    filters: [
      ['first_domain_serp_element.serp_item.rank_group', '<=', 30],
    ],
  }]

  const res = await fetch(`${DFS_BASE}/dataforseo_labs/google/domain_intersection/live`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader(creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`DataForSEO intersection HTTP ${res.status}: ${txt.slice(0, 200)}`)
  }

  const json: any = await res.json()
  const task = json?.tasks?.[0]
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO intersection task error: ${task?.status_code} ${task?.status_message}`)
  }

  const items: any[] = task.result?.[0]?.items ?? []
  const rows: KeywordGapRow[] = items.map(it => {
    const kd = it?.keyword_data ?? {}
    const kwInfo = kd?.keyword_info ?? {}
    const first = it?.first_domain_serp_element?.serp_item ?? {}
    const second = it?.second_domain_serp_element?.serp_item ?? null
    return {
      keyword: String(kd?.keyword ?? ''),
      search_volume: Number(kwInfo?.search_volume ?? 0),
      cpc: Number(kwInfo?.cpc ?? 0),
      keyword_difficulty: Number(kd?.keyword_properties?.keyword_difficulty ?? 0),
      competitor_rank: Number(first?.rank_group ?? 999),
      competitor_url: String(first?.url ?? ''),
      competitor_etv: Number(first?.etv ?? 0),
      our_rank: second ? Number(second?.rank_group ?? null) : null,
      our_url: second ? String(second?.url ?? '') : null,
    }
  }).filter(r => r.keyword && r.search_volume > 0)

  rows.sort((a, b) => b.search_volume - a.search_volume)
  const cost = Number(json?.cost ?? task?.cost ?? 0)
  return { rows, cost }
}

/**
 * SERP 실측 (단일 키워드) — Google 한국 실제 검색 결과
 * 지역×진료 매트릭스 / sitemap 역추적 키워드 순위 검증용
 * 비용: $0.0006/query (live/regular), $0.002/query (live/advanced)
 */
export interface SerpRankResult {
  keyword: string
  found: boolean
  rank: number | null       // rank_group (1~100), null이면 TOP 100 외
  url: string | null        // 우리 사이트의 랭크 URL
  search_volume?: number    // 검색량 (옵션, SERP API로는 안 나옴 → 별도 API 필요)
  total_results: number     // 전체 결과 수
}

export async function fetchSerpRank(
  creds: DfsCreds,
  keyword: string,
  targetDomain: string,
  depth = 100,
): Promise<{ result: SerpRankResult; cost: number }> {
  const body = [{
    keyword,
    location_name: 'South Korea',
    language_name: 'Korean',
    depth,
  }]
  // 타임아웃 추가: DataForSEO가 느리게 응답하는 키워드에 Promise.all이 영원히 매달리지 않도록
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000) // 20초
  let res: Response
  try {
    res = await fetch(`${DFS_BASE}/serp/google/organic/live/regular`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader(creds),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`DataForSEO SERP HTTP ${res.status}: ${txt.slice(0, 200)}`)
  }
  const json: any = await res.json()
  const task = json?.tasks?.[0]
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO SERP task error: ${task?.status_code} ${task?.status_message}`)
  }
  const items: any[] = task.result?.[0]?.items ?? []
  const totalResults = Number(task.result?.[0]?.se_results_count ?? 0)
  const normalizedTarget = targetDomain.replace(/^www\./, '').toLowerCase()

  let found: any = null
  for (const it of items) {
    const dom = String(it?.domain ?? '').toLowerCase().replace(/^www\./, '')
    const url = String(it?.url ?? '').toLowerCase()
    if (dom === normalizedTarget || url.includes(normalizedTarget)) {
      found = it
      break
    }
  }

  const cost = Number(json?.cost ?? task?.cost ?? 0)
  return {
    result: {
      keyword,
      found: !!found,
      rank: found ? Number(found.rank_group ?? found.rank_absolute ?? null) : null,
      url: found ? String(found.url ?? '') : null,
      total_results: totalResults,
    },
    cost,
  }
}

/**
 * Search Volume 일괄 조회 (최대 1,000 키워드)
 * 비용: $0.05/1,000 키워드 = $0.00005/키워드
 */
export interface SearchVolumeRow {
  keyword: string
  search_volume: number
  cpc: number
  competition: string | null  // LOW/MEDIUM/HIGH
}

export async function fetchSearchVolumes(
  creds: DfsCreds,
  keywords: string[],
): Promise<{ rows: SearchVolumeRow[]; cost: number }> {
  if (!keywords.length) return { rows: [], cost: 0 }
  const body = [{
    keywords: keywords.slice(0, 1000),
    location_name: 'South Korea',
    language_name: 'Korean',
  }]
  const res = await fetch(`${DFS_BASE}/keywords_data/google_ads/search_volume/live`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader(creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`DataForSEO SV HTTP ${res.status}: ${txt.slice(0, 200)}`)
  }
  const json: any = await res.json()
  const task = json?.tasks?.[0]
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO SV task error: ${task?.status_code} ${task?.status_message}`)
  }
  const items: any[] = task.result ?? []
  const rows: SearchVolumeRow[] = items.map(it => ({
    keyword: String(it?.keyword ?? ''),
    search_volume: Number(it?.search_volume ?? 0),
    cpc: Number(it?.cpc ?? 0),
    competition: it?.competition ?? null,
  })).filter(r => r.keyword)

  const cost = Number(json?.cost ?? task?.cost ?? 0)
  return { rows, cost }
}

/**
 * 병렬 SERP 체크 (배치)
 * 동시 실행 제한: 기본 5 (Cloudflare Workers subrequest 한도 고려)
 */
export async function batchFetchSerpRanks(
  creds: DfsCreds,
  keywords: string[],
  targetDomain: string,
  concurrency = 5,
  depth = 100,
): Promise<{ results: SerpRankResult[]; totalCost: number; errors: Array<{ keyword: string; error: string }> }> {
  const results: SerpRankResult[] = []
  const errors: Array<{ keyword: string; error: string }> = []
  let totalCost = 0

  const queue = [...keywords]

  async function worker() {
    while (queue.length) {
      const kw = queue.shift()
      if (!kw) break
      try {
        const { result, cost } = await fetchSerpRank(creds, kw, targetDomain, depth)
        results.push(result)
        totalCost += cost
      } catch (e: any) {
        errors.push({ keyword: kw, error: String(e?.message ?? e) })
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, keywords.length) }, () => worker())
  await Promise.all(workers)
  return { results, totalCost, errors }
}

/**
 * 백링크 조회 (Pro 이상)
 */
export async function fetchBacklinks(
  creds: DfsCreds,
  target: string,
  limit = 100
): Promise<{ items: any[]; raw: any }> {
  const body = [{ target, limit, mode: 'as_is' }]
  const res = await fetch(`${DFS_BASE}/backlinks/backlinks/live`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader(creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`DataForSEO backlinks HTTP ${res.status}`)
  const json: any = await res.json()
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? []
  return { items, raw: json }
}

/**
 * 데모 모드: API 키가 없을 때 현실적인 샘플 데이터 생성
 * (UI/UX 검증용 - 실제 배포 시 반드시 실제 키 사용)
 */
export function demoRankedKeywords(target: string): { keywords: KeywordRow[]; raw: any; cost: number } {
  const base = target.replace(/^www\./, '')
  const samples: Array<[string, number, number]> = [
    ['임플란트', 3, 22000], ['강남 치과', 5, 18500], ['충치치료', 8, 14200],
    ['치아교정', 11, 21000], ['스케일링 비용', 2, 9800], ['임플란트 가격', 4, 33000],
    ['라미네이트', 14, 7400], ['사랑니 발치', 7, 12100], ['신경치료', 19, 8900],
    ['치아미백', 23, 6300], ['틀니', 27, 4200], ['잇몸치료', 31, 5900],
    ['어린이 치과', 9, 7800], ['치과 추천', 6, 16500], ['야간 진료 치과', 12, 3400],
    ['일요일 진료 치과', 15, 2900], ['무통마취 치과', 21, 2100], ['보철치료', 33, 3100],
    ['구강검진', 18, 2700], ['치주염', 26, 4800], ['세라믹 크라운', 37, 1900],
    ['치과 보험', 42, 1700], ['원데이 임플란트', 29, 2300], ['디지털 치과', 47, 1200],
    ['임플란트 통증', 55, 2600], ['교정 비용', 13, 11200], ['투명교정', 10, 9600],
    ['설측교정', 38, 1100], ['부분틀니', 44, 1500], ['올세라믹', 51, 1400],
    ['치과 리뷰', 68, 3300], ['치과 후기', 71, 5200], ['치과 원장', 84, 890],
    ['치주 수술', 92, 760], ['임플란트 후기', 61, 4100],
  ]
  const keywords: KeywordRow[] = samples.map(([kw, rank, sv]) => ({
    keyword: kw,
    rank,
    search_volume: sv,
    ranked_url: `https://${base}/${encodeURIComponent(kw)}`,
    etv: Math.round((sv * (rank <= 3 ? 0.25 : rank <= 10 ? 0.08 : rank <= 30 ? 0.02 : 0.005)) * 10) / 10,
  }))
  keywords.sort((a, b) => (b.search_volume - a.search_volume) || (a.rank - b.rank))
  return { keywords, raw: { demo: true, target }, cost: 0 }
}
