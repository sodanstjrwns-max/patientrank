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
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
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
  // 경쟁사 키워드 갭 (우리가 놓친 키워드)
  keyword_gaps?: KeywordGap[]
  // 스캔 범위 (UI 토글용)
  max_rank?: number
  // 롱테일 키워드 발견 (옵션 A+B: sitemap 역추적 + 지역×진료 매트릭스)
  longtail_keywords?: LongTailKeyword[]
  longtail_meta?: LongTailMeta
}

// 롱테일 키워드 (DataForSEO DB에 없지만 실제 랭킹되는 지역 롱테일)
export interface LongTailKeyword {
  keyword: string
  rank: number | null           // null = TOP 100 외
  ranked_url: string | null
  search_volume: number | null  // null = DataForSEO Google Ads DB에 없음
  source: 'sitemap' | 'matrix'  // 발견 경로
  total_results?: number        // SERP 경쟁 규모
}

export interface LongTailMeta {
  sitemap_url: string | null
  total_urls_crawled: number
  total_candidates: number
  scanned_count: number
  found_count: number           // 실제 TOP 100 안에 랭킹된 개수
  total_cost: number            // API 비용 ($)
  mode: 'sitemap' | 'matrix' | 'both'
}

export interface KeywordGap {
  keyword: string
  search_volume: number
  keyword_difficulty: number
  cpc: number
  competitor_domain: string
  competitor_rank: number
  competitor_url: string
  competitor_etv: number
  our_rank?: number | null
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
