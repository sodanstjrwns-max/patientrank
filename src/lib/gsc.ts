// Google Search Console 연동 (프리미엄 기능)
// - webmasters.readonly 스코프로 OAuth 진행
// - refresh_token을 DB에 저장하고 필요할 때 access_token을 갱신
// - Search Analytics API로 "노출됐지만 우리가 못 잡은" 키워드를 긁어온다

import type { Context } from 'hono'
import type { Bindings, GscKeywordRow, GscSite, GscSyncResult, LongTailKeyword } from './types'
import { randomToken } from './crypto'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GSC_API = 'https://www.googleapis.com/webmasters/v3'
const SC_API = 'https://searchconsole.googleapis.com/v1'
const STATE_TTL_MIN = 10

// GSC 전용 스코프 (로그인 OAuth와 분리)
// openid/email/profile까지 같이 요청해서 동일 구글 계정인지도 확인
const GSC_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/webmasters.readonly',
].join(' ')

// ---------------------------------------------------------------------------
// 1) OAuth 시작 URL 생성
// ---------------------------------------------------------------------------

export async function buildGscAuthUrl(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
  redirectTo?: string,
): Promise<string> {
  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured')

  const appUrl = c.env.APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/auth/gsc/callback`

  // state에 user_id까지 태워서 redirect_to 필드 재활용
  const state = randomToken(32)
  const expiresAt = new Date(Date.now() + STATE_TTL_MIN * 60000).toISOString()

  // redirect_to 필드에 JSON으로 저장 (user_id + 원래 복귀 경로)
  const meta = JSON.stringify({ user_id: userId, redirect_to: redirectTo || '/dashboard' })

  await c.env.DB.prepare(
    `INSERT INTO oauth_states (state, provider, redirect_to, expires_at) VALUES (?, 'gsc', ?, ?)`
  ).bind(state, meta, expiresAt).run()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GSC_SCOPES,
    state,
    access_type: 'offline',        // refresh_token 필수
    prompt: 'consent',             // refresh_token 재발급 강제
    include_granted_scopes: 'true',
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

// ---------------------------------------------------------------------------
// 2) callback에서 state 검증 → code 교환
// ---------------------------------------------------------------------------

export async function consumeGscState(
  c: Context<{ Bindings: Bindings }>,
  state: string,
): Promise<{ user_id: number; redirect_to: string } | null> {
  if (!state) return null

  const row = await c.env.DB.prepare(
    `SELECT redirect_to, expires_at FROM oauth_states WHERE state = ? AND provider = 'gsc'`
  ).bind(state).first<{ redirect_to: string | null; expires_at: string }>()

  if (!row) return null
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await c.env.DB.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()
    return null
  }

  await c.env.DB.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()

  if (!row.redirect_to) return null
  try {
    const meta = JSON.parse(row.redirect_to) as { user_id: number; redirect_to: string }
    return meta
  } catch {
    return null
  }
}

interface GscTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number      // seconds
  scope: string
  token_type: string
  id_token?: string
}

export async function exchangeGscCode(
  c: Context<{ Bindings: Bindings }>,
  code: string,
): Promise<GscTokenResponse | null> {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    console.error('[gsc] Google OAuth credentials missing')
    return null
  }

  const appUrl = c.env.APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/auth/gsc/callback`

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[gsc] token exchange failed:', res.status, text)
    return null
  }

  return await res.json() as GscTokenResponse
}

// ---------------------------------------------------------------------------
// 3) refresh_token → access_token 재발급
// ---------------------------------------------------------------------------

export async function refreshGscAccessToken(
  c: Context<{ Bindings: Bindings }>,
  refreshToken: string,
): Promise<{ access_token: string; expires_in: number } | null> {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('[gsc] refresh failed:', res.status, text)
    return null
  }
  const json = await res.json() as { access_token: string; expires_in: number }
  return json
}

// ---------------------------------------------------------------------------
// 4) DB helper: 유저의 access_token 보장 (만료되면 refresh)
// ---------------------------------------------------------------------------

interface GscTokenRow {
  user_id: number
  access_token: string
  refresh_token: string
  scope: string
  expires_at: string
  last_site_url: string | null
}

export async function getValidGscAccessToken(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
): Promise<{ access_token: string; row: GscTokenRow } | null> {
  const row = await c.env.DB.prepare(
    `SELECT user_id, access_token, refresh_token, scope, expires_at, last_site_url
     FROM gsc_tokens WHERE user_id = ?`
  ).bind(userId).first<GscTokenRow>()

  if (!row) return null

  // 60초 버퍼 두고 만료 체크
  const expMs = new Date(row.expires_at).getTime()
  if (expMs - Date.now() > 60000) {
    return { access_token: row.access_token, row }
  }

  // refresh
  const refreshed = await refreshGscAccessToken(c, row.refresh_token)
  if (!refreshed) return null

  const newExp = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
  await c.env.DB.prepare(
    `UPDATE gsc_tokens SET access_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`
  ).bind(refreshed.access_token, newExp, userId).run()

  return {
    access_token: refreshed.access_token,
    row: { ...row, access_token: refreshed.access_token, expires_at: newExp },
  }
}

export async function saveGscTokens(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
  tokens: GscTokenResponse,
): Promise<void> {
  if (!tokens.refresh_token) {
    // refresh_token이 없으면 prompt=consent가 제대로 안 먹은 상황
    // 기존 것이 있으면 유지, 없으면 에러
    const existing = await c.env.DB.prepare(
      `SELECT refresh_token FROM gsc_tokens WHERE user_id = ?`
    ).bind(userId).first<{ refresh_token: string }>()
    if (!existing) throw new Error('refresh_token missing and no existing token')
    tokens.refresh_token = existing.refresh_token
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await c.env.DB.prepare(
    `INSERT INTO gsc_tokens (user_id, access_token, refresh_token, scope, expires_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       access_token = excluded.access_token,
       refresh_token = excluded.refresh_token,
       scope = excluded.scope,
       expires_at = excluded.expires_at,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(userId, tokens.access_token, tokens.refresh_token, tokens.scope, expiresAt).run()
}

export async function disconnectGsc(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
): Promise<void> {
  await c.env.DB.prepare(`DELETE FROM gsc_tokens WHERE user_id = ?`).bind(userId).run()
}

// ---------------------------------------------------------------------------
// 5) GSC API 호출
// ---------------------------------------------------------------------------

/** 연결된 사이트 목록 */
export async function listGscSites(accessToken: string): Promise<GscSite[]> {
  const res = await fetch(`${GSC_API}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    console.error('[gsc] listSites failed:', res.status)
    return []
  }
  const json = await res.json() as { siteEntry?: GscSite[] }
  return json.siteEntry || []
}

/**
 * Search Analytics 쿼리: 키워드별 노출/클릭/평균순위
 * - 최근 28일 (기본), dimensions=query
 * - rowLimit 최대 25000
 */
export async function querySearchAnalytics(
  accessToken: string,
  siteUrl: string,
  opts: {
    startDate?: string       // YYYY-MM-DD
    endDate?: string
    rowLimit?: number
    includePage?: boolean
  } = {},
): Promise<{ rows: GscKeywordRow[]; start: string; end: string }> {
  const end = opts.endDate || new Date().toISOString().slice(0, 10)
  const startD = new Date()
  startD.setDate(startD.getDate() - 28)
  const start = opts.startDate || startD.toISOString().slice(0, 10)
  const rowLimit = Math.min(opts.rowLimit || 5000, 25000)
  const dimensions = opts.includePage ? ['query', 'page'] : ['query']

  const encodedSite = encodeURIComponent(siteUrl)
  const url = `${GSC_API}/sites/${encodedSite}/searchAnalytics/query`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: start,
      endDate: end,
      dimensions,
      rowLimit,
      dataState: 'all',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[gsc] searchAnalytics failed:', res.status, text)
    return { rows: [], start, end }
  }

  const json = await res.json() as {
    rows?: Array<{
      keys: string[]
      clicks: number
      impressions: number
      ctr: number
      position: number
    }>
  }

  const rows: GscKeywordRow[] = (json.rows || []).map((r) => ({
    keyword: r.keys[0] || '',
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    avg_position: r.position || 0,
    page_url: opts.includePage ? r.keys[1] : undefined,
  }))

  return { rows, start, end }
}

// ---------------------------------------------------------------------------
// 6) 스캔 결과와 비교해서 "우리가 놓친 키워드" 뽑기
// ---------------------------------------------------------------------------

export interface GscDiffInput {
  gscRows: GscKeywordRow[]
  knownKeywords: string[]      // 기존 TOP100 + longtail 에서 이미 잡은 키워드
}

export function diffGscVsKnown(input: GscDiffInput): GscKeywordRow[] {
  const known = new Set(input.knownKeywords.map((k) => k.trim().toLowerCase()))
  return input.gscRows.filter((row) => {
    const k = row.keyword.trim().toLowerCase()
    if (!k) return false
    if (known.has(k)) return false
    // 공백 제거 버전도 체크 (e.g. "홍성 라미네이트" vs "홍성라미네이트")
    if (known.has(k.replace(/\s+/g, ''))) return false
    return true
  })
}

// ---------------------------------------------------------------------------
// 7) scan_id 기준 통합 동기화
// ---------------------------------------------------------------------------

export async function syncGscForScan(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
  scanId: number,
  siteUrl: string,
  knownKeywords: string[],
): Promise<GscSyncResult | null> {
  const t = await getValidGscAccessToken(c, userId)
  if (!t) return null

  const { rows, start, end } = await querySearchAnalytics(t.access_token, siteUrl, {
    rowLimit: 5000,
    includePage: true,
  })

  const missed = diffGscVsKnown({ gscRows: rows, knownKeywords })
  // 노출 수 큰 순
  missed.sort((a, b) => b.impressions - a.impressions)

  const totalMissedImpressions = missed.reduce((sum, r) => sum + r.impressions, 0)

  // DB에 snapshot 저장 (기존 것은 삭제 후 재삽입)
  await c.env.DB.prepare(`DELETE FROM gsc_keyword_snapshots WHERE scan_id = ? AND user_id = ?`)
    .bind(scanId, userId).run()

  // 상위 300개만 저장 (DB 과부하 방지)
  const toSave = missed.slice(0, 300)
  if (toSave.length > 0) {
    const stmts = toSave.map((r) =>
      c.env.DB.prepare(
        `INSERT INTO gsc_keyword_snapshots (scan_id, user_id, site_url, keyword, clicks, impressions, ctr, avg_position, page_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(scanId, userId, siteUrl, r.keyword, r.clicks, r.impressions, r.ctr, r.avg_position, r.page_url || null)
    )
    await c.env.DB.batch(stmts)
  }

  // last_site_url 저장 (다음 sync 편의)
  await c.env.DB.prepare(`UPDATE gsc_tokens SET last_site_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`)
    .bind(siteUrl, userId).run()

  return {
    site_url: siteUrl,
    total_rows: rows.length,
    date_range: { start, end },
    new_keywords_found: missed.length,
    missed_impressions: totalMissedImpressions,
    top_missed: toSave.slice(0, 50), // UI에 보여줄 TOP 50
  }
}

// ---------------------------------------------------------------------------
// 8) GSC snapshot을 LongTailKeyword 형식으로 변환 (결과 페이지 통합 표시용)
// ---------------------------------------------------------------------------

export async function loadGscKeywordsForScan(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
  scanId: number,
): Promise<LongTailKeyword[]> {
  const { results } = await c.env.DB.prepare(
    `SELECT keyword, avg_position, impressions, page_url
     FROM gsc_keyword_snapshots
     WHERE scan_id = ? AND user_id = ?
     ORDER BY impressions DESC
     LIMIT 100`
  ).bind(scanId, userId).all<{ keyword: string; avg_position: number; impressions: number; page_url: string | null }>()

  return (results || []).map((r) => ({
    keyword: r.keyword,
    rank: Math.round(r.avg_position) || null,
    ranked_url: r.page_url,
    search_volume: null,
    source: 'sitemap' as const, // UI는 badge만 바꿔서 처리
    total_results: r.impressions, // 재활용: 노출수 표시
  }))
}
