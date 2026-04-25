// 롱테일 키워드 발견 (옵션 A + B 통합)
// A: 한국 지역 × 진료과목 매트릭스 배치 SERP 스캔
// B: 타겟 사이트 sitemap.xml 파싱 → URL 슬러그 역변환 → SERP 실측
//
// 공통: DataForSEO google/organic/live/regular API로 실제 Google 순위 측정
// 비용: 키워드당 $0.0006

import type { Bindings, LongTailKeyword, LongTailMeta } from './types'
import { fetchSerpRank, fetchSearchVolumes } from './dataforseo'
import { extractKeywordsFromSitemap } from './sitemap-parser'
import { buildRegionProcedureMatrix } from './korea-regions'

export interface LongTailOptions {
  mode?: 'sitemap' | 'matrix' | 'both'
  maxCandidates?: number           // 총 체크할 키워드 최대 수 (비용 상한)
  sitemapShare?: number            // sitemap 키워드에 할당할 비율 (0~1, 기본 0.5)
  specialty?: string               // 지역 단독 슬러그 해석용 (기본 '치과')
  concurrency?: number             // 병렬 SERP 요청 수 (기본 5)
  fetchVolumes?: boolean           // 발견된 키워드에 검색량까지 붙일지 (기본 true)
  // 진행률 콜백 (백그라운드 job 모드용)
  onProgress?: (info: {
    phase: 'sitemap' | 'matrix' | 'serp' | 'volumes' | 'saving'
    phase_label: string
    current: number
    total: number
    found_so_far: number
  }) => Promise<void>
}

const DEFAULT_MAX_CANDIDATES = 200
const CACHE_TTL = 60 * 60 * 24 * 3   // 3일

/**
 * 롱테일 키워드 발견 (옵션 A + B) — 청크 병렬 SERP로 진행률 콜백 지원
 */
export async function discoverLongTailKeywords(
  env: Bindings,
  domain: string,
  options: LongTailOptions = {},
): Promise<{ keywords: LongTailKeyword[]; meta: LongTailMeta }> {
  const {
    mode = 'both',
    maxCandidates = DEFAULT_MAX_CANDIDATES,
    sitemapShare = 0.5,
    specialty = '치과',
    concurrency = 5,
    fetchVolumes = true,
    onProgress,
  } = options

  const login = env.DATAFORSEO_LOGIN
  const password = env.DATAFORSEO_PASSWORD
  const emptyMeta: LongTailMeta = {
    sitemap_url: null,
    total_urls_crawled: 0,
    total_candidates: 0,
    scanned_count: 0,
    found_count: 0,
    total_cost: 0,
    mode,
  }
  if (!login || !password) return { keywords: [], meta: emptyMeta }

  // KV 캐시 (3일)
  const cacheKey = `longtail:${domain}:${mode}:${maxCandidates}`
  const cached = await env.CACHE.get(cacheKey, { type: 'json' }) as {
    keywords: LongTailKeyword[]
    meta: LongTailMeta
  } | null
  if (cached?.keywords) return cached

  // ─── 1) 키워드 후보 수집 ───
  const candidateSources: Array<{ kw: string; source: 'sitemap' | 'matrix' }> = []
  let sitemapUrl: string | null = null
  let totalUrls = 0

  // 옵션 B: sitemap에서 수집
  if (mode === 'sitemap' || mode === 'both') {
    await onProgress?.({
      phase: 'sitemap', phase_label: '사이트맵 파싱 중',
      current: 0, total: maxCandidates, found_so_far: 0,
    })
    const sitemapBudget = mode === 'both'
      ? Math.floor(maxCandidates * sitemapShare)
      : maxCandidates
    try {
      const r = await extractKeywordsFromSitemap(domain, {
        maxKeywords: sitemapBudget,
        baseSpecialty: specialty,
      })
      sitemapUrl = r.sitemapUrl
      totalUrls = r.totalUrls
      for (const kw of r.keywords) {
        candidateSources.push({ kw, source: 'sitemap' })
      }
    } catch (e) {
      console.error('sitemap extract failed:', e)
    }
  }

  // 옵션 A: 지역×진료 매트릭스
  if (mode === 'matrix' || mode === 'both') {
    await onProgress?.({
      phase: 'matrix', phase_label: '지역×진료 매트릭스 생성',
      current: candidateSources.length, total: maxCandidates, found_so_far: 0,
    })
    const remaining = Math.max(0, maxCandidates - candidateSources.length)
    if (remaining > 0) {
      const matrix = buildRegionProcedureMatrix(undefined, undefined, remaining)
      const seen = new Set(candidateSources.map(c => c.kw))
      for (const kw of matrix) {
        if (seen.has(kw)) continue
        candidateSources.push({ kw, source: 'matrix' })
      }
    }
  }

  const candidates = candidateSources.slice(0, maxCandidates)
  if (!candidates.length) {
    const meta = { ...emptyMeta, sitemap_url: sitemapUrl, total_urls_crawled: totalUrls }
    return { keywords: [], meta }
  }

  // ─── 2) 청크 병렬 SERP 실측 (진행률 보고) ───
  const sourceMap = new Map(candidates.map(c => [c.kw, c.source]))
  const allResults: Array<{ keyword: string; rank: number | null; url: string | null; total_results: number; found: boolean }> = []
  let totalCost = 0
  let foundSoFar = 0

  await onProgress?.({
    phase: 'serp', phase_label: 'Google SERP 실측 중',
    current: 0, total: candidates.length, found_so_far: 0,
  })

  // 청크 단위로 병렬 실행 + 각 청크 완료 시 progress 업데이트
  const CHUNK = concurrency
  for (let i = 0; i < candidates.length; i += CHUNK) {
    const chunk = candidates.slice(i, i + CHUNK)
    const chunkResults = await Promise.all(
      chunk.map(async c => {
        try {
          const { result, cost } = await fetchSerpRank({ login, password }, c.kw, domain, 100)
          totalCost += cost
          return result
        } catch (e: any) {
          return { keyword: c.kw, found: false, rank: null, url: null, total_results: 0 }
        }
      }),
    )
    for (const r of chunkResults) {
      allResults.push(r)
      if (r.found) foundSoFar++
    }
    await onProgress?.({
      phase: 'serp', phase_label: 'Google SERP 실측 중',
      current: Math.min(i + CHUNK, candidates.length),
      total: candidates.length,
      found_so_far: foundSoFar,
    })
  }

  // ─── 3) 히트만 추출 ───
  const hits = allResults.filter(r => r.found && r.rank !== null)

  // ─── 4) 검색량 일괄 조회 ───
  let volumeMap = new Map<string, number | null>()
  if (fetchVolumes && hits.length > 0) {
    await onProgress?.({
      phase: 'volumes', phase_label: '검색량 조회 중',
      current: candidates.length, total: candidates.length, found_so_far: hits.length,
    })
    try {
      const { rows, cost } = await fetchSearchVolumes({ login, password }, hits.map(h => h.keyword))
      totalCost += cost
      for (const r of rows) {
        volumeMap.set(r.keyword, r.search_volume > 0 ? r.search_volume : null)
      }
    } catch (e) {
      console.error('search volume fetch failed:', e)
    }
  }

  const longtail: LongTailKeyword[] = hits.map(h => ({
    keyword: h.keyword,
    rank: h.rank,
    ranked_url: h.url,
    search_volume: volumeMap.has(h.keyword) ? volumeMap.get(h.keyword)! : null,
    source: sourceMap.get(h.keyword) || 'matrix',
    total_results: h.total_results,
  }))

  // 순위 오름차순 → 검색량 내림차순
  longtail.sort((a, b) => {
    const ra = a.rank ?? 999
    const rb = b.rank ?? 999
    if (ra !== rb) return ra - rb
    return (b.search_volume ?? 0) - (a.search_volume ?? 0)
  })

  const meta: LongTailMeta = {
    sitemap_url: sitemapUrl,
    total_urls_crawled: totalUrls,
    total_candidates: candidates.length,
    scanned_count: allResults.length,
    found_count: hits.length,
    total_cost: Math.round(totalCost * 10000) / 10000,
    mode,
  }

  await onProgress?.({
    phase: 'saving', phase_label: '결과 저장 중',
    current: candidates.length, total: candidates.length, found_so_far: hits.length,
  })

  // KV 캐시
  await env.CACHE.put(cacheKey, JSON.stringify({ keywords: longtail, meta }), {
    expirationTtl: CACHE_TTL,
  })

  return { keywords: longtail, meta }
}
