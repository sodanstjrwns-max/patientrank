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
 */
export async function fetchRankedKeywords(
  creds: DfsCreds,
  target: string,
  limit = 1000
): Promise<{ keywords: KeywordRow[]; raw: any; cost: number }> {
  const body = [{
    target,
    location_name: 'South Korea',
    language_name: 'Korean',
    limit,
    order_by: ['keyword_data.keyword_info.search_volume,desc'],
    filters: [
      ['ranked_serp_element.serp_item.rank_group', '<=', 100],
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
  }).filter(k => k.keyword && k.rank > 0 && k.rank <= 100)

  // 검색량 desc로 정렬 (API도 이미 정렬하지만 안전장치)
  keywords.sort((a, b) => (b.search_volume - a.search_volume) || (a.rank - b.rank))

  const cost = Number(json?.cost ?? task?.cost ?? 0)
  return { keywords, raw: json, cost }
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
