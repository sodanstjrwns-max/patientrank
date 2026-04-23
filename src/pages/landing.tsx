// 랜딩 페이지
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'

export const LandingPage: FC = () => {
  return (
    <Layout>
      <NavBar />
      <main>
        {/* Hero */}
        <section id="diagnose" class="relative overflow-hidden">
          <div class="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white"></div>
          <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-100 blur-3xl opacity-60 -z-10"></div>
          <div class="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-emerald-100 blur-3xl opacity-60 -z-10"></div>

          <div class="max-w-4xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
            <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs md:text-sm text-slate-600 shadow-sm mb-6">
              <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              국내 최초 의료기관 전용 구글 SEO 진단 SaaS
            </span>
            <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              우리 병원<br class="md:hidden" /> 구글에서 <span class="text-brand">몇 위?</span>
            </h1>
            <p class="mt-5 text-base md:text-xl text-slate-600 leading-relaxed">
              네이버 말고 <b class="text-slate-900">구글</b>.
              AI 검색 시대, 진짜 노출을 체크하세요.<br class="hidden md:block" />
              URL 하나만 넣으면 10초 안에 랭크 키워드 전체가 나옵니다.
            </p>

            {/* URL 입력 폼 */}
            <form id="scan-form" class="mt-10 max-w-2xl mx-auto" onsubmit="return window.__submitScan && window.__submitScan(event)">
              <div class="flex flex-col md:flex-row gap-3 p-2 bg-white rounded-2xl shadow-lg shadow-brand/10 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand">
                <div class="flex-1 flex items-center gap-3 px-4">
                  <i class="fas fa-globe text-slate-400"></i>
                  <input
                    id="scan-url"
                    type="text"
                    autocomplete="off"
                    autocapitalize="off"
                    spellcheck={false}
                    placeholder="example-hospital.com"
                    class="w-full py-4 text-base md:text-lg outline-none bg-transparent placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  class="py-4 px-7 rounded-xl bg-brand hover:bg-brand-600 text-white font-semibold text-base md:text-lg shadow-md transition whitespace-nowrap"
                >
                  <i class="fas fa-magnifying-glass mr-2"></i>
                  무료로 10초 진단
                </button>
              </div>
              <div id="scan-error" class="hidden mt-3 text-sm text-warn"></div>
              <p class="mt-4 text-xs text-slate-500">
                <i class="fas fa-shield-halved mr-1"></i>
                카드 등록 불필요 · 월 3회 무료 · 이메일도 안 받아요 (결과 확인까지)
              </p>
            </form>
          </div>

          {/* 로딩 오버레이 */}
          <div id="loading-overlay" class="hidden fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <div class="max-w-md w-full px-6 text-center">
              <div class="relative w-20 h-20 mx-auto">
                <div class="absolute inset-0 rounded-full border-4 border-brand-100"></div>
                <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
                <i class="fas fa-arrow-trend-up absolute inset-0 flex items-center justify-center text-brand text-xl"></i>
              </div>
              <h3 class="mt-6 text-xl font-bold text-slate-900">진단 중입니다</h3>
              <p id="loading-message" class="mt-2 text-slate-600">구글 색인에서 키워드 긁는 중...</p>
              <div class="mt-6 space-y-2 text-sm text-slate-400">
                <div class="flex items-center justify-center gap-2"><i class="fas fa-check text-accent"></i> URL 검증</div>
                <div class="flex items-center justify-center gap-2" id="step-2"><i class="far fa-circle"></i> 구글 색인 조회</div>
                <div class="flex items-center justify-center gap-2" id="step-3"><i class="far fa-circle"></i> 의료 키워드 매칭</div>
                <div class="flex items-center justify-center gap-2" id="step-4"><i class="far fa-circle"></i> 랭킹 데이터 정리</div>
              </div>
            </div>
          </div>
        </section>

        {/* 소셜 프루프 */}
        <section class="max-w-5xl mx-auto px-5 py-12">
          <div class="text-center text-sm text-slate-500 mb-6">
            비디치과 검증 기술 · 페이션트퍼널 공식 도구
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 opacity-75">
            {['서울비디치과', '강남성형외과', '바른한의원', '맑은피부과', '참안과'].map((n) => (
              <div class="h-14 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
                {n}
              </div>
            ))}
          </div>
        </section>

        {/* 기능 3단 */}
        <section id="features" class="max-w-6xl mx-auto px-5 py-16">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900">원장님이 필요한 딱 3가지</h2>
            <p class="mt-3 text-slate-600">복잡한 SEO 도구는 필요 없습니다. 핵심만 합니다.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'fa-link',
                title: 'URL 하나로 끝',
                desc: '키워드 입력 없이 병원 홈페이지 주소만 넣으세요. 구글에서 랭크된 모든 키워드를 역추적합니다.',
                color: 'bg-brand-50 text-brand',
              },
              {
                icon: 'fa-bell',
                title: '매주 자동 체크',
                desc: '월요일 오전 9시 주간 순위 변동 카톡 발송. 급상승·급하락·신규 진입·이탈 4카테고리로 정리.',
                color: 'bg-emerald-50 text-accent-600',
              },
              {
                icon: 'fa-chart-column',
                title: '경쟁사 자동 분석',
                desc: '동일 상권 경쟁 병원이 랭크한 키워드 중 우리 병원에 없는 갭 키워드를 자동 추출합니다.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: 'fa-link',
                title: '백링크 · 도메인 권위',
                desc: '어떤 사이트가 살아있는 링크로 권위를 흘려보내는지, 경쟁 치과는 어디서 링크 받는지까지 추적합니다.',
                color: 'bg-indigo-50 text-indigo-600',
              },
            ].map((f) => (
              <div class="p-7 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-1 transition">
                <div class={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <i class={`fas ${f.icon} text-lg`}></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p class="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 왜 구글인가 */}
        <section class="bg-slate-50 border-y border-slate-200">
          <div class="max-w-5xl mx-auto px-5 py-16">
            <div class="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 class="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  왜 <span class="text-brand">구글</span>인가?
                </h2>
                <p class="mt-4 text-slate-600 leading-relaxed">
                  ChatGPT · Perplexity · Gemini 같은 AI 검색은 전부 <b>구글 색인 기반</b>입니다.
                  앞으로 환자가 “강남 임플란트 잘하는 곳”을 물을 곳은 네이버가 아닙니다.
                </p>
                <ul class="mt-6 space-y-3 text-slate-700">
                  <li class="flex gap-3"><i class="fas fa-check-circle text-accent mt-1"></i><span>AI 검색 답변 출처 = 구글 상위 노출</span></li>
                  <li class="flex gap-3"><i class="fas fa-check-circle text-accent mt-1"></i><span>해외 환자·젊은 층은 이미 구글 우선</span></li>
                  <li class="flex gap-3"><i class="fas fa-check-circle text-accent mt-1"></i><span>네이버 광고비는 계속 오르지만 구글 SEO는 자산</span></li>
                </ul>
              </div>
              <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div class="text-sm text-slate-500 mb-3">샘플 리포트</div>
                <div class="space-y-3">
                  <div class="p-4 rounded-lg bg-brand-50 flex items-center justify-between">
                    <span class="text-sm text-slate-600">총 랭크 키워드</span>
                    <span class="text-2xl font-bold text-brand">127</span>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="p-3 rounded-lg bg-emerald-50 text-center"><div class="text-xs text-slate-500">TOP 3</div><div class="font-bold text-accent-600">8</div></div>
                    <div class="p-3 rounded-lg bg-amber-50 text-center"><div class="text-xs text-slate-500">TOP 10</div><div class="font-bold text-amber-600">23</div></div>
                    <div class="p-3 rounded-lg bg-slate-100 text-center"><div class="text-xs text-slate-500">TOP 30</div><div class="font-bold text-slate-600">54</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 가격 섹션 */}
        <section id="pricing" class="max-w-6xl mx-auto px-5 py-16">
          <div class="text-center mb-10">
            <span class="inline-block px-3 py-1 rounded-full bg-warn/10 text-warn text-xs font-semibold mb-4">
              🎉 얼리버드 3개월 50% 할인
            </span>
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900">월 1,450원부터 시작</h2>
            <p class="mt-3 text-slate-600">런칭 3개월 한정. 얼리버드 가입자는 6개월간 할인 유지.</p>
          </div>
          <div class="grid md:grid-cols-4 gap-5">
            {[
              { name: 'Free', price: 0, desc: '체험용', features: ['도메인 1개', '월 3회 조회', '상위 20개 키워드'], cta: '무료 시작' },
              { name: 'Basic', price: 2900, early: 1450, desc: '소규모 1인 병원', features: ['도메인 1개', '월 30회 조회', '전체 키워드 공개', '주간 카톡 알림'], cta: '시작하기' },
              { name: 'Pro', price: 4900, early: 2450, desc: '성장 중인 병원', features: ['도메인 3개', '월 50회 조회', '경쟁사 갭 분석', '백링크 분석'], cta: '시작하기', popular: true },
              { name: 'Agency', price: 15900, early: 7950, desc: '마케팅 에이전시', features: ['도메인 20개', '월 150회 조회', 'API 접근', '화이트라벨'], cta: '문의하기' },
            ].map((p: any) => (
              <div class={`relative p-6 rounded-2xl border-2 ${p.popular ? 'border-brand bg-gradient-to-b from-brand-50 to-white shadow-lg' : 'border-slate-200 bg-white'}`}>
                {p.popular && <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand text-white text-xs font-bold">가장 인기</div>}
                <div class="text-sm text-slate-500">{p.desc}</div>
                <div class="text-xl font-bold text-slate-900 mt-1">{p.name}</div>
                <div class="mt-4">
                  {p.early !== undefined ? (
                    <>
                      <div class="text-xs text-slate-400 line-through">월 {p.price.toLocaleString()}원</div>
                      <div class="text-3xl font-extrabold text-slate-900">{p.early.toLocaleString()}<span class="text-base font-medium text-slate-500">원/월</span></div>
                    </>
                  ) : (
                    <div class="text-3xl font-extrabold text-slate-900">{p.price === 0 ? '무료' : `${p.price.toLocaleString()}원`}</div>
                  )}
                </div>
                <ul class="mt-5 space-y-2 text-sm text-slate-600">
                  {p.features.map((f: string) => (
                    <li class="flex gap-2"><i class="fas fa-check text-accent mt-1"></i>{f}</li>
                  ))}
                </ul>
                <a href={p.name === 'Free' ? '#diagnose' : '/pricing'} class={`mt-6 block text-center py-3 rounded-lg font-semibold ${p.popular ? 'bg-brand text-white hover:bg-brand-600' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section class="max-w-4xl mx-auto px-5 py-16 text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900">지금 우리 병원 순위 확인하세요</h2>
          <p class="mt-4 text-slate-600">10초면 끝납니다. 이메일도 안 받습니다.</p>
          <a href="#diagnose" class="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand text-white font-semibold text-lg shadow-lg hover:bg-brand-600 transition">
            <i class="fas fa-arrow-up"></i> 무료 진단 받기
          </a>
        </section>
      </main>
      <Footer />
      <script src="/static/landing.js"></script>
    </Layout>
  )
}
