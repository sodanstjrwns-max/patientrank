// 롱테일 스캔 백그라운드 Job 매니저 (KV 기반 + Self-chaining fetch)
// - 각 청크를 새 Worker 인스턴스에서 실행하여 CPU 30초 제한 우회
// - KV에 진행률/결과 저장 → 프런트가 2초마다 폴링

import type { Bindings, LongTailKeyword, LongTailMeta } from './types'

export type JobStatus = 'pending' | 'running' | 'done' | 'failed'
export type JobPhase = 'init' | 'sitemap' | 'matrix' | 'serp' | 'volumes' | 'saving' | 'done'

export interface JobCandidate {
  kw: string
  source: 'sitemap' | 'matrix'
}

export interface JobState {
  jobId: string
  scanId: number
  domain: string
  status: JobStatus
  progress: {
    phase: JobPhase
    phase_label: string
    current: number
    total: number
    percent: number
    found_so_far: number
  }
  mode: 'sitemap' | 'matrix' | 'both'
  max_candidates: number
  started_at: string
  updated_at: string
  finished_at?: string
  error?: string
  // 체이닝 상태
  candidates?: JobCandidate[]       // 전체 후보 리스트
  chunk_index?: number              // 다음 처리할 청크 인덱스
  hits?: Array<{                    // 지금까지 발견한 히트
    keyword: string
    rank: number
    url: string
    total_results: number
    source: 'sitemap' | 'matrix'
  }>
  sitemap_url?: string | null
  total_urls_crawled?: number
  total_cost?: number
  // 완료 시
  result?: {
    keywords: LongTailKeyword[]
    meta: LongTailMeta
  }
}

const JOB_TTL = 60 * 60 * 2

function jobKey(jobId: string): string { return `longtail:job:${jobId}` }
function activeKey(scanId: number): string { return `longtail:active:${scanId}` }

export async function createJob(
  env: Bindings,
  params: { scanId: number; domain: string; mode: 'sitemap' | 'matrix' | 'both'; maxCandidates: number },
): Promise<JobState> {
  const jobId = crypto.randomUUID()
  const now = new Date().toISOString()
  const state: JobState = {
    jobId,
    scanId: params.scanId,
    domain: params.domain,
    status: 'pending',
    progress: {
      phase: 'init', phase_label: '준비 중',
      current: 0, total: params.maxCandidates + 10,
      percent: 0, found_so_far: 0,
    },
    mode: params.mode,
    max_candidates: params.maxCandidates,
    started_at: now,
    updated_at: now,
    chunk_index: 0,
    hits: [],
    total_cost: 0,
  }
  await env.CACHE.put(jobKey(jobId), JSON.stringify(state), { expirationTtl: JOB_TTL })
  await env.CACHE.put(activeKey(params.scanId), jobId, { expirationTtl: JOB_TTL })
  return state
}

export async function getJob(env: Bindings, jobId: string): Promise<JobState | null> {
  const raw = await env.CACHE.get(jobKey(jobId))
  if (!raw) return null
  try { return JSON.parse(raw) as JobState } catch { return null }
}

export async function getActiveJobForScan(env: Bindings, scanId: number): Promise<JobState | null> {
  const jobId = await env.CACHE.get(activeKey(scanId))
  if (!jobId) return null
  return getJob(env, jobId)
}

export async function saveJob(env: Bindings, state: JobState): Promise<void> {
  state.updated_at = new Date().toISOString()
  if (state.progress.total > 0) {
    state.progress.percent = Math.min(100, Math.round((state.progress.current / state.progress.total) * 100))
  }
  await env.CACHE.put(jobKey(state.jobId), JSON.stringify(state), { expirationTtl: JOB_TTL })
}

export async function updateJob(
  env: Bindings,
  jobId: string,
  patch: Partial<JobState> & { progress?: Partial<JobState['progress']> },
): Promise<JobState | null> {
  const current = await getJob(env, jobId)
  if (!current) return null
  const next: JobState = {
    ...current,
    ...patch,
    progress: { ...current.progress, ...(patch.progress || {}) },
  }
  await saveJob(env, next)
  return next
}

export async function completeJob(
  env: Bindings,
  jobId: string,
  result: { keywords: LongTailKeyword[]; meta: LongTailMeta },
): Promise<void> {
  await updateJob(env, jobId, {
    status: 'done',
    result,
    finished_at: new Date().toISOString(),
    progress: {
      phase: 'done', phase_label: '완료',
      current: 100, total: 100, percent: 100,
      found_so_far: result.meta.found_count,
    },
  })
}

export async function failJob(env: Bindings, jobId: string, error: string): Promise<void> {
  await updateJob(env, jobId, {
    status: 'failed',
    error: error.slice(0, 500),
    finished_at: new Date().toISOString(),
  })
}

/**
 * 내부 체이닝용 서명 생성 (단순 HMAC)
 * 외부 공격자가 /_internal/longtail/*를 마음대로 못 부르게 하는 용도
 * stage: "prepare" | 청크 인덱스(숫자 문자열)
 */
export async function signChunkToken(env: Bindings, jobId: string, stage: string | number): Promise<string> {
  const secret = env.JWT_SECRET || 'dev-only'
  const msg = `${jobId}:${stage}`
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  const bytes = new Uint8Array(sig)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function verifyChunkToken(
  env: Bindings, jobId: string, stage: string | number, token: string,
): Promise<boolean> {
  const expected = await signChunkToken(env, jobId, stage)
  return expected === token
}
