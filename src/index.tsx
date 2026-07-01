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
import { CheckoutPage, PaymentSuccessPage, PaymentFailPage } from './pages/checkout'
import { getScanById } from './lib/scan-service'
import { getUserFromCookie } from './lib/auth'
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
} from './lib/beta-service'
import { sendBetaInvite } from './lib/kakao-notify'
import {
  validateCoupon,
  consumeCoupon,
  generateOrderId,
  savePayment,
  chargeBillingKey,
  issueBillingKey,
  updatePaymentSuccess,
  updatePaymentFailure,
  upsertSubscription,
} from './lib/toss-payments'
import {
  addCompetitor,
  removeCompetitor,
  listCompetitors,
  getCompetitorComparisons,
} from './lib/competitor-service'
import { CompetitorsPage } from './pages/competitors'
import { PfAlumniPage } from './pages/pf-alumni'
import { PLAN_PRICES, type PlanName } from './lib/types'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('/api/*', cors())

// API
app.route('/api', api)
app.route('/api/auth', auth)
app.route('/api/admin', admin)

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
  if (user.is_admin !== 1) {
    return c.html(
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
      </Layout>,
      403,
    )
  }

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
    if (!body.email || !body.name) {
      return c.json({ success: false, reason: '이름과 이메일은 필수입니다.' }, 400)
    }
    // IP 해시
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || ''
    let ipHash = ''
    if (ip) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip))
      ipHash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
    }
    const result = await submitBetaSignup(c.env, {
      email: body.email,
      name: body.name,
      clinic_name: body.clinic_name,
      clinic_url: body.clinic_url,
      phone: body.phone,
      patient_funnel_code: body.patient_funnel_code,
      source: 'beta_page',
      message: body.message,
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
  if (user.is_admin !== 1) {
    return c.html(
      <Layout title="접근 권한 없음">
        <NavBar loggedIn />
        <main class="max-w-2xl mx-auto px-5 py-20 text-center">
          <div class="text-6xl mb-4">🛡️</div>
          <h1 class="text-2xl font-bold text-slate-900">어드민 권한이 필요합니다</h1>
          <a href="/dashboard" class="mt-6 inline-block px-6 py-3 rounded-lg bg-brand text-white font-semibold">
            내 대시보드로
          </a>
        </main>
        <Footer />
      </Layout>, 403)
  }

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
    const couponCode = signup.is_pf_alumni ? 'PATIENTFUNNEL50' : 'BETA100'
    const inviteUrl = `${(c.env as any).APP_URL || 'https://patientrank.pages.dev'}/checkout?plan=pro&coupon=${couponCode}`

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
        const couponCode = s.is_pf_alumni ? 'PATIENTFUNNEL50' : 'BETA100'
        const inviteUrl = `${(c.env as any).APP_URL || 'https://patientrank.pages.dev'}/checkout?plan=pro&coupon=${couponCode}`

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

  const competitors = await listCompetitors(c.env, user.id)

  // 가장 최근 스캔의 도메인을 "내 도메인"으로 사용
  const latestScan = await c.env.DB.prepare(
    `SELECT d.domain
       FROM scans s LEFT JOIN domains d ON d.id = s.domain_id
       WHERE s.user_id = ? AND d.domain IS NOT NULL
       ORDER BY s.created_at DESC LIMIT 1`,
  )
    .bind(user.id)
    .first<{ domain: string }>()
  const myDomain = latestScan?.domain || null

  return c.html(
    <CompetitorsPage
      user={{ id: user.id, email: user.email, name: user.name, plan: user.plan }}
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
  const latestScan = await c.env.DB.prepare(
    `SELECT d.domain
       FROM scans s LEFT JOIN domains d ON d.id = s.domain_id
       WHERE s.user_id = ? AND d.domain IS NOT NULL
       ORDER BY s.created_at DESC LIMIT 1`,
  )
    .bind(user.id)
    .first<{ domain: string }>()
  if (!latestScan?.domain) {
    return c.json({ success: false, error: '먼저 우리 병원 도메인을 진단해 주세요' }, 400)
  }

  const result = await addCompetitor(c.env, user.id, latestScan.domain, competitorDomain, alias)
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

// ===================================================================
// Day 3-B: 결제 페이지 + API (토스페이먼츠)
// ===================================================================

// 결제 페이지 (로그인 필수)
app.get('/checkout', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login?next=/checkout')

  const planRaw = (c.req.query('plan') || 'pro').toLowerCase() as PlanName
  if (!['basic', 'pro', 'agency'].includes(planRaw)) {
    return c.redirect('/pricing')
  }
  const basePrice = PLAN_PRICES[planRaw]
  let finalPrice = basePrice
  let discountRate = 0
  const couponCode = (c.req.query('coupon') || '').toUpperCase()

  if (couponCode) {
    const v = await validateCoupon(c.env, couponCode, basePrice)
    if (v.valid) {
      finalPrice = v.final_price
      discountRate = v.discount_rate
    }
  }

  // TOSS_CLIENT_KEY 미설정 시 결제 진입 차단 (테스트 키 폴백은 실결제 사고 위험)
  const tossClientKey = (c.env as any).TOSS_CLIENT_KEY
  if (!tossClientKey) {
    return c.html(
      <Layout title="결제 준비 중 · Patient Rank">
        <NavBar loggedIn />
        <main class="max-w-xl mx-auto px-5 py-24 text-center">
          <div class="text-6xl mb-4">🛠️</div>
          <h1 class="text-2xl font-bold text-slate-900">결제 시스템 준비 중입니다</h1>
          <p class="mt-3 text-slate-600">잠시 후 다시 시도해주세요. 급하신 경우 카카오 채널로 문의 부탁드립니다.</p>
          <a href="/pricing" class="mt-8 inline-block px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600">가격 안내로</a>
        </main>
        <Footer />
      </Layout>,
      503,
    )
  }

  return c.html(
    <CheckoutPage
      plan={planRaw as 'basic' | 'pro' | 'agency'}
      basePrice={basePrice}
      finalPrice={finalPrice}
      discountRate={discountRate}
      couponCode={couponCode || undefined}
      user={{ id: user.id, email: user.email, name: (user as any).name }}
      tossClientKey={tossClientKey}
    />
  )
})

// 쿠폰 검증 API
app.post('/api/coupon/validate', async (c) => {
  try {
    const { code, plan } = await c.req.json<{ code: string; plan: PlanName }>()
    if (!code || !plan || !(plan in PLAN_PRICES)) {
      return c.json({ valid: false, reason: '잘못된 요청입니다.' }, 400)
    }
    const basePrice = PLAN_PRICES[plan]
    const result = await validateCoupon(c.env, code, basePrice)
    return c.json(result)
  } catch (e: any) {
    return c.json({ valid: false, reason: e.message }, 500)
  }
})

// 주문 초기화 API (결제창 호출 직전)
app.post('/api/payment/init', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.json({ error: '로그인이 필요합니다.' }, 401)
  try {
    const { plan, coupon } = await c.req.json<{ plan: PlanName; coupon?: string }>()
    if (!plan || !(plan in PLAN_PRICES)) {
      return c.json({ error: '잘못된 플랜' }, 400)
    }
    const basePrice = PLAN_PRICES[plan]
    let finalPrice = basePrice
    if (coupon) {
      const v = await validateCoupon(c.env, coupon, basePrice)
      if (v.valid) finalPrice = v.final_price
    }

    const orderId = generateOrderId()
    await savePayment(c.env, user.id, null, orderId, finalPrice, 'first_payment')
    return c.json({ order_id: orderId, amount: finalPrice })
  } catch (e: any) {
    return c.json({ error: e.message || '주문 생성 실패' }, 500)
  }
})

// 결제 성공 콜백 (토스 successUrl 리다이렉트 도착)
app.get('/payment/success', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login')

  const orderId = c.req.query('order_id') || ''
  const authKey = c.req.query('authKey') || ''
  const customerKey = c.req.query('customerKey') || `customer-${user.id}`
  const planRaw = (c.req.query('plan') || 'pro').toLowerCase() as PlanName
  const couponCode = (c.req.query('coupon') || '').toUpperCase()

  if (!orderId || !authKey) {
    return c.html(<PaymentFailPage code="MISSING_PARAMS" message="주문 정보가 누락되었습니다." />)
  }

  try {
    // 1) 빌링키 발급 (자동결제용 카드 등록)
    const billing = await issueBillingKey(c.env, { customerKey, authKey })

    // 2) 가격 재계산 (보안: 클라이언트 신뢰 금지)
    const basePrice = PLAN_PRICES[planRaw]
    let finalPrice = basePrice
    let discountRate = 0
    if (couponCode) {
      const v = await validateCoupon(c.env, couponCode, basePrice)
      if (v.valid) {
        finalPrice = v.final_price
        discountRate = v.discount_rate
      }
    }

    // 3) 첫 결제 즉시 청구 (0원 쿠폰이면 청구 생략 — 카드 등록만)
    //    이전 버그: 빌링키 발급 후 실청구 없이 구독 활성화 → 첫 달 무료가 돼버림
    let firstCharge: Awaited<ReturnType<typeof chargeBillingKey>> | null = null
    if (finalPrice > 0) {
      firstCharge = await chargeBillingKey(c.env, {
        billingKey: billing.billingKey,
        customerKey,
        amount: finalPrice,
        orderId,
        orderName: `Patient Rank ${planRaw.toUpperCase()} 월 구독`,
        customerEmail: user.email,
        customerName: (user as any).name || undefined,
      })
    }

    // 4) 구독 활성화
    const subId = await upsertSubscription(
      c.env,
      user.id,
      planRaw,
      basePrice,
      discountRate,
      finalPrice,
      billing.billingKey,
      customerKey,
      billing.card.company,
      billing.card.number,
    )

    // 5) 결제 정보 업데이트 (status는 통일된 'paid' 사용)
    if (firstCharge) {
      await c.env.DB.prepare(
        `UPDATE payments SET subscription_id = ?, status = 'paid',
          toss_payment_key = ?, method = 'CARD',
          card_company = ?, card_number_masked = ?,
          receipt_url = ?, paid_at = CURRENT_TIMESTAMP
         WHERE toss_order_id = ?`
      ).bind(
        subId,
        firstCharge.paymentKey || null,
        billing.card.company,
        billing.card.number,
        firstCharge.receipt?.url || null,
        orderId,
      ).run()
    } else {
      // 100% 쿠폰: 청구 없이 결제 레코드는 0원 paid 처리
      await c.env.DB.prepare(
        `UPDATE payments SET subscription_id = ?, status = 'paid',
          method = 'CARD', card_company = ?, card_number_masked = ?, paid_at = CURRENT_TIMESTAMP
         WHERE toss_order_id = ?`
      ).bind(subId, billing.card.company, billing.card.number, orderId).run()
    }

    // 6) 쿠폰 사용 카운트 증가 (결제 성공 시에만)
    if (couponCode && discountRate > 0) {
      try {
        await consumeCoupon(c.env, couponCode)
      } catch (e) {
        console.error('coupon consume failed:', e)
      }
    }

    // 7) 유저 플랜 업그레이드
    await c.env.DB.prepare(`UPDATE users SET plan = ? WHERE id = ?`)
      .bind(planRaw, user.id).run()

    return c.html(<PaymentSuccessPage orderId={orderId} plan={planRaw} amount={finalPrice} />)
  } catch (e: any) {
    await updatePaymentFailure(c.env, orderId, 'BILLING_FAIL', e.message || 'unknown')
    return c.html(<PaymentFailPage code="BILLING_FAIL" message={e.message} />)
  }
})

// 결제 실패 콜백
app.get('/payment/fail', (c) => {
  const code = c.req.query('code') || undefined
  const message = c.req.query('message') || undefined
  return c.html(<PaymentFailPage code={code} message={message} />)
})

// ===================================================================
// 토스페이먼츠 웹훅 — 카드사/토스 측 상태 변경(취소·환불·실패) DB 동기화
// 등록: 토스 개발자센터 > 웹훅 > https://patientrank.kr/api/webhook/toss
// 검증: 이벤트를 신뢰하지 않고 paymentKey로 토스 API 재조회 (위조 방지)
// ===================================================================
app.post('/api/webhook/toss', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ ok: false, error: 'INVALID_JSON' }, 400)
  }

  // 토스 웹훅 페이로드: { eventType, createdAt, data: { paymentKey, orderId, status, ... } }
  const eventType = String(body?.eventType || '')
  const data = body?.data || {}
  const paymentKey = String(data?.paymentKey || '')
  const orderId = String(data?.orderId || '')

  console.log(`[toss-webhook] ${eventType} order=${orderId}`)
  if (!paymentKey && !orderId) return c.json({ ok: true, skipped: 'no identifiers' })

  const secretKey = (c.env as any).TOSS_SECRET_KEY
  if (!secretKey) return c.json({ ok: false, error: 'NOT_CONFIGURED' }, 503)

  try {
    // 위조 방지: 웹훅 내용을 믿지 않고 토스 API에서 결제 상태 재조회
    const lookupUrl = paymentKey
      ? `https://api.tosspayments.com/v1/payments/${paymentKey}`
      : `https://api.tosspayments.com/v1/payments/orders/${orderId}`
    const res = await fetch(lookupUrl, {
      headers: { Authorization: 'Basic ' + btoa(secretKey + ':') },
    })
    if (!res.ok) {
      console.error(`[toss-webhook] lookup failed ${res.status}`)
      return c.json({ ok: false, error: 'LOOKUP_FAILED' }, 502)
    }
    const payment: any = await res.json()
    const tossStatus = String(payment?.status || '')
    const verifiedOrderId = String(payment?.orderId || orderId)

    // 상태 매핑 (내부 표준: paid / canceled / failed)
    let internal: string | null = null
    if (tossStatus === 'DONE') internal = 'paid'
    else if (tossStatus === 'CANCELED' || tossStatus === 'PARTIAL_CANCELED') internal = 'canceled'
    else if (['ABORTED', 'EXPIRED'].includes(tossStatus)) internal = 'failed'
    if (!internal) return c.json({ ok: true, skipped: `unhandled status ${tossStatus}` })

    if (internal === 'canceled') {
      const cancels = Array.isArray(payment?.cancels) ? payment.cancels : []
      const refundTotal = cancels.reduce((s: number, x: any) => s + Number(x?.cancelAmount || 0), 0)
      const lastReason = cancels.length ? String(cancels[cancels.length - 1]?.cancelReason || '') : ''
      await c.env.DB.prepare(
        `UPDATE payments SET status = 'canceled', refunded_at = CURRENT_TIMESTAMP,
           refund_amount_krw = ?, refund_reason = ?, raw_response = ?
         WHERE toss_order_id = ?`,
      ).bind(refundTotal, lastReason.slice(0, 200), JSON.stringify(payment).slice(0, 8000), verifiedOrderId).run()

      // 전액 취소면 해당 구독 past_due 처리 (다음 빌링 크론이 재청구/만료 판단)
      const payRow = await c.env.DB.prepare(
        `SELECT user_id, subscription_id, amount_krw FROM payments WHERE toss_order_id = ?`,
      ).bind(verifiedOrderId).first<any>()
      if (payRow?.subscription_id && refundTotal >= Number(payRow.amount_krw || 0)) {
        await c.env.DB.prepare(
          `UPDATE subscriptions SET status = 'past_due', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        ).bind(payRow.subscription_id).run()
        console.log(`[toss-webhook] subscription ${payRow.subscription_id} → past_due (full refund)`)
      }
    } else {
      await c.env.DB.prepare(
        `UPDATE payments SET status = ?, raw_response = ? WHERE toss_order_id = ?`,
      ).bind(internal, JSON.stringify(payment).slice(0, 8000), verifiedOrderId).run()
    }

    return c.json({ ok: true, order_id: verifiedOrderId, status: internal })
  } catch (e: any) {
    console.error('[toss-webhook] error:', e)
    return c.json({ ok: false, error: e.message }, 500)
  }
})

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
