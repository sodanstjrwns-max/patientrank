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
import { getScanById } from './lib/scan-service'
import { getUserFromCookie } from './lib/auth'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('/api/*', cors())

// API
app.route('/api', api)
app.route('/api/auth', auth)
app.route('/api/admin', admin)

// 매직링크 검증은 쿠키를 바로 세팅해야 하므로 페이지 경로로 제공
app.route('/auth', auth)

// Pages
app.get('/', (c) => c.html(<LandingPage />))
app.get('/pricing', (c) => c.html(<PricingPage />))

app.get('/result/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.notFound()
  const scan = await getScanById(c.env, id)
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
  return c.html(<ResultPage scan={scan} />)
})

// 로그인 페이지 (매직링크 입력)
app.get('/login', async (c) => {
  const u = await getUserFromCookie(c)
  if (u) return c.redirect(u.is_admin ? '/admin' : '/dashboard')
  const error = c.req.query('error') || undefined
  return c.html(<LoginPage error={error} />)
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
    db.prepare(`SELECT COALESCE(SUM(amount),0) as n FROM payments WHERE status='paid'`).first<any>(),
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

// Terms / Privacy
app.get('/terms', (c) =>
  c.html(
    <Layout title="이용약관 · Patient Rank">
      <NavBar />
      <main class="max-w-3xl mx-auto px-5 py-16 prose">
        <h1 class="text-3xl font-bold text-slate-900">이용약관</h1>
        <p class="mt-4 text-slate-600">본 약관은 Patient Rank(이하 "회사")가 제공하는 서비스 이용에 관한 사항을 규정합니다. (전체 약관은 정식 런칭 시 공개됩니다.)</p>
      </main>
      <Footer />
    </Layout>,
  ),
)

app.get('/privacy', (c) =>
  c.html(
    <Layout title="개인정보처리방침 · Patient Rank">
      <NavBar />
      <main class="max-w-3xl mx-auto px-5 py-16 prose">
        <h1 class="text-3xl font-bold text-slate-900">개인정보처리방침</h1>
        <p class="mt-4 text-slate-600">Patient Rank는 이메일을 AES-256으로 암호화하여 저장하고, IP 주소는 SHA-256 해시로만 보관합니다. 결제 정보는 토스페이먼츠 Customer Key만 저장하며 카드 정보는 직접 보관하지 않습니다.</p>
      </main>
      <Footer />
    </Layout>,
  ),
)

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

export default app
