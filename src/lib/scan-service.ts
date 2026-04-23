// 진단 서비스: DataForSEO 호출 + KV 캐시 + D1 저장

import type { Bindings, KeywordRow, ScanSummary, BacklinkSummary, BacklinkRow, CompetitorLinkGap } from './types'
import { fetchRankedKeywords, demoRankedKeywords } from './dataforseo'
import { analyzeBacklinks } from './backlinks'
import { computeCounters, extractDomain } from './utils'

const CACHE_TTL_SECONDS = 60 * 60 * 24 // 24h

/**
 * 해당 IP의 오늘 스캔 횟수 (월 3회 하드리밋용, 실제로는 30일 기준)
 */
export async function countRecentScansByIp(env: Bindings, ipHash: string, days = 30): Promise<number> {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) as c FROM scans WHERE ip_hash = ? AND created_at >= datetime('now', '-' || ? || ' days')`
  ).bind(ipHash, days).first<{ c: number }>()
  return Number(row?.c ?? 0)
}

/**
 * 진단 실행 (비회원 포함)
 * - KV 24h 캐시 사용
 * - D1에 scan + keyword_snapshots 저장
 * - DataForSEO 키가 없으면 데모 모드로 동작 (개발/데모용)
 */
export async function runScan(
  env: Bindings,
  rawInput: string,
  opts: { ipHash?: string; userId?: number } = {}
): Promise<ScanSummary> {
  const domain = extractDomain(rawInput)
  if (!domain) throw new Error('올바른 URL 형식이 아닙니다')

  const cacheKey = `scan:${domain}`
  const cached = await env.CACHE.get(cacheKey, { type: 'json' }) as { keywords: KeywordRow[] } | null

  let keywords: KeywordRow[]
  let rawData: any
  let fromCache = false

  if (cached?.keywords?.length) {
    keywords = cached.keywords
    rawData = { cached: true }
    fromCache = true
  } else {
    const login = env.DATAFORSEO_LOGIN
    const password = env.DATAFORSEO_PASSWORD
    if (login && password) {
      const res = await fetchRankedKeywords({ login, password }, domain, 1000)
      keywords = res.keywords
      rawData = { cost: res.cost, count: keywords.length }
    } else {
      // 데모 모드 (API 키 미설정 시)
      const res = demoRankedKeywords(domain)
      keywords = res.keywords
      rawData = { demo: true, count: keywords.length }
    }
    // KV 캐싱
    await env.CACHE.put(cacheKey, JSON.stringify({ keywords }), { expirationTtl: CACHE_TTL_SECONDS })
  }

  const counters = computeCounters(keywords)

  // D1 저장
  const scanRes = await env.DB.prepare(
    `INSERT INTO scans (user_id, url, ip_hash, keyword_count, top3_count, top10_count, top30_count, top100_count, estimated_traffic, raw_data, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'done')`
  ).bind(
    opts.userId ?? null,
    domain,
    opts.ipHash ?? null,
    counters.total,
    counters.top3,
    counters.top10,
    counters.top30,
    counters.top100,
    counters.estimated_traffic,
    JSON.stringify({ ...rawData, fromCache }),
  ).run()

  const scanId = Number(scanRes.meta.last_row_id)

  // 키워드 스냅샷 (최대 200개까지만 저장 - D1 용량 절약)
  const toSave = keywords.slice(0, 200)
  if (toSave.length > 0) {
    const stmts = toSave.map(k =>
      env.DB.prepare(
        `INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(scanId, k.keyword, k.rank, k.search_volume, k.ranked_url, k.etv)
    )
    await env.DB.batch(stmts)
  }

  // 백링크 분석 (KV 캐시 사용, 비용 추가 없음)
  let backlinkSummary: BacklinkSummary | undefined
  let backlinks: BacklinkRow[] | undefined
  let competitorGap: CompetitorLinkGap[] | undefined
  try {
    const bl = await analyzeBacklinks(env, domain)
    backlinkSummary = bl.summary
    backlinks = bl.links
    competitorGap = bl.gap
  } catch (e) {
    console.error('backlinks analyze failed:', e)
  }

  return {
    scanId,
    url: domain,
    domain,
    keyword_count: counters.total,
    top3_count: counters.top3,
    top10_count: counters.top10,
    top30_count: counters.top30,
    top100_count: counters.top100,
    estimated_traffic: counters.estimated_traffic,
    created_at: new Date().toISOString(),
    keywords,
    is_gated: !opts.userId,
    backlink_summary: backlinkSummary,
    backlinks,
    competitor_gap: competitorGap,
  }
}

/**
 * 저장된 scan 불러오기
 */
export async function getScanById(env: Bindings, scanId: number): Promise<ScanSummary | null> {
  const scan = await env.DB.prepare(
    `SELECT id, user_id, url, keyword_count, top3_count, top10_count, top30_count, top100_count, estimated_traffic, created_at FROM scans WHERE id = ?`
  ).bind(scanId).first<any>()
  if (!scan) return null

  const kws = await env.DB.prepare(
    `SELECT keyword, rank, search_volume, ranked_url, etv FROM keyword_snapshots WHERE scan_id = ? ORDER BY search_volume DESC, rank ASC`
  ).bind(scanId).all<KeywordRow>()

  const lead = await env.DB.prepare(`SELECT id FROM leads WHERE scan_id = ? LIMIT 1`).bind(scanId).first<any>()
  const hasLead = !!lead
  const hasUser = !!scan.user_id

  // 백링크도 같이 불러오기 (KV 캐시 히트면 공짜)
  let backlinkSummary: BacklinkSummary | undefined
  let backlinks: BacklinkRow[] | undefined
  let competitorGap: CompetitorLinkGap[] | undefined
  try {
    const bl = await analyzeBacklinks(env, scan.url)
    backlinkSummary = bl.summary
    backlinks = bl.links
    competitorGap = bl.gap
  } catch (e) {
    console.error('backlinks analyze failed:', e)
  }

  return {
    scanId: Number(scan.id),
    url: scan.url,
    domain: scan.url,
    keyword_count: Number(scan.keyword_count || 0),
    top3_count: Number(scan.top3_count || 0),
    top10_count: Number(scan.top10_count || 0),
    top30_count: Number(scan.top30_count || 0),
    top100_count: Number(scan.top100_count || 0),
    estimated_traffic: Number(scan.estimated_traffic || 0),
    created_at: scan.created_at,
    keywords: (kws.results || []) as KeywordRow[],
    is_gated: !hasUser && !hasLead,
    backlink_summary: backlinkSummary,
    backlinks,
    competitor_gap: competitorGap,
  }
}
