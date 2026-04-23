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
}

export interface ScanCounters {
  total: number
  top3: number
  top10: number
  top30: number
  top100: number
  estimated_traffic: number
}
