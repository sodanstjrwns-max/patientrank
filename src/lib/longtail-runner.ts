// 롱테일 스캔 Self-Chaining Runner
// 각 청크(5 SERP)를 처리하고 self-fetch로 다음 청크 트리거 → CPU 30s 제한 우회

import type { Bindings, LongTailKeyword, LongTailMeta } from './types'
import type { JobState, JobCandidate } from './longtail-job'
import { saveJob, completeJob, failJob, signChunkToken } from './longtail-job'
import { fetchSerpRank, fetchSearchVolumes } from './dataforseo'
import { extractKeywordsFromSitemap } from './sitemap-parser'
import { buildRegionProcedureMatrix } from './korea-regions'

const CHUNK_SIZE = 5   // 한 번에 처리할 SERP 수 (병렬)
const CACHE_TTL = 60 * 60 * 24 * 3

/**
 * 1단계: 후보 수집 (sitemap + 매트릭스) → job에 저장 → 첫 청크 트리거
 */
export async function prepareAndStartChunks(
  env: Bindings,
  job: JobState,
  appUrl: string,
): Promise<void> {
  try {
    // Phase: sitemap 파싱
    job.status = 'running'
    job.progress = {
      phase: 'sitemap', phase_label: '사이트맵 파싱 중',
      current: 1, total: job.max_candidates + 10,
      percent: 0, found_so_far: 0,
    }
    await saveJob(env, job)

    const candidates: JobCandidate[] = []
    let sitemapUrl: string | null = null
    let totalUrls = 0

    if (job.mode === 'sitemap' || job.mode === 'both') {
      const sitemapBudget = job.mode === 'both'
        ? Math.floor(job.max_candidates * 0.5)
        : job.max_candidates
      try {
        const r = await extractKeywordsFromSitemap(job.domain, {
          maxKeywords: sitemapBudget,
          baseSpecialty: '치과',
        })
        sitemapUrl = r.sitemapUrl
        totalUrls = r.totalUrls
        for (const kw of r.keywords) candidates.push({ kw, source: 'sitemap' })
      } catch (e) {
        console.error('sitemap extract failed:', e)
      }
    }

    // Phase: matrix
    job.progress.phase = 'matrix'
    job.progress.phase_label = '지역×진료 매트릭스 생성'
    job.progress.current = 5
    await saveJob(env, job)

    if (job.mode === 'matrix' || job.mode === 'both') {
      const remaining = Math.max(0, job.max_candidates - candidates.length)
      if (remaining > 0) {
        const matrix = buildRegionProcedureMatrix(undefined, undefined, remaining)
        const seen = new Set(candidates.map(c => c.kw))
        for (const kw of matrix) {
          if (seen.has(kw)) continue
          candidates.push({ kw, source: 'matrix' })
        }
      }
    }

    const finalCandidates = candidates.slice(0, job.max_candidates)

    // 후보 저장
    job.candidates = finalCandidates
    job.chunk_index = 0
    job.hits = []
    job.sitemap_url = sitemapUrl
    job.total_urls_crawled = totalUrls
    job.total_cost = 0
    job.progress = {
      phase: 'serp',
      phase_label: 'Google SERP 실측 중',
      current: 10,
      total: finalCandidates.length + 10,
      percent: 0,
      found_so_far: 0,
    }
    await saveJob(env, job)

    if (finalCandidates.length === 0) {
      await completeJob(env, job.jobId, {
        keywords: [],
        meta: {
          sitemap_url: sitemapUrl,
          total_urls_crawled: totalUrls,
          total_candidates: 0, scanned_count: 0, found_count: 0,
          total_cost: 0, mode: job.mode,
        },
      })
      return
    }

    // 첫 청크 self-fetch 트리거
    await triggerNextChunk(env, job.jobId, 0, appUrl)
  } catch (e: any) {
    console.error('prepareAndStartChunks failed:', e)
    await failJob(env, job.jobId, String(e?.message || e))
  }
}

/**
 * Self-fetch로 다음 청크 트리거 (수신 측이 즉시 202 반환하므로 짧은 대기)
 * 각 청크는 새 Worker 인스턴스에서 실행 → CPU 30s 제한 우회
 */
export async function triggerNextChunk(
  env: Bindings,
  jobId: string,
  chunkIndex: number,
  appUrl: string,
): Promise<void> {
  const token = await signChunkToken(env, jobId, chunkIndex)
  const url = `${appUrl}/api/_internal/longtail/chunk?job_id=${jobId}&idx=${chunkIndex}&token=${token}`
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)
    await fetch(url, { method: 'POST', signal: ctrl.signal }).catch(() => {})
    clearTimeout(timer)
  } catch {}
}

/**
 * 준비 단계(sitemap+matrix 수집)를 별도 워커로 트리거
 * start 엔드포인트가 이걸 호출하고 즉시 반환 → 원본 워커의 CPU 30s 제한을 sitemap 파싱이 잡아먹지 않음
 */
export async function triggerPrepare(
  env: Bindings,
  jobId: string,
  appUrl: string,
): Promise<void> {
  const token = await signChunkToken(env, jobId, 'prepare')
  const url = `${appUrl}/api/_internal/longtail/prepare?job_id=${jobId}&token=${token}`
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)
    await fetch(url, { method: 'POST', signal: ctrl.signal }).catch(() => {})
    clearTimeout(timer)
  } catch {}
}

/**
 * 한 청크 처리: chunkIndex × CHUNK_SIZE 부터 CHUNK_SIZE개를 병렬 SERP 실행
 * 완료 후 다음 청크 트리거 OR 최종 완료 처리
 */
export async function processChunk(
  env: Bindings,
  jobId: string,
  chunkIndex: number,
  appUrl: string,
): Promise<void> {
  const { getJob, saveJob } = await import('./longtail-job')
  const job = await getJob(env, jobId)
  if (!job) return
  if (job.status !== 'running') return

  const candidates = job.candidates || []
  const start = chunkIndex * CHUNK_SIZE
  const end = Math.min(start + CHUNK_SIZE, candidates.length)
  if (start >= candidates.length) {
    // 모든 청크 완료 → 마무리
    await finalizeJob(env, job)
    return
  }

  const chunk = candidates.slice(start, end)
  const login = env.DATAFORSEO_LOGIN!
  const password = env.DATAFORSEO_PASSWORD!

  try {
    const chunkResults = await Promise.all(chunk.map(async c => {
      try {
        const { result, cost } = await fetchSerpRank({ login, password }, c.kw, job.domain, 100)
        return { result, cost, source: c.source }
      } catch (e: any) {
        return {
          result: { keyword: c.kw, found: false, rank: null, url: null, total_results: 0 },
          cost: 0,
          source: c.source,
        }
      }
    }))

    // hit 추가 + cost 누적
    for (const { result, cost, source } of chunkResults) {
      job.total_cost = (job.total_cost || 0) + cost
      if (result.found && result.rank != null) {
        job.hits = job.hits || []
        job.hits.push({
          keyword: result.keyword,
          rank: result.rank,
          url: result.url || '',
          total_results: result.total_results,
          source,
        })
      }
    }

    job.chunk_index = chunkIndex + 1
    job.progress.current = 10 + end
    job.progress.found_so_far = (job.hits || []).length
    await saveJob(env, job)

    // 다음 청크 트리거 (비동기)
    if (end < candidates.length) {
      await triggerNextChunk(env, jobId, chunkIndex + 1, appUrl)
    } else {
      // 마지막 청크였다면 마무리
      await finalizeJob(env, job)
    }
  } catch (e: any) {
    console.error('processChunk error:', e)
    await failJob(env, jobId, String(e?.message || e))
  }
}

/**
 * 모든 청크 완료 후 검색량 fetch + 결과 저장
 */
async function finalizeJob(env: Bindings, job: JobState): Promise<void> {
  const hits = job.hits || []

  // 검색량 일괄 조회
  job.progress.phase = 'volumes'
  job.progress.phase_label = '검색량 조회 중'
  job.progress.current = (job.candidates?.length || 0) + 8
  await saveJob(env, job)

  const login = env.DATAFORSEO_LOGIN!
  const password = env.DATAFORSEO_PASSWORD!
  const volumeMap = new Map<string, number | null>()
  if (hits.length > 0) {
    try {
      const { rows, cost } = await fetchSearchVolumes({ login, password }, hits.map(h => h.keyword))
      job.total_cost = (job.total_cost || 0) + cost
      for (const r of rows) {
        volumeMap.set(r.keyword, r.search_volume > 0 ? r.search_volume : null)
      }
    } catch (e) {
      console.error('volume fetch failed:', e)
    }
  }

  // 결과 조립
  const longtail: LongTailKeyword[] = hits.map(h => ({
    keyword: h.keyword,
    rank: h.rank,
    ranked_url: h.url || null,
    search_volume: volumeMap.has(h.keyword) ? volumeMap.get(h.keyword)! : null,
    source: h.source,
    total_results: h.total_results,
  }))
  longtail.sort((a, b) => {
    const ra = a.rank ?? 999
    const rb = b.rank ?? 999
    if (ra !== rb) return ra - rb
    return (b.search_volume ?? 0) - (a.search_volume ?? 0)
  })

  const meta: LongTailMeta = {
    sitemap_url: job.sitemap_url ?? null,
    total_urls_crawled: job.total_urls_crawled ?? 0,
    total_candidates: (job.candidates || []).length,
    scanned_count: (job.candidates || []).length,
    found_count: hits.length,
    total_cost: Math.round((job.total_cost || 0) * 10000) / 10000,
    mode: job.mode,
  }

  // KV 캐시 (getScanById가 이 키로 조회)
  const cacheKey = `longtail:${job.domain}:${job.mode}:${job.max_candidates}`
  await env.CACHE.put(cacheKey, JSON.stringify({ keywords: longtail, meta }), {
    expirationTtl: CACHE_TTL,
  })

  // 완료 처리
  await completeJob(env, job.jobId, { keywords: longtail, meta })
}
