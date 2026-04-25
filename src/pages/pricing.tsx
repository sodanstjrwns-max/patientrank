import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'

export const PricingPage: FC = () => {
  const plans = [
    { name: 'Free', price: 0, desc: '체험용', features: ['도메인 1개', '월 3회 조회', '상위 20개 키워드 공개'], cta: '무료 시작', href: '/#diagnose' },
    { name: 'Basic', price: 2900, early: 1450, desc: '소규모 1인 병원', features: ['도메인 1개', '월 30회 조회', '전체 키워드 공개', '주간 카톡 알림', 'PDF 리포트'], cta: '시작하기', href: '/login' },
    { name: 'Pro', price: 4900, early: 2450, desc: '성장 중인 병원', features: ['도메인 3개', '월 50회 조회', '전체 키워드 공개', '주간 카톡 알림', '경쟁사 갭 분석', '백링크 분석', '7일 무료체험'], cta: '시작하기', href: '/login', popular: true },
    { name: 'Agency', price: 15900, early: 7950, desc: '마케팅 에이전시', features: ['도메인 20개', '월 150회 조회', 'Pro 전체 기능', 'API 접근', '화이트라벨', '우선 지원'], cta: '문의하기', href: 'mailto:hello@patientrank.kr' },
  ]

  return (
    <Layout title="가격 · Patient Rank">
      <NavBar />
      <main class="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 rounded-full bg-warn/10 text-warn text-xs font-semibold mb-4">
            🎉 얼리버드 3개월 50% 할인 · 6개월간 할인 유지
          </span>
          <h1 class="text-4xl md:text-5xl font-bold text-slate-900">필요한 만큼만 쓰세요</h1>
          <p class="mt-4 text-slate-600">카드 등록 없이 Pro 7일 무료체험 · 부담 없이 시작</p>
        </div>

        <div class="grid md:grid-cols-4 gap-5">
          {plans.map((p: any) => (
            <div class={`relative p-7 rounded-2xl border-2 ${p.popular ? 'border-brand bg-gradient-to-b from-brand-50 to-white shadow-xl' : 'border-slate-200 bg-white'}`}>
              {p.popular && <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand text-white text-xs font-bold">가장 인기</div>}
              <div class="text-sm text-slate-500">{p.desc}</div>
              <div class="text-xl font-bold text-slate-900 mt-1">{p.name}</div>
              <div class="mt-5">
                {p.early !== undefined ? (
                  <>
                    <div class="text-xs text-slate-400 line-through">월 {p.price.toLocaleString()}원</div>
                    <div class="text-4xl font-extrabold text-slate-900">{p.early.toLocaleString()}<span class="text-base font-medium text-slate-500">원/월</span></div>
                  </>
                ) : (
                  <div class="text-4xl font-extrabold text-slate-900">{p.price === 0 ? '무료' : `${p.price.toLocaleString()}원`}</div>
                )}
              </div>
              <ul class="mt-6 space-y-2.5 text-sm text-slate-600">
                {p.features.map((f: string) => (
                  <li class="flex gap-2"><i class="fas fa-check text-accent mt-1"></i>{f}</li>
                ))}
              </ul>
              <a href={p.href} class={`mt-7 block text-center py-3 rounded-lg font-semibold ${p.popular ? 'bg-brand text-white hover:bg-brand-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        <div class="mt-16 p-8 rounded-2xl bg-slate-50 border border-slate-200">
          <h2 class="text-xl font-bold text-slate-900 mb-4">자주 묻는 질문</h2>
          <div class="space-y-4 text-sm">
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">얼리버드 할인은 언제까지 유지되나요?</summary>
              <p class="text-slate-600 pb-3">런칭 3개월 내 가입하시면 <b>6개월간</b> 50% 할인이 유지됩니다. 이후 정가로 자동 전환됩니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">Pro 무료체험은 카드 등록이 필요한가요?</summary>
              <p class="text-slate-600 pb-3">아니요. 이메일 인증만 하면 7일 동안 Pro 기능을 체험할 수 있습니다. 체험 후에는 자동으로 Basic으로 다운그레이드됩니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">월 조회 횟수가 넘으면 어떻게 되나요?</summary>
              <p class="text-slate-600 pb-3">다음 달 1일 자동 초기화됩니다. 초과 시 상위 플랜 전환을 안내드립니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">결제 수단은 어떻게 되나요?</summary>
              <p class="text-slate-600 pb-3">토스페이먼츠를 통해 신용카드·계좌이체를 지원합니다. 안전하게 처리되며 카드 정보는 저장되지 않습니다.</p>
            </details>
          </div>
        </div>
      </main>
      <Footer />
    </Layout>
  )
}
