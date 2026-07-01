// Day 1-D, 1-E: 시계열 스냅샷 저장 + 조회 서비스
import type { Bindings, ScanSnapshot, WeeklyDelta, ScanSummary } from './types'

// 주차 기준 월요일 (YYYY-MM-DD) 반환
export function getWeekOfMonday(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getUTCDay() // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day // 가장 가까운 과거 월요일
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().slice(0, 10)
}

// 스캔 결과 → 스냅샷 1건 저장 (UPSERT)
export async function saveSnapshot(
  env: Bindings,
  args: {
    user_id: number | null
    domain: string
    scan_id: number | null
    scan: ScanSummary
    trigger_type?: 'cron' | 'manual' | 'rescan'
    ai_score?: number
  },
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const bs = args.scan.backlink_summary
  const lt = args.scan.longtail_keywords || []
  const ltVolume = lt.reduce((sum, k) => sum + (k.search_volume || 0), 0)

  await env.DB.prepare(`
    INSERT INTO scan_snapshots (
      user_id, domain, scan_id,
      keyword_count, top3_count, top10_count, top30_count, top100_count,
      estimated_traffic, domain_rating, backlinks_total, referring_domains, dofollow_ratio,
      longtail_count, longtail_volume, ai_score,
      snapshot_date, trigger_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(domain, snapshot_date) DO UPDATE SET
      keyword_count = excluded.keyword_count,
      top3_count = excluded.top3_count,
      top10_count = excluded.top10_count,
      top30_count = excluded.top30_count,
      top100_count = excluded.top100_count,
      estimated_traffic = excluded.estimated_traffic,
      domain_rating = excluded.domain_rating,
      backlinks_total = excluded.backlinks_total,
      referring_domains = excluded.referring_domains,
      dofollow_ratio = excluded.dofollow_ratio,
      longtail_count = excluded.longtail_count,
      longtail_volume = excluded.longtail_volume,
      ai_score = excluded.ai_score,
      scan_id = excluded.scan_id,
      trigger_type = excluded.trigger_type
  `).bind(
    args.user_id,
    args.domain,
    args.scan_id,
    args.scan.keyword_count || 0,
    args.scan.top3_count || 0,
    args.scan.top10_count || 0,
    args.scan.top30_count || 0,
    args.scan.top100_count || 0,
    args.scan.estimated_traffic || 0,
    bs?.domain_rank || 0,
    bs?.backlinks_total || 0,
    bs?.referring_domains || 0,
    bs?.dofollow_ratio || 0,
    lt.length,
    ltVolume,
    args.ai_score || 0,
    today,
    args.trigger_type || 'manual',
  ).run()
}

// 도메인 시계열 N주 조회
export async function getDomainTimeline(
  env: Bindings,
  domain: string,
  weeks: number = 4,
): Promise<ScanSnapshot[]> {
  const rows = await env.DB.prepare(`
    SELECT * FROM scan_snapshots
    WHERE domain = ?
    ORDER BY snapshot_date DESC
    LIMIT ?
  `).bind(domain, weeks).all<any>()

  return (rows.results || []).map(rowToSnapshot).reverse() // 오래된 → 최신
}

// 이번 주 vs 지난 주 비교 데이터
export async function getWeeklyDelta(
  env: Bindings,
  domain: string,
): Promise<WeeklyDelta | null> {
  const timeline = await getDomainTimeline(env, domain, 4)
  if (timeline.length === 0) return null

  const current = timeline[timeline.length - 1]
  const previous = timeline.length >= 2 ? timeline[timeline.length - 2] : null

  const delta = previous
    ? {
        keyword_count: current.keyword_count - previous.keyword_count,
        top3_count: current.top3_count - previous.top3_count,
        top10_count: current.top10_count - previous.top10_count,
        top30_count: current.top30_count - previous.top30_count,
        top100_count: current.top100_count - previous.top100_count,
        estimated_traffic: current.estimated_traffic - previous.estimated_traffic,
        domain_rating: current.domain_rating - previous.domain_rating,
        backlinks_total: current.backlinks_total - previous.backlinks_total,
      }
    : {
        keyword_count: 0,
        top3_count: 0,
        top10_count: 0,
        top30_count: 0,
        top100_count: 0,
        estimated_traffic: 0,
        domain_rating: 0,
        backlinks_total: 0,
      }

  return { current, previous, delta, trend_4w: timeline }
}

function rowToSnapshot(r: any): ScanSnapshot {
  return {
    id: Number(r.id),
    user_id: r.user_id !== null ? Number(r.user_id) : null,
    domain: String(r.domain),
    scan_id: r.scan_id !== null ? Number(r.scan_id) : null,
    keyword_count: Number(r.keyword_count || 0),
    top3_count: Number(r.top3_count || 0),
    top10_count: Number(r.top10_count || 0),
    top30_count: Number(r.top30_count || 0),
    top100_count: Number(r.top100_count || 0),
    estimated_traffic: Number(r.estimated_traffic || 0),
    domain_rating: Number(r.domain_rating || 0),
    backlinks_total: Number(r.backlinks_total || 0),
    referring_domains: Number(r.referring_domains || 0),
    dofollow_ratio: Number(r.dofollow_ratio || 0),
    longtail_count: Number(r.longtail_count || 0),
    longtail_volume: Number(r.longtail_volume || 0),
    ai_score: Number(r.ai_score || 0),
    snapshot_date: String(r.snapshot_date),
    trigger_type: String(r.trigger_type || 'manual') as any,
    created_at: String(r.created_at),
  }
}
