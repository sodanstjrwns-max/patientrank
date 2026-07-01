// API 라우트
import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { extractDomain, getClientIp, hashIp } from '../lib/utils'
import { runScan, countRecentScansByIp, getScanById } from '../lib/scan-service'
import { discoverLongTailKeywords } from '../lib/longtail-discovery'
import { prepareAndStartChunks, processChunk, triggerPrepare } from '../lib/longtail-runner'
import { verifyChunkToken } from '../lib/longtail-job'
import {
  getValidGscAccessToken,
  listGscSites,
  syncGscForScan,
  loadGscKeywordsForScan,
  disconnectGsc,
} from '../lib/gsc'

const api = new Hono<{ Bindings: Bindings }>()

// 헬스체크
api.get('/health', (c) => c.json({ ok: true, service: 'patientrank', ts: new Date().toISOString() }))

/**
 * POST /api/scan
 * body: { url: string }
 * 비회원 진단 실행 (IP 해시 기반 월 3회 제한)
 */
api.post('/scan', async (c) => {
  const body = await c.req.json().catch(() => ({})) as { url?: string; max_rank?: number }
  const raw = (body?.url || '').trim()
  const domain = extractDomain(raw)
  if (!domain) {
    return c.json({ error: 'INVALID_URL', message: '올바른 URL 형식이 아닙니다' }, 400)
  }

  const maxRank = body?.max_rank === 500 ? 500 : 100

  const ip = getClientIp(c.req.raw)
  const ipHash = await hashIp(ip)

  // 로그인 유저는 하드리밋 우회 (admin/유료는 더더욱)
  const { getUserFromCookie } = await import('../lib/auth')
  const viewer = await getUserFromCookie(c)
  const isPrivileged = !!(viewer && (viewer.is_admin === 1 || viewer.plan !== 'free'))

  if (!isPrivileged) {
    const recentCount = await countRecentScansByIp(c.env, ipHash, 30)
    if (recentCount >= 3) {
      return c.json({
        error: 'RATE_LIMIT',
        message: '월 3회 무료 조회를 모두 사용했습니다. Basic 플랜으로 업그레이드해주세요',
        count: recentCount,
      }, 429)
    }
  }

  try {
    const result = await runScan(c.env, domain, {
      ipHash,
      userId: viewer?.id,
      maxRank,
    })
    return c.json({ ok: true, scan: result })
  } catch (e: any) {
    console.error('scan error', e)
    return c.json({ error: 'SCAN_FAILED', message: e?.message || '진단 중 오류가 발생했습니다' }, 500)
  }
})

/**
 * GET /api/scan/:id
 * 결과 조회
 */
api.get('/scan/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'BAD_ID' }, 400)
  const scan = await getScanById(c.env, id)
  if (!scan) return c.json({ error: 'NOT_FOUND' }, 404)
  return c.json({ ok: true, scan })
})

/**
 * GET /api/scan/:id/prescriptions
 * 콘텐츠 처방전 — 우선순위 스코어링된 콘텐츠 제작 기회 리스트
 * 비회원: 상위 3건 / 회원(유료·본인): 전체
 */
api.get('/scan/:id/prescriptions', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'BAD_ID' }, 400)
  const scan = await getScanById(c.env, id)
  if (!scan) return c.json({ error: 'NOT_FOUND' }, 404)

  const { getUserFromCookie } = await import('../lib/auth')
  const viewer = await getUserFromCookie(c)
  const isPaid = !!(viewer && (viewer.is_admin === 1 || viewer.plan !== 'free'))

  const { generatePrescriptions } = await import('../lib/content-prescription')
  const report = await generatePrescriptions(c.env, scan, { limit: isPaid ? 20 : 10, userId: viewer?.id })

  if (!isPaid) {
    report.prescriptions = report.prescriptions.slice(0, 3)
  }
  return c.json({ ok: true, report, gated: !isPaid })
})

/**
 * 롱테일 스캔 권한 체크 (공통)
 */
async function checkLongtailAuth(c: any, scanId: number) {
  const { getUserFromCookie } = await import('../lib/auth')
  const viewer = await getUserFromCookie(c)
  if (!viewer) {
    return { ok: false as const, status: 401, body: { error: 'AUTH_REQUIRED', message: '롱테일 키워드 발견은 로그인 후 이용 가능합니다' } }
  }
  const scan = await c.env.DB.prepare(
    `SELECT id, url, user_id FROM scans WHERE id = ?`
  ).bind(scanId).first<any>()
  if (!scan) return { ok: false as const, status: 404, body: { error: 'NOT_FOUND' } }

  const isPrivileged = viewer.is_admin === 1 || viewer.plan !== 'free'
  const isOwner = scan.user_id && Number(scan.user_id) === viewer.id
  if (!isPrivileged && !isOwner) {
    return { ok: false as const, status: 403, body: { error: 'PLAN_REQUIRED', message: '롱테일 발견은 Basic 플랜 이상 또는 본인 스캔에서만 가능합니다' } }
  }
  return { ok: true as const, viewer, scan }
}

/**
 * POST /api/scan/:id/longtail/start
 * 롱테일 스캔 백그라운드 시작 → job_id 즉시 반환 (<1초)
 * ctx.waitUntil()로 응답 후에도 계속 실행 (Workers는 CPU 30s + Wall Clock 최대 15분)
 */
api.post('/scan/:id/longtail/start', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'BAD_ID' }, 400)

  const auth = await checkLongtailAuth(c, id)
  if (!auth.ok) return c.json(auth.body, auth.status as any)

  const body = await c.req.json().catch(() => ({})) as { mode?: 'sitemap' | 'matrix' | 'both'; max?: number; force?: boolean }
  const mode = (body?.mode === 'sitemap' || body?.mode === 'matrix') ? body.mode : 'both'
  const maxCandidates = Math.max(20, Math.min(300, Number(body?.max) || 200))

  const { createJob, getActiveJobForScan, updateJob, completeJob, failJob } = await import('../lib/longtail-job')

  // 이미 실행 중인 job이 있으면 그것을 반환 (중복 실행 방지)
  if (!body?.force) {
    const existing = await getActiveJobForScan(c.env, id)
    if (existing && (existing.status === 'pending' || existing.status === 'running')) {
      return c.json({ ok: true, job: existing, reused: true })
    }
    // 완료된 job도 3분 이내면 재사용 (캐시처럼)
    if (existing && existing.status === 'done' && existing.finished_at) {
      const elapsed = Date.now() - new Date(existing.finished_at).getTime()
      if (elapsed < 3 * 60 * 1000) {
        return c.json({ ok: true, job: existing, reused: true })
      }
    }
  }

  // 새 job 생성
  const job = await createJob(c.env, {
    scanId: id,
    domain: auth.scan.url,
    mode,
    maxCandidates,
  })

  // Self-chaining 방식: 준비 단계(sitemap+matrix)도 별도 워커로 분리
  // start 워커는 job 생성 + prepare 트리거만 하고 즉시 응답 → 진짜 1초 안에 끝
  // sitemap 파싱이 무거워도 원본 워커 CPU 30s 제한에 영향 없음
  const appUrl = (c.env.APP_URL || new URL(c.req.url).origin).replace(/\/$/, '')
  c.executionCtx.waitUntil(
    triggerPrepare(c.env, job.jobId, appUrl).catch((e: any) => {
      console.error('trigger prepare failed:', e)
    })
  )

  return c.json({ ok: true, job, reused: false })
})

/**
 * POST /api/_internal/longtail/prepare?job_id=&token=
 * 내부 전용 — sitemap 파싱 + 매트릭스 생성 + 첫 청크 트리거
 * 이 워커는 sitemap 파싱만 담당하고 CPU 30s 안에 끝남 → 이후 청크는 자기들이 알아서 체이닝
 */
api.post('/_internal/longtail/prepare', async (c) => {
  const jobId = c.req.query('job_id') || ''
  const token = c.req.query('token') || ''
  if (!jobId || !token) return c.json({ error: 'BAD_REQUEST' }, 400)
  const valid = await verifyChunkToken(c.env, jobId, 'prepare', token)
  if (!valid) return c.json({ error: 'BAD_TOKEN' }, 401)

  const { getJob, failJob } = await import('../lib/longtail-job')
  const job = await getJob(c.env, jobId)
  if (!job) return c.json({ error: 'NO_JOB' }, 404)

  const appUrl = (c.env.APP_URL || new URL(c.req.url).origin).replace(/\/$/, '')
  c.executionCtx.waitUntil(
    prepareAndStartChunks(c.env, job, appUrl).catch(async (e: any) => {
      console.error('longtail prepare failed:', e)
      await failJob(c.env, jobId, String(e?.message || e))
    })
  )
  return c.json({ ok: true, accepted: true })
})

/**
 * POST /api/_internal/longtail/chunk?job_id=&idx=&token=
 * 내부 체이닝 전용 — 외부 호출 금지 (HMAC 토큰 검증)
 * 200 즉시 반환하고 waitUntil로 청크 실행 → 다음 청크는 이 엔드포인트를 재귀적으로 self-fetch
 */
api.post('/_internal/longtail/chunk', async (c) => {
  const jobId = c.req.query('job_id') || ''
  const idx = Number(c.req.query('idx') || 0)
  const token = c.req.query('token') || ''
  if (!jobId || !token || !Number.isFinite(idx) || idx < 0) {
    return c.json({ error: 'BAD_REQUEST' }, 400)
  }
  const valid = await verifyChunkToken(c.env, jobId, idx, token)
  if (!valid) return c.json({ error: 'BAD_TOKEN' }, 401)

  const appUrl = (c.env.APP_URL || new URL(c.req.url).origin).replace(/\/$/, '')
  // 청크 실행은 백그라운드 — 즉시 응답해서 호출자(직전 워커)가 3초 타임아웃에 안 걸리도록
  c.executionCtx.waitUntil(
    processChunk(c.env, jobId, idx, appUrl).catch((e: any) => {
      console.error(`chunk ${idx} failed:`, e)
    })
  )
  return c.json({ ok: true, accepted: true, idx })
})

/**
 * GET /api/scan/:id/longtail/status?job_id=...
 * 롱테일 스캔 진행률 조회 (프런트가 2초마다 폴링)
 * job_id 없으면 scan_id에 활성화된 최근 job 반환
 */
api.get('/scan/:id/longtail/status', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'BAD_ID' }, 400)

  const auth = await checkLongtailAuth(c, id)
  if (!auth.ok) return c.json(auth.body, auth.status as any)

  const jobId = c.req.query('job_id')
  const { getJob, getActiveJobForScan } = await import('../lib/longtail-job')
  const job = jobId ? await getJob(c.env, jobId) : await getActiveJobForScan(c.env, id)
  if (!job) return c.json({ ok: false, error: 'NO_JOB' }, 404)

  // Watchdog: running인데 updated_at이 60초 이상 정체된 job이면 마지막 청크부터 재개
  // (체인이 도중에 죽었을 때 프런트 폴링이 자동 복구 트리거 역할)
  if (job.status === 'running' && job.updated_at) {
    const staleMs = Date.now() - new Date(job.updated_at).getTime()
    if (staleMs > 60_000) {
      const nextIdx = job.chunk_index ?? 0
      const appUrl = (c.env.APP_URL || new URL(c.req.url).origin).replace(/\/$/, '')
      const { triggerNextChunk } = await import('../lib/longtail-runner')
      c.executionCtx.waitUntil(
        triggerNextChunk(c.env, job.jobId, nextIdx, appUrl).catch(() => {})
      )
      ;(job as any).watchdog_resumed = { at_idx: nextIdx, stale_ms: staleMs }
    }
  }

  return c.json({ ok: true, job })
})

/**
 * POST /api/scan/:id/longtail
 * 롱테일 키워드 발견 (옵션 A + B)
 * - 지역×진료 매트릭스 스캔 + sitemap.xml 역추적
 * - 비용: 키워드 200개 × $0.0006 ≈ $0.12/스캔
 * - 권한: admin/유료 플랜은 무제한, 무료 유저는 월 1회만
 */
api.post('/scan/:id/longtail', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'BAD_ID' }, 400)

  const scan = await c.env.DB.prepare(
    `SELECT id, url, user_id FROM scans WHERE id = ?`
  ).bind(id).first<any>()
  if (!scan) return c.json({ error: 'NOT_FOUND' }, 404)

  // 권한 체크
  const { getUserFromCookie } = await import('../lib/auth')
  const viewer = await getUserFromCookie(c)
  const isPrivileged = !!(viewer && (viewer.is_admin === 1 || viewer.plan !== 'free'))
  const isOwner = !!(viewer && scan.user_id && Number(scan.user_id) === viewer.id)

  if (!isPrivileged && !isOwner) {
    return c.json({
      error: 'UPGRADE_REQUIRED',
      message: '롱테일 키워드 발견은 Basic 플랜부터 사용 가능합니다',
    }, 403)
  }

  const body = await c.req.json().catch(() => ({})) as { mode?: 'sitemap' | 'matrix' | 'both'; max?: number }
  const mode = body?.mode || 'both'
  const maxCandidates = Math.min(Math.max(Number(body?.max) || 200, 30), 500)

  try {
    const result = await discoverLongTailKeywords(c.env, scan.url, {
      mode,
      maxCandidates,
    })
    return c.json({ ok: true, ...result })
  } catch (e: any) {
    console.error('longtail discovery failed', e)
    return c.json({ error: 'DISCOVERY_FAILED', message: e?.message || '롱테일 스캔 실패' }, 500)
  }
})

/**
 * POST /api/leads
 * body: { scan_id, email, clinic_name?, specialty?, doctor_name?, kakao_opt_in? }
 * 이메일 게이팅: 리드 저장 + 전체 키워드 잠금 해제
 */
api.post('/leads', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  const scanId = Number(body?.scan_id)
  const email = String(body?.email || '').trim().toLowerCase()
  const clinicName = body?.clinic_name ? String(body.clinic_name).trim() : null
  const specialty = body?.specialty ? String(body.specialty).trim() : null
  const doctorName = body?.doctor_name ? String(body.doctor_name).trim() : null
  const kakaoOptIn = body?.kakao_opt_in ? 1 : 0

  if (!scanId || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'INVALID_INPUT', message: '이메일과 스캔 ID가 필요합니다' }, 400)
  }

  const scan = await c.env.DB.prepare(`SELECT id FROM scans WHERE id = ?`).bind(scanId).first<any>()
  if (!scan) return c.json({ error: 'NOT_FOUND' }, 404)

  await c.env.DB.prepare(
    `INSERT INTO leads (scan_id, email, clinic_name, specialty, doctor_name, kakao_opt_in)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(scanId, email, clinicName, specialty, doctorName, kakaoOptIn).run()

  // Resend 이메일 발송 (키가 있을 때만)
  if (c.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Patient Rank <report@patientrank.kr>',
          to: [email],
          subject: 'Patient Rank 구글 SEO 진단 리포트',
          html: `
            <div style="font-family:Pretendard,sans-serif;max-width:560px;margin:0 auto;padding:24px">
              <h2 style="color:#0066FF">Patient Rank 진단 리포트</h2>
              <p>${clinicName ? clinicName + ' ' : ''}${doctorName ? doctorName + ' 원장님' : '원장님'}, 안녕하세요.</p>
              <p>요청하신 구글 SEO 진단 리포트가 준비되었습니다.</p>
              <p><a href="${c.env.APP_URL}/result/${scanId}" style="display:inline-block;padding:12px 24px;background:#0066FF;color:white;border-radius:8px;text-decoration:none">전체 리포트 확인</a></p>
              <hr style="margin:32px 0;border:none;border-top:1px solid #eee">
              <p style="font-size:12px;color:#999">Patient Rank · 국내 최초 의료기관 전용 구글 SEO 진단</p>
            </div>
          `,
        }),
      })
    } catch (e) {
      console.error('resend error', e)
    }
  }

  return c.json({ ok: true, message: '리포트가 발송되었습니다' })
})

/**
 * 공통: GSC 권한 체크 (프리미엄 + 본인 스캔)
 */
async function checkGscAuth(c: any) {
  const { getUserFromCookie } = await import('../lib/auth')
  const viewer = await getUserFromCookie(c)
  if (!viewer) {
    return { ok: false as const, status: 401, body: { error: 'AUTH_REQUIRED', message: '로그인이 필요합니다' } }
  }
  const allowed = viewer.is_admin === 1 || viewer.plan === 'pro' || viewer.plan === 'agency'
  if (!allowed) {
    return { ok: false as const, status: 403, body: { error: 'PREMIUM_REQUIRED', message: 'GSC 연동은 Pro 플랜부터 사용 가능합니다' } }
  }
  return { ok: true as const, viewer }
}

/**
 * GET /api/gsc/status
 * 현재 유저의 GSC 연결 상태 + 마지막 site_url
 */
api.get('/gsc/status', async (c) => {
  const auth = await checkGscAuth(c)
  if (!auth.ok) return c.json(auth.body, auth.status as any)

  const row = await c.env.DB.prepare(
    `SELECT scope, expires_at, connected_at, updated_at, last_site_url
     FROM gsc_tokens WHERE user_id = ?`
  ).bind(auth.viewer.id).first<any>()

  if (!row) return c.json({ ok: true, connected: false })
  return c.json({
    ok: true,
    connected: true,
    scope: row.scope,
    expires_at: row.expires_at,
    connected_at: row.connected_at,
    updated_at: row.updated_at,
    last_site_url: row.last_site_url,
  })
})

/**
 * GET /api/gsc/sites
 * 유저의 GSC에 등록된 사이트 목록
 */
api.get('/gsc/sites', async (c) => {
  const auth = await checkGscAuth(c)
  if (!auth.ok) return c.json(auth.body, auth.status as any)

  const t = await getValidGscAccessToken(c, auth.viewer.id)
  if (!t) return c.json({ error: 'GSC_NOT_CONNECTED', message: 'GSC 연결이 필요합니다' }, 412)

  const sites = await listGscSites(t.access_token)
  return c.json({ ok: true, sites })
})

/**
 * POST /api/gsc/disconnect
 * 연결 해제 (refresh_token 파기)
 */
api.post('/gsc/disconnect', async (c) => {
  const auth = await checkGscAuth(c)
  if (!auth.ok) return c.json(auth.body, auth.status as any)
  await disconnectGsc(c, auth.viewer.id)
  return c.json({ ok: true })
})

/**
 * POST /api/scan/:id/gsc-sync
 * body: { site_url: string }
 * 해당 scan 결과(TOP100 + longtail)와 GSC 키워드를 비교 → "노출됐지만 우리가 못 잡은 키워드" 추출
 */
api.post('/scan/:id/gsc-sync', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'BAD_ID' }, 400)

  const auth = await checkGscAuth(c)
  if (!auth.ok) return c.json(auth.body, auth.status as any)

  const body = await c.req.json().catch(() => ({})) as { site_url?: string }
  const siteUrl = String(body?.site_url || '').trim()
  if (!siteUrl) return c.json({ error: 'BAD_INPUT', message: 'site_url이 필요합니다' }, 400)

  // 본인 스캔인지 확인 (admin은 우회)
  const scan = await c.env.DB.prepare(
    `SELECT id, url, user_id FROM scans WHERE id = ?`
  ).bind(id).first<any>()
  if (!scan) return c.json({ error: 'NOT_FOUND' }, 404)
  const isOwner = scan.user_id && Number(scan.user_id) === auth.viewer.id
  if (!auth.viewer.is_admin && !isOwner) {
    return c.json({ error: 'FORBIDDEN', message: '본인 스캔에서만 GSC 연동이 가능합니다' }, 403)
  }

  // 알려진 키워드 (TOP100 + longtail 캐시)
  const knownKeywords: string[] = []
  const fullScan = await getScanById(c.env, id)
  if (fullScan) {
    for (const k of fullScan.keywords || []) knownKeywords.push(k.keyword)
    for (const k of fullScan.longtail_keywords || []) knownKeywords.push(k.keyword)
  }

  try {
    const result = await syncGscForScan(c, auth.viewer.id, id, siteUrl, knownKeywords)
    if (!result) return c.json({ error: 'GSC_NOT_CONNECTED', message: 'GSC 토큰이 만료됐습니다. 다시 연결해주세요' }, 412)
    return c.json({ ok: true, result })
  } catch (e: any) {
    console.error('gsc-sync error', e)
    return c.json({ error: 'SYNC_FAILED', message: e?.message || 'GSC 동기화 실패' }, 500)
  }
})

/**
 * GET /api/scan/:id/gsc-keywords
 * 저장된 GSC snapshot 키워드 조회
 */
api.get('/scan/:id/gsc-keywords', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'BAD_ID' }, 400)

  const auth = await checkGscAuth(c)
  if (!auth.ok) return c.json(auth.body, auth.status as any)

  const { results } = await c.env.DB.prepare(
    `SELECT keyword, clicks, impressions, ctr, avg_position, page_url, site_url, created_at
     FROM gsc_keyword_snapshots
     WHERE scan_id = ? AND user_id = ?
     ORDER BY impressions DESC
     LIMIT 200`
  ).bind(id, auth.viewer.id).all<any>()

  return c.json({ ok: true, keywords: results || [] })
})

export default api
