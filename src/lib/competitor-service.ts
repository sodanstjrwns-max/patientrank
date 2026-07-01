// ===================================================================
// Day 7: 경쟁사 추적 + 변화 알림 서비스
// ===================================================================
import type { Bindings, Competitor, CompetitorAlert, CompetitorComparison, KeywordRow } from './types'

/**
 * 도메인 정규화: protocol, www, trailing slash 제거
 */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('/')[0]
}

/**
 * 경쟁사 등록 (중복 방지)
 */
export async function addCompetitor(
  env: Bindings,
  userId: number,
  myDomain: string,
  competitorDomain: string,
  alias?: string,
): Promise<{ success: boolean; id?: number; error?: string }> {
  const my = normalizeDomain(myDomain)
  const comp = normalizeDomain(competitorDomain)

  if (!my || !comp) {
    return { success: false, error: '도메인이 유효하지 않습니다' }
  }
  if (my === comp) {
    return { success: false, error: '내 도메인과 동일한 경쟁사를 등록할 수 없습니다' }
  }

  // 이미 등록되어 있는지 체크
  const existing = await env.DB.prepare(
    `SELECT id FROM competitors WHERE user_id = ? AND my_domain = ? AND competitor_domain = ? LIMIT 1`,
  )
    .bind(userId, my, comp)
    .first<{ id: number }>()

  if (existing) {
    // 비활성화 상태면 재활성화
    await env.DB.prepare(
      `UPDATE competitors SET is_active = 1, alias = COALESCE(?, alias), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    )
      .bind(alias || null, existing.id)
      .run()
    return { success: true, id: existing.id }
  }

  // 사용자당 최대 5개 제한
  const count = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM competitors WHERE user_id = ? AND is_active = 1`,
  )
    .bind(userId)
    .first<{ n: number }>()
  if ((count?.n || 0) >= 5) {
    return { success: false, error: '경쟁사는 최대 5개까지 등록할 수 있습니다' }
  }

  const result = await env.DB.prepare(
    `INSERT INTO competitors (user_id, my_domain, competitor_domain, alias, is_active)
     VALUES (?, ?, ?, ?, 1)`,
  )
    .bind(userId, my, comp, alias || null)
    .run()

  return { success: true, id: result.meta.last_row_id as number }
}

/**
 * 경쟁사 삭제 (soft delete)
 */
export async function removeCompetitor(env: Bindings, userId: number, competitorId: number): Promise<boolean> {
  const result = await env.DB.prepare(
    `UPDATE competitors SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
  )
    .bind(competitorId, userId)
    .run()
  return (result.meta.changes || 0) > 0
}

/**
 * 사용자의 활성 경쟁사 목록
 */
export async function listCompetitors(env: Bindings, userId: number): Promise<Competitor[]> {
  const rows = await env.DB.prepare(
    `SELECT * FROM competitors WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC`,
  )
    .bind(userId)
    .all<Competitor>()
  return rows.results || []
}

/**
 * 도메인의 최신 스캔 결과(키워드) 조회
 * - scans 테이블엔 domain 컬럼이 없고 url만 있어서 LIKE 매칭 사용
 * - 키워드는 keyword_snapshots 테이블에서 가져옴
 */
async function getLatestKeywords(env: Bindings, domain: string): Promise<KeywordRow[]> {
  // url에 도메인이 포함된 가장 최근 스캔 찾기
  const scan = await env.DB.prepare(
    `SELECT id FROM scans
       WHERE (url LIKE ? OR url LIKE ?) AND status = 'completed'
       ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(`%${domain}%`, `%${domain.replace(/^www\./, '')}%`)
    .first<{ id: number }>()
  if (!scan) return []

  const rows = await env.DB.prepare(
    `SELECT keyword, rank, search_volume, ranked_url, etv
       FROM keyword_snapshots WHERE scan_id = ?`,
  )
    .bind(scan.id)
    .all<KeywordRow>()
  return rows.results || []
}

/**
 * 내 도메인 vs 경쟁사 비교 계산
 */
export async function compareWithCompetitor(
  env: Bindings,
  myDomain: string,
  competitorDomain: string,
  alias: string | null,
): Promise<CompetitorComparison> {
  const my = normalizeDomain(myDomain)
  const comp = normalizeDomain(competitorDomain)

  const [myKw, compKw] = await Promise.all([
    getLatestKeywords(env, my),
    getLatestKeywords(env, comp),
  ])

  const myMap = new Map(myKw.map((k) => [k.keyword.toLowerCase(), k]))
  const compMap = new Map(compKw.map((k) => [k.keyword.toLowerCase(), k]))

  let shared = 0
  let competitorOnly = 0
  let myOnly = 0
  for (const k of myMap.keys()) {
    if (compMap.has(k)) shared++
    else myOnly++
  }
  for (const k of compMap.keys()) {
    if (!myMap.has(k)) competitorOnly++
  }

  return {
    competitor_domain: comp,
    alias,
    my_top10: myKw.filter((k) => k.rank > 0 && k.rank <= 10).length,
    competitor_top10: compKw.filter((k) => k.rank > 0 && k.rank <= 10).length,
    my_top3: myKw.filter((k) => k.rank > 0 && k.rank <= 3).length,
    competitor_top3: compKw.filter((k) => k.rank > 0 && k.rank <= 3).length,
    shared_keywords: shared,
    competitor_only: competitorOnly,
    my_only: myOnly,
    competitor_estimated_traffic: compKw.reduce((s, k) => s + (k.etv || 0), 0),
    my_estimated_traffic: myKw.reduce((s, k) => s + (k.etv || 0), 0),
  }
}

/**
 * 한 사용자의 모든 경쟁사 비교 결과
 */
export async function getCompetitorComparisons(
  env: Bindings,
  userId: number,
  myDomain: string,
): Promise<CompetitorComparison[]> {
  const competitors = await listCompetitors(env, userId)
  const filtered = competitors.filter((c) => c.my_domain === normalizeDomain(myDomain))
  const results: CompetitorComparison[] = []
  for (const c of filtered) {
    results.push(await compareWithCompetitor(env, c.my_domain, c.competitor_domain, c.alias))
  }
  return results
}

/**
 * 두 시점의 키워드 스냅샷을 diff 해서 alert 생성
 * - previousKw: 지난 주 (예: 1주일 전 스캔)
 * - currentKw:  이번 주 최신 스캔
 */
export function diffKeywordsForAlerts(
  previousKw: KeywordRow[],
  currentKw: KeywordRow[],
  threshold = 5,
): Array<Pick<CompetitorAlert, 'alert_type' | 'keyword' | 'old_rank' | 'new_rank' | 'change_magnitude'>> {
  const prevMap = new Map(previousKw.map((k) => [k.keyword.toLowerCase(), k]))
  const currMap = new Map(currentKw.map((k) => [k.keyword.toLowerCase(), k]))

  const alerts: Array<Pick<CompetitorAlert, 'alert_type' | 'keyword' | 'old_rank' | 'new_rank' | 'change_magnitude'>> =
    []

  // 새로 진입한 키워드
  for (const [k, row] of currMap) {
    if (!prevMap.has(k) && row.rank > 0 && row.rank <= 30) {
      alerts.push({
        alert_type: 'new_keyword',
        keyword: row.keyword,
        old_rank: null,
        new_rank: row.rank,
        change_magnitude: row.rank,
      })
    }
  }
  // 사라진 키워드
  for (const [k, row] of prevMap) {
    if (!currMap.has(k) && row.rank > 0 && row.rank <= 30) {
      alerts.push({
        alert_type: 'lost_keyword',
        keyword: row.keyword,
        old_rank: row.rank,
        new_rank: null,
        change_magnitude: row.rank,
      })
    }
  }
  // 순위 변동 (양쪽 다 있는 경우)
  for (const [k, currRow] of currMap) {
    const prevRow = prevMap.get(k)
    if (!prevRow) continue
    if (prevRow.rank <= 0 || currRow.rank <= 0) continue
    const delta = prevRow.rank - currRow.rank // +면 상승, -면 하락
    if (Math.abs(delta) < threshold) continue
    if (delta > 0) {
      alerts.push({
        alert_type: 'rank_jump',
        keyword: currRow.keyword,
        old_rank: prevRow.rank,
        new_rank: currRow.rank,
        change_magnitude: delta,
      })
    } else {
      alerts.push({
        alert_type: 'rank_drop',
        keyword: currRow.keyword,
        old_rank: prevRow.rank,
        new_rank: currRow.rank,
        change_magnitude: Math.abs(delta),
      })
    }
  }
  return alerts
}

/**
 * 경쟁사 alert 저장 (배치)
 */
export async function saveCompetitorAlerts(
  env: Bindings,
  userId: number,
  competitorDomain: string,
  alerts: Array<Pick<CompetitorAlert, 'alert_type' | 'keyword' | 'old_rank' | 'new_rank' | 'change_magnitude'>>,
): Promise<number> {
  if (alerts.length === 0) return 0
  const stmts = alerts.map((a) =>
    env.DB.prepare(
      `INSERT INTO competitor_alerts
         (user_id, competitor_domain, alert_type, keyword, old_rank, new_rank, change_magnitude)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      userId,
      normalizeDomain(competitorDomain),
      a.alert_type,
      a.keyword,
      a.old_rank,
      a.new_rank,
      a.change_magnitude,
    ),
  )
  const results = await env.DB.batch(stmts)
  return results.length
}

/**
 * 최근 미발송 alert (카카오 발송용)
 */
export async function getPendingAlerts(env: Bindings, userId: number, limit = 20): Promise<CompetitorAlert[]> {
  const rows = await env.DB.prepare(
    `SELECT * FROM competitor_alerts WHERE user_id = ? AND kakao_sent = 0 ORDER BY detected_at DESC LIMIT ?`,
  )
    .bind(userId, limit)
    .all<CompetitorAlert>()
  return rows.results || []
}
