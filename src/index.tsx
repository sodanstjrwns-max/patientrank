// Patient Rank - Main Hono app entry
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import type { Bindings } from './lib/types'
import api from './routes/api'
import auth from './routes/auth'
import admin from './routes/admin'
import { LandingPage } from './pages/landing'
import { ResultPage } from './pages/result'
import { PricingPage } from './pages/pricing'
import { LoginPage, DashboardPage } from './pages/dashboard'
import { AdminDashboardPage } from './pages/admin'
import { Layout, NavBar, Footer } from './pages/layout'
import { PrivacyPolicyPage, TermsPage } from './pages/legal'
import { BetaPage } from './pages/beta'
import { AdminBetaPage } from './pages/admin-beta'
import payments from './routes/payments'
import { getScanById } from './lib/scan-service'
import { getUserFromCookie } from './lib/auth'
import { hashIp, getClientIp } from './lib/utils'
import { getWeeklyDelta } from './lib/snapshot-service'
import { getCachedActionGuide, generateActionGuide, saveActionGuide } from './lib/ai-action-guide'
import { generatePrescriptions } from './lib/content-prescription'
import { runWeeklyRescanCron } from './lib/cron-handler'
import { runDailyBillingCron } from './lib/billing-cron'
import {
  submitBetaSignup,
  listBetaSignups,
  getBetaStats,
  markBetaInvited,
  buildBetaInvite,
} from './lib/beta-service'
import { sendBetaInvite } from './lib/kakao-notify'
import {
  addCompetitor,
  removeCompetitor,
  listCompetitors,
  getCompetitorComparisons,
  getLatestUserDomain,
} from './lib/competitor-service'
import { CompetitorsPage } from './pages/competitors'
import { PfAlumniPage } from './pages/pf-alumni'

const app = new Hono<{ Bindings: Bindings }>()

// 어드민 전용 페이지 403 화면 (공통)
const AdminForbidden = () => (
  <Layout title="접근 권한 없음 · Patient Rank">
    <NavBar loggedIn />
    <main class="max-w-2xl mx-auto px-5 py-20 text-center">
      <div class="text-6xl mb-4">🛡️</div>
      <h1 class="text-2xl font-bold text-slate-900">어드민 권한이 필요합니다</h1>
      <p class="mt-2 text-slate-600">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
      <a href="/dashboard" class="mt-6 inline-block px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600">
        내 대시보드로
      </a>
    </main>
    <Footer />
  </Layout>
)

app.use('*', logger())
app.use('/api/*', cors())

// API
app.route('/api', api)
app.route('/api/auth', auth)
app.route('/api/admin', admin)

// 결제 (checkout / payment callbacks / coupon / toss webhook) — routes/payments.tsx
app.route('/', payments)

// OAuth 콜백은 쿠키를 바로 세팅해야 하므로 페이지 경로로도 제공
app.route('/auth', auth)

// Pages
app.get('/', (c) => c.html(<LandingPage />))
app.get('/pricing', (c) => c.html(<PricingPage />))

app.get('/result/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.notFound()
  const viewer = await getUserFromCookie(c)
  const scan = await getScanById(c.env, id, viewer)

  // Day 1-E: 시계열 비교 데이터 + AI 액션 가이드 (Pro+/Admin만)
  let weeklyDelta: any = null
  let actionGuide: any = null
  let prescriptions: any = null
  if (scan) {
    // 콘텐츠 처방전 — 모든 방문자에게 생성 (무료는 상위 3건만 공개, 나머지 블러)
    try {
      prescriptions = await generatePrescriptions(c.env, scan, { limit: 10, userId: viewer?.id })
    } catch (e) {
      console.error('prescription generation failed:', e)
    }
    try {
      weeklyDelta = await getWeeklyDelta(c.env, scan.domain)
    } catch (e) {
      console.error('weekly delta load failed:', e)
    }

    // AI 가이드는 캐시 우선 (1주 동안 같은 스캔은 같은 가이드)
    const isPro =
      viewer && (viewer.is_admin === 1 || viewer.plan === 'pro' || viewer.plan === 'agency')
    if (isPro) {
      try {
        actionGuide = await getCachedActionGuide(c.env, id)
        // 캐시 미스 시 비동기 생성 (페이지 응답 막지 않음 - 다음 방문 시 표시)
        // 단, 어드민은 즉시 생성해서 보여주기 (테스트 용이성)
        if (!actionGuide && viewer && viewer.is_admin === 1) {
          try {
            const result = await generateActionGuide(c.env, scan)
            await saveActionGuide(c.env, {
              user_id: viewer.id,
              scan_id: id,
              domain: scan.domain,
              guide: result.guide,
              cost_usd: result.cost_usd,
              tokens: result.tokens,
            })
            actionGuide = result.guide
          } catch (aiErr) {
            console.error('AI guide on-demand generation failed:', aiErr)
          }
        }
      } catch (e) {
        console.error('action guide load failed:', e)
      }
    }
  }

  if (!scan) {
    return c.html(
      <Layout title="결과를 찾을 수 없습니다 · Patient Rank">
        <NavBar />
        <main class="max-w-2xl mx-auto px-5 py-20 text-center">
          <div class="text-6xl mb-6">🔍</div>
          <h1 class="text-2xl font-bold text-slate-900">진단 결과를 찾을 수 없습니다</h1>
          <p class="mt-3 text-slate-600">URL이 잘못되었거나 만료된 결과일 수 있습니다.</p>
          <a href="/" class="mt-8 inline-block px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600">
            다시 진단하기
          </a>
        </main>
        <Footer />
      </Layout>,
      404,
    )
  }
  return c.html(<ResultPage scan={scan} viewer={viewer} weeklyDelta={weeklyDelta} actionGuide={actionGuide} prescriptions={prescriptions} />)
})

// 로그인 페이지 (Google OAuth 진입)
app.get('/login', async (c) => {
  const u = await getUserFromCookie(c)
  if (u) return c.redirect(u.is_admin ? '/admin' : '/dashboard')
  const error = c.req.query('error') || undefined
  const detail = c.req.query('detail') || undefined
  return c.html(<LoginPage error={error} detail={detail} />)
})

// 일반 유저 대시보드
app.get('/dashboard', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login')

  // 본인 스캔 이력 (user_id 매칭) — 어드민은 전부 /admin에서 보므로 여기는 본인 것만
  const rows = await c.env.DB.prepare(
    `SELECT id, url, keyword_count, top10_count, estimated_traffic, created_at
     FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`
  ).bind(user.id).all<any>()

  const scans = (rows.results || []).map((r: any) => ({
    id: Number(r.id),
    url: String(r.url || ''),
    keyword_count: Number(r.keyword_count || 0),
    top10_count: Number(r.top10_count || 0),
    estimated_traffic: Number(r.estimated_traffic || 0),
    created_at: String(r.created_at),
  }))

  return c.html(<DashboardPage user={user} scans={scans} />)
})

// 어드민 대시보드
app.get('/admin', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login')
  if (user.is_admin !== 1) return c.html(<AdminForbidden />, 403)

  const db = c.env.DB
  const [usersRow, scansRow, leadsRow, revenueRow, todayRow, weekRow, paidRow] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as n FROM users`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM scans`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM leads`).first<any>(),
    db.prepare(`SELECT COALESCE(SUM(amount_krw),0) as n FROM payments WHERE status='paid'`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM scans WHERE created_at >= datetime('now','-1 day')`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM scans WHERE created_at >= datetime('now','-7 day')`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM users WHERE plan != 'free'`).first<any>(),
  ])

  const stats = {
    total_users: Number(usersRow?.n || 0),
    total_scans: Number(scansRow?.n || 0),
    total_leads: Number(leadsRow?.n || 0),
    total_revenue: Number(revenueRow?.n || 0),
    scans_today: Number(todayRow?.n || 0),
    scans_this_week: Number(weekRow?.n || 0),
    paid_users: Number(paidRow?.n || 0),
  }

  const recentScansRes = await db.prepare(
    `SELECT s.id, s.url, s.keyword_count, s.top10_count, s.estimated_traffic, s.ip_hash, s.created_at,
            u.email as user_email
     FROM scans s LEFT JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC LIMIT 30`
  ).all<any>()

  const recentScans = (recentScansRes.results || []).map((r: any) => ({
    id: Number(r.id),
    url: String(r.url || ''),
    keyword_count: Number(r.keyword_count || 0),
    top10_count: Number(r.top10_count || 0),
    estimated_traffic: Number(r.estimated_traffic || 0),
    ip_hash: r.ip_hash || null,
    user_email: r.user_email || null,
    created_at: String(r.created_at),
  }))

  const recentLeadsRes = await db.prepare(
    `SELECT id, email, clinic_name, specialty, doctor_name, scan_id, created_at
     FROM leads ORDER BY created_at DESC LIMIT 20`
  ).all<any>()

  const recentLeads = (recentLeadsRes.results || []).map((r: any) => ({
    id: Number(r.id),
    email: String(r.email),
    clinic_name: r.clinic_name || null,
    specialty: r.specialty || null,
    doctor_name: r.doctor_name || null,
    scan_id: Number(r.scan_id),
    created_at: String(r.created_at),
  }))

  const usersRes = await db.prepare(
    `SELECT id, email, name, clinic_name, plan, is_admin, created_at
     FROM users ORDER BY created_at DESC LIMIT 50`
  ).all<any>()

  const usersList = (usersRes.results || []).map((r: any) => ({
    id: Number(r.id),
    email: String(r.email),
    name: r.name || null,
    clinic_name: r.clinic_name || null,
    plan: String(r.plan || 'free'),
    is_admin: Number(r.is_admin || 0),
    created_at: String(r.created_at),
  }))

  return c.html(
    <AdminDashboardPage
      user={user}
      stats={stats}
      recentScans={recentScans}
      recentLeads={recentLeads}
      users={usersList}
    />,
  )
})

// Blog placeholder
app.get('/blog', (c) =>
  c.html(
    <Layout title="블로그 · Patient Rank">
      <NavBar />
      <main class="max-w-3xl mx-auto px-5 py-16">
        <h1 class="text-3xl font-bold text-slate-900">의료 SEO 블로그</h1>
        <p class="mt-3 text-slate-600">AEO용 콘텐츠 파이프라인 준비 중입니다.</p>
        <div class="mt-8 space-y-3">
          {[
            '치과 홈페이지 구글 SEO 가이드',
            '한의원 지역 키워드 상위 노출 전략',
            '성형외과 콘텐츠 마케팅 실전',
            'AI 검색 시대, 병원이 준비해야 할 5가지',
          ].map((t) => (
            <div class="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition cursor-pointer">
              <div class="text-xs text-slate-500">곧 공개</div>
              <div class="mt-1 font-semibold text-slate-900">{t}</div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </Layout>,
  ),
)

// Terms / Privacy (Google OAuth Verification 통과를 위한 풀버전)
app.get('/terms', (c) => c.html(<TermsPage />))
app.get('/privacy', (c) => c.html(<PrivacyPolicyPage />))
// 푸터 '환불정책' 링크 — 이용약관 제11조(환불)로 영구 리다이렉트
app.get('/refund', (c) => c.redirect('/terms#refund', 301))

// SEO 기본 파일 — 진단 SaaS가 자기 SEO를 챙기는 건 기본
app.get('/robots.txt', (c) =>
  c.text(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /dashboard', 'Disallow: /api/', '', 'Sitemap: https://patientrank.kr/sitemap.xml'].join('\n'),
    200,
    { 'Content-Type': 'text/plain; charset=utf-8' },
  ),
)
app.get('/sitemap.xml', (c) => {
  const pages = ['/', '/pricing', '/beta', '/pf-alumni', '/blog', '/terms', '/privacy']
  const urls = pages
    .map((p) => `  <url><loc>https://patientrank.kr${p}</loc><changefreq>weekly</changefreq></url>`)
    .join('\n')
  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    200,
    { 'Content-Type': 'application/xml; charset=utf-8' },
  )
})

// ===================================================================
// Day 3-C: 베타 신청 페이지 + API
// ===================================================================
app.get('/beta', (c) => {
  const signedUp = c.req.query('signed_up') === '1'
  return c.html(<BetaPage alreadySignedUp={signedUp} />)
})

app.post('/api/beta/signup', async (c) => {
  try {
    const body = await c.req.json<any>()
    const email = String(body.email || '').trim().toLowerCase()
    const name = String(body.name || '').trim()

    // 입력 검증 (이메일 형식 + 길이 제한 — 스팸/DB 오염 방지)
    if (!email || !name) {
      return c.json({ success: false, reason: '이름과 이메일은 필수입니다.' }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      return c.json({ success: false, reason: '올바른 이메일 형식이 아닙니다.' }, 400)
    }
    if (name.length > 50) {
      return c.json({ success: false, reason: '이름이 너무 깁니다.' }, 400)
    }

    // IP 해시 (공용 유틸 사용 — 자체 구현 중복 제거)
    const ip = getClientIp(c.req.raw)
    const ipHash = ip ? (await hashIp(ip)).slice(0, 32) : ''

    const clip = (v: any, max: number) => (v ? String(v).slice(0, max) : undefined)
    const result = await submitBetaSignup(c.env, {
      email,
      name,
      clinic_name: clip(body.clinic_name, 100),
      clinic_url: clip(body.clinic_url, 200),
      phone: clip(body.phone, 20),
      patient_funnel_code: clip(body.patient_funnel_code, 50),
      source: 'beta_page',
      message: clip(body.message, 1000),
      user_agent: c.req.header('user-agent') || undefined,
      ip_hash: ipHash || undefined,
    })
    return c.json(result)
  } catch (e: any) {
    return c.json({ success: false, reason: e.message || '서버 오류' }, 500)
  }
})

// ===================================================================
// Day 4-A: 어드민 베타 인비테이션 관리 페이지 + API
// ===================================================================

// 어드민 베타 관리 페이지
app.get('/admin/beta', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login')
  if (user.is_admin !== 1) return c.html(<AdminForbidden />, 403)

  const [signups, stats] = await Promise.all([
    listBetaSignups(c.env, undefined, 200),
    getBetaStats(c.env),
  ])
  return c.html(<AdminBetaPage user={user} signups={signups} stats={stats} />)
})

// 개별 베타 초대 (카카오 알림톡)
app.post('/api/admin/beta/invite', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user || user.is_admin !== 1) return c.json({ error: 'FORBIDDEN' }, 403)

  try {
    const { id } = await c.req.json<{ id: number }>()
    if (!id) return c.json({ error: 'id required' }, 400)

    const signup = await c.env.DB.prepare(
      `SELECT * FROM beta_signups WHERE id = ? LIMIT 1`,
    ).bind(id).first<any>()
    if (!signup) return c.json({ error: 'not found' }, 404)
    if (signup.status === 'invited') {
      return c.json({ error: '이미 초대 발송됨' }, 400)
    }

    // 페이션트 퍼널 수료생이면 평생 50% 쿠폰, 아니면 베타 한정 100% 쿠폰
    const { couponCode, inviteUrl } = buildBetaInvite(c.env, signup.is_pf_alumni)

    // 카카오 알림톡 발송 (전화번호 있을 때만)
    let kakaoSent = false
    let kakaoError: string | null = null
    if (signup.phone) {
      const kakaoResult = await sendBetaInvite(c.env, signup.phone, {
        name: signup.name,
        invite_url: inviteUrl,
        coupon_code: couponCode,
      })
      kakaoSent = kakaoResult.success
      kakaoError = kakaoResult.errorMessage || null
    }

    // 상태 업데이트 (카카오 실패해도 invited 처리 — 어드민이 수동 이메일/카톡 발송 가능)
    await markBetaInvited(c.env, id)

    return c.json({
      success: true,
      id,
      kakao_sent: kakaoSent,
      kakao_error: kakaoError,
      coupon_code: couponCode,
      invite_url: inviteUrl,
    })
  } catch (e: any) {
    return c.json({ error: e.message || '서버 오류' }, 500)
  }
})

// 대기자 일괄 초대 (페이션트 퍼널 수료생 우선)
app.post('/api/admin/beta/invite-all', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user || user.is_admin !== 1) return c.json({ error: 'FORBIDDEN' }, 403)

  try {
    const pending = await listBetaSignups(c.env, 'pending', 200)
    let invited = 0
    let failed = 0
    const errors: string[] = []

    for (const s of pending) {
      try {
        const { couponCode, inviteUrl } = buildBetaInvite(c.env, s.is_pf_alumni)

        if (s.phone) {
          await sendBetaInvite(c.env, s.phone, {
            name: s.name,
            invite_url: inviteUrl,
            coupon_code: couponCode,
          })
        }
        await markBetaInvited(c.env, s.id)
        invited++
      } catch (err: any) {
        failed++
        errors.push(`#${s.id}: ${err.message}`)
      }
    }

    return c.json({ success: true, invited, failed, errors: errors.slice(0, 10) })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ===================================================================
// Day 7: 경쟁사 추적 — 페이지 + API
// ===================================================================

app.get('/dashboard/competitors', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login?next=/dashboard/competitors')

  // 경쟁사 목록 + 내 도메인(최근 스캔 기준) 병렬 조회
  const [competitors, myDomain] = await Promise.all([
    listCompetitors(c.env, user.id),
    getLatestUserDomain(c.env, user.id),
  ])

  return c.html(
    <CompetitorsPage
      user={{ id: user.id, email: user.email, name: user.name || user.email, plan: user.plan }}
      competitors={competitors}
      myDomain={myDomain}
    />,
  )
})

// 경쟁사 목록 (JSON)
app.get('/api/competitors', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const competitors = await listCompetitors(c.env, user.id)
  return c.json({ success: true, competitors })
})

// 경쟁사 추가
app.post('/api/competitors/add', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)

  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'invalid JSON' }, 400)
  }

  const competitorDomain = String(body.competitor_domain || '').trim()
  const alias = body.alias ? String(body.alias).trim() : undefined
  if (!competitorDomain) {
    return c.json({ success: false, error: 'competitor_domain is required' }, 400)
  }

  // 내 도메인은 최근 스캔 기준
  const myDomain = await getLatestUserDomain(c.env, user.id)
  if (!myDomain) {
    return c.json({ success: false, error: '먼저 우리 병원 도메인을 진단해 주세요' }, 400)
  }

  const result = await addCompetitor(c.env, user.id, myDomain, competitorDomain, alias)
  return c.json(result, result.success ? 200 : 400)
})

// 경쟁사 삭제
app.delete('/api/competitors/:id', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id)) return c.json({ error: 'invalid id' }, 400)
  const ok = await removeCompetitor(c.env, user.id, id)
  return c.json({ success: ok })
})

// 경쟁사 비교 결과 (result 페이지 카드용)
app.get('/api/competitors/comparisons', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const domain = c.req.query('domain')
  if (!domain) return c.json({ error: 'domain query required' }, 400)
  const comparisons = await getCompetitorComparisons(c.env, user.id, domain)
  return c.json({ success: true, comparisons })
})

// ===================================================================
// Day 8: 페이션트 퍼널 수료생 LP
// ===================================================================
app.get('/pf-alumni', (c) => c.html(<PfAlumniPage />))

app.notFound((c) =>
  c.html(
    <Layout title="404 · Patient Rank">
      <NavBar />
      <main class="max-w-xl mx-auto px-5 py-24 text-center">
        <div class="text-7xl mb-4">🫣</div>
        <h1 class="text-3xl font-bold text-slate-900">페이지를 찾을 수 없습니다</h1>
        <a href="/" class="mt-8 inline-block px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600">
          홈으로
        </a>
      </main>
      <Footer />
    </Layout>,
    404,
  ),
)

// 전역 에러 핸들러 — 상세 정보는 로그에만 기록, 사용자에겐 request_id만 노출
// (스택/메시지는 어드민 세션에서만 표시)
app.onError(async (err, c) => {
  const reqId = (c.req.header('cf-ray') || '').split('-')[0] || 'unknown'
  const errMsg = err?.message || String(err) || 'unknown error'
  const errStack = err?.stack || ''
  console.error(`[onError] ${c.req.method} ${c.req.path} reqId=${reqId} :: ${errMsg}`)
  if (errStack) console.error(errStack)

  // 어드민이면 디버그 정보 노출 (운영자 본인의 트러블슈팅 편의)
  let isAdmin = false
  try {
    const viewer = await getUserFromCookie(c)
    isAdmin = !!(viewer && viewer.is_admin === 1)
  } catch { /* 인증 자체가 죽었을 수 있으므로 무시 */ }

  const path = c.req.path
  if (path.startsWith('/api/')) {
    return c.json(
      isAdmin
        ? { ok: false, error: 'internal_error', message: errMsg, stack: errStack, request_id: reqId }
        : { ok: false, error: 'internal_error', message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', request_id: reqId },
      500,
    )
  }

  return c.html(
    <Layout title="오류가 발생했습니다 · Patient Rank">
      <NavBar />
      <main class="max-w-2xl mx-auto px-5 py-20 text-center">
        <div class="text-7xl mb-4">⚠️</div>
        <h1 class="text-3xl font-bold text-slate-900">일시적인 오류가 발생했습니다</h1>
        <p class="mt-3 text-slate-600">잠시 후 다시 시도해주세요. 문제가 계속되면 아래 코드를 알려주세요.</p>
        <div class="mt-6 inline-block px-4 py-2 rounded-lg bg-slate-100 border border-slate-200">
          <span class="text-xs text-slate-500 mr-2">문의 코드</span>
          <span class="font-mono text-sm font-semibold text-slate-800">{reqId}</span>
        </div>

        {isAdmin && (
          <div class="mt-8 text-left space-y-3">
            <div class="p-4 rounded-xl bg-red-50 border border-red-200">
              <div class="text-xs font-semibold text-red-600 mb-1">에러 메시지 (어드민 전용)</div>
              <div class="font-mono text-sm text-red-900 whitespace-pre-wrap break-all">{errMsg}</div>
            </div>
            {errStack && (
              <details class="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-700">
                <summary class="cursor-pointer text-xs font-semibold text-slate-300">스택 트레이스</summary>
                <pre class="mt-3 text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-all">{errStack}</pre>
              </details>
            )}
          </div>
        )}

        <div class="mt-10 flex gap-3 justify-center">
          <a href="/" class="px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600">홈으로</a>
          <a href="/login" class="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">로그인</a>
        </div>
      </main>
      <Footer />
    </Layout>,
    500,
  )
})

// Day 1-C: Cron Trigger 핸들러 (매주 월요일 06:00 KST)
// Cloudflare Workers는 fetch + scheduled를 모두 export해야 cron 동작
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        // Cron dispatch by schedule string
        // - "0 21 * * 0" → 매주 일요일 21:00 UTC (월요일 06:00 KST) → 주간 리스캔 + 카카오 리포트
        // - "0 21 * * *" → 매일 21:00 UTC (다음날 06:00 KST) → 정기결제 자동 청구
        const cronExpr = event.cron || ''
        try {
          if (cronExpr === '0 21 * * *') {
            // 매일: 정기결제 자동 청구
            const result = await runDailyBillingCron(env)
            console.log(`[Cron] daily_billing done:`, result)
          } else {
            // 기본 (주간 또는 매뉴얼): 리스캔 + 리포트
            const result = await runWeeklyRescanCron(env)
            console.log(`[Cron] weekly_rescan done:`, result)
          }
        } catch (e) {
          console.error(`[Cron] failed (${cronExpr}):`, e)
        }
      })(),
    )
  },
}
