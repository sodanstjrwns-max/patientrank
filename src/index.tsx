// Patient Rank - Main Hono app entry
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import type { Bindings } from './lib/types'
import api from './routes/api'
import { LandingPage } from './pages/landing'
import { ResultPage } from './pages/result'
import { PricingPage } from './pages/pricing'
import { Layout, NavBar, Footer } from './pages/layout'
import { getScanById } from './lib/scan-service'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('/api/*', cors())

// API
app.route('/api', api)

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

// Login placeholder
app.get('/login', (c) =>
  c.html(
    <Layout title="로그인 · Patient Rank">
      <NavBar />
      <main class="max-w-md mx-auto px-5 py-20">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900">로그인</h1>
          <p class="mt-2 text-slate-600">이메일 매직링크로 로그인합니다</p>
        </div>
        <form class="space-y-4 p-7 rounded-2xl border border-slate-200 bg-white">
          <div>
            <label class="text-sm font-medium text-slate-700">이메일</label>
            <input type="email" placeholder="doctor@clinic.co.kr"
              class="mt-1 w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-50 outline-none" />
          </div>
          <button type="button" disabled
            class="w-full py-3 rounded-lg bg-slate-300 text-white font-semibold cursor-not-allowed">
            매직링크 받기 (M2에서 활성화)
          </button>
          <p class="text-xs text-slate-500 text-center">매직링크 로그인은 M2 마일스톤에서 제공됩니다</p>
        </form>
      </main>
      <Footer />
    </Layout>,
  ),
)

// Dashboard placeholder
app.get('/dashboard', (c) =>
  c.html(
    <Layout title="대시보드 · Patient Rank">
      <NavBar loggedIn />
      <main class="max-w-6xl mx-auto px-5 py-16 text-center">
        <div class="text-5xl mb-4">🚧</div>
        <h1 class="text-2xl font-bold text-slate-900">대시보드는 M2에서 공개됩니다</h1>
        <p class="mt-3 text-slate-600">현재 M1 MVP 단계입니다. URL 진단 기능을 먼저 체험해보세요.</p>
        <a href="/" class="mt-6 inline-block px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600">
          랜딩으로
        </a>
      </main>
      <Footer />
    </Layout>,
  ),
)

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

// Terms / Privacy placeholders
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
