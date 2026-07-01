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

// GSC (Google Search Console) 연동 - 프리미엄
export interface GscKeywordRow {
  keyword: string
  clicks: number
  impressions: number
  ctr: number              // 0-1
  avg_position: number     // 1-100+ (실제 소수점)
  page_url?: string
}

export interface GscSite {
  siteUrl: string          // sc-domain:example.com 또는 https://example.com/
  permissionLevel: string  // siteOwner / siteFullUser / siteRestrictedUser
}

export interface GscSyncResult {
  site_url: string
  total_rows: number
  date_range: { start: string; end: string }
  new_keywords_found: number   // 기존 longtail 결과에 없던 키워드 수
  missed_impressions: number   // 노출은 있었는데 우리 SaaS가 못 잡은 총 노출수
  top_missed: GscKeywordRow[]  // 우리가 놓친 TOP 키워드 (노출 기준 정렬)
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

// ==========================================================================
// Day 1: 시계열 추적 + AI 액션 가이드
// ==========================================================================

// 도메인별 주간 스냅샷 (scan_snapshots 테이블)
export interface ScanSnapshot {
  id: number
  user_id: number | null
  domain: string
  scan_id: number | null
  keyword_count: number
  top3_count: number
  top10_count: number
  top30_count: number
  top100_count: number
  estimated_traffic: number
  domain_rating: number
  backlinks_total: number
  referring_domains: number
  dofollow_ratio: number
  longtail_count: number
  longtail_volume: number
  ai_score: number
  snapshot_date: string        // YYYY-MM-DD
  trigger_type: 'cron' | 'manual' | 'rescan'
  created_at: string
}

// 이번 주 변화 비교 (vs 지난 주)
export interface WeeklyDelta {
  current: ScanSnapshot
  previous: ScanSnapshot | null
  delta: {
    keyword_count: number
    top3_count: number
    top10_count: number
    top30_count: number
    top100_count: number
    estimated_traffic: number
    domain_rating: number
    backlinks_total: number
  }
  trend_4w: ScanSnapshot[]      // 최근 4주 트렌드
}

// AI 액션 가이드 단일 액션
export interface AiAction {
  priority: 1 | 2 | 3
  title: string                          // "강남 임플란트 매체 1곳 컨택"
  why: string                            // 근거 (데이터 기반)
  how: string                            // 실행 방법
  expected_impact: string                // "DR 0 → 8 (4주 이내)"
  estimated_time: string                 // "2시간"
  estimated_cost: string                 // "약 30만원" | "무료"
  patient_funnel_stage:                  // 페이션트 퍼널 10단계
    | '1. 인지' | '2. 관심' | '3. 검색' | '4. 비교' | '5. 상담'
    | '6. 예약' | '7. 방문' | '8. 결정' | '9. 치료' | '10. 추천'
  category: 'backlink' | 'content' | 'technical' | 'local' | 'gsc'
}

// AI 액션 가이드 전체 응답
export interface AiActionGuide {
  weekly_score: number                   // 0-100
  score_change: number                   // vs 지난 주
  top_strength: string
  top_weakness: string
  this_week_actions: AiAction[]          // 정확히 3개
  next_4_weeks_roadmap: Array<{
    week: number
    theme: string
    focus: string
  }>
  generated_at: string
  model_used: string
}

// ===================================================================
// Day 3: 결제 시스템 + 베타 + 카카오 알림톡 타입
// ===================================================================

// 베타 신청
export interface BetaSignup {
  id: number
  email: string
  name: string
  clinic_name: string | null
  clinic_url: string | null
  phone: string | null
  patient_funnel_code: string | null
  is_pf_alumni: 0 | 1
  status: 'pending' | 'invited' | 'signed_up' | 'rejected'
  invited_at: string | null
  signed_up_at: string | null
  source: string | null
  message: string | null
  created_at: string
  updated_at: string
}

// 구독
export interface Subscription {
  id: number
  user_id: number
  plan: 'free' | 'basic' | 'pro' | 'agency'
  status: 'active' | 'cancelled' | 'past_due' | 'expired'
  price_krw: number
  discount_rate: number
  final_price_krw: number
  billing_cycle: 'monthly' | 'yearly'
  toss_billing_key: string | null
  toss_customer_key: string | null
  toss_card_company: string | null
  toss_card_number_masked: string | null
  current_period_start: string | null
  current_period_end: string | null
  next_billing_date: string | null
  cancelled_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// 결제
export interface Payment {
  id: number
  user_id: number
  subscription_id: number | null
  toss_payment_key: string | null
  toss_order_id: string
  toss_transaction_key: string | null
  amount_krw: number
  vat_krw: number | null
  status: 'pending' | 'READY' | 'IN_PROGRESS' | 'WAITING_FOR_DEPOSIT' | 'DONE' | 'CANCELED' | 'PARTIAL_CANCELED' | 'ABORTED' | 'EXPIRED'
  method: string | null
  card_company: string | null
  card_number_masked: string | null
  reason: string | null
  refunded_at: string | null
  refund_amount_krw: number | null
  refund_reason: string | null
  receipt_url: string | null
  failure_code: string | null
  failure_message: string | null
  raw_response: string | null
  created_at: string
  paid_at: string | null
}

// 카카오 알림톡 로그
export interface KakaoLog {
  id: number
  user_id: number | null
  phone: string
  template_code: 'WEEKLY_REPORT' | 'COMPETITOR_ALERT' | 'BETA_INVITE' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED'
  message_title: string | null
  message_body: string | null
  button_url: string | null
  status: 'pending' | 'sent' | 'failed' | 'read'
  kakao_message_id: string | null
  failure_reason: string | null
  sent_at: string | null
  read_at: string | null
  created_at: string
}

// 쿠폰
export interface Coupon {
  id: number
  code: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  current_uses: number
  valid_from: string | null
  valid_until: string | null
  applies_to: string | null
  is_lifetime: 0 | 1
  is_active: 0 | 1
  created_at: string
}

// ===================================================================
// Day 7: 경쟁사 추적 + 변화 알림
// ===================================================================
export interface Competitor {
  id: number
  user_id: number
  my_domain: string
  competitor_domain: string
  alias: string | null
  is_active: 0 | 1
  created_at: string
  updated_at: string
}

export type CompetitorAlertType = 'new_keyword' | 'lost_keyword' | 'rank_jump' | 'rank_drop'

export interface CompetitorAlert {
  id: number
  user_id: number
  competitor_domain: string
  alert_type: CompetitorAlertType
  keyword: string | null
  old_rank: number | null
  new_rank: number | null
  change_magnitude: number | null
  kakao_sent: 0 | 1
  detected_at: string
}

// 경쟁사 비교 카드용 (result.tsx에서 사용)
export interface CompetitorComparison {
  competitor_domain: string
  alias: string | null
  my_top10: number
  competitor_top10: number
  my_top3: number
  competitor_top3: number
  shared_keywords: number     // 둘 다 랭킹된 키워드 수
  competitor_only: number     // 경쟁사만 랭킹된 키워드 수 (= 우리가 놓친 갭)
  my_only: number             // 우리만 랭킹된 키워드 수
  competitor_estimated_traffic: number
  my_estimated_traffic: number
}

// 플랜 가격표
export const PLAN_PRICES = {
  free: 0,
  basic: 49000,
  pro: 149000,
  agency: 490000,
} as const

export type PlanName = keyof typeof PLAN_PRICES
