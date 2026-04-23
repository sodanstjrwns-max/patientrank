// Patient Rank 공통 타입 정의

export type Bindings = {
  DB: D1Database
  CACHE: KVNamespace
  APP_URL: string
  APP_NAME: string
  // Secrets (production)
  DATAFORSEO_LOGIN?: string
  DATAFORSEO_PASSWORD?: string
  RESEND_API_KEY?: string
  TOSS_CLIENT_KEY?: string
  TOSS_SECRET_KEY?: string
  KAKAO_REST_API_KEY?: string
  JWT_SECRET?: string
}

export type Plan = 'free' | 'basic' | 'pro' | 'agency'

export interface KeywordRow {
  keyword: string
  rank: number
  search_volume: number
  ranked_url: string
  etv: number
}

export interface ScanSummary {
  scanId: number
  url: string
  domain: string
  keyword_count: number
  top3_count: number
  top10_count: number
  top30_count: number
  top100_count: number
  estimated_traffic: number
  created_at: string
  keywords: KeywordRow[]
  // 비회원 결과 공개 여부
  is_gated: boolean
  // 백링크 분석 (Pro 티저)
  backlink_summary?: BacklinkSummary
  backlinks?: BacklinkRow[]
  competitor_gap?: CompetitorLinkGap[]
}

export interface ScanCounters {
  total: number
  top3: number
  top10: number
  top30: number
  top100: number
  estimated_traffic: number
}

// 백링크 1건
export interface BacklinkRow {
  source_url: string
  source_domain: string
  anchor: string
  domain_rank: number // 0-100 (DataForSEO backlink_info.rank)
  is_dofollow: boolean
  is_lost: boolean
  first_seen?: string
  last_seen?: string
}

// 도메인 권위 지표 (Summary)
export interface BacklinkSummary {
  target: string
  domain_rank: number          // 종합 도메인 권위 (0-100)
  referring_domains: number    // 링크 걸어주는 '도메인' 수
  backlinks_total: number      // 백링크 '개수' 총합
  dofollow_ratio: number       // 0-1
  alive_count: number          // 살아있는 백링크 수
  lost_count: number           // 사라진 백링크 수
}

// 경쟁사 링크 소스 (우리가 못 받은 링크)
export interface CompetitorLinkGap {
  competitor_domain: string
  competitor_rank: number      // 경쟁사 도메인 권위
  source_url: string           // 우리가 못 받은 링크의 출처
  source_domain: string
  source_rank: number          // 출처 도메인의 권위
  anchor: string
}
