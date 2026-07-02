import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'

export const PricingPage: FC = () => {
  const plans = [
    {
      name: 'Free',
      price: 0,
      desc: '체험용',
      tagline: '일단 내 병원 진단부터',
      features: [
        '도메인 1개',
        '월 1회 스캔',
        '상위 20개 키워드 공개',
        '기본 백링크 분석',
      ],
      cta: '무료 시작',
      href: '/#diagnose',
    },
    {
      name: 'Basic',
      price: 49000,
      desc: '소규모 1인 병원',
      tagline: '광고비 줄이기 시작',
      features: [
        '도메인 1개',
        '월 5회 스캔',
        '전체 키워드 공개',
        '백링크 풀 분석',
        '경쟁사 갭 분석',
        '주간 카톡 리포트',
      ],
      cta: '시작하기',
      href: '/login',
    },
    {
      name: 'Pro',
      price: 149000,
      desc: '성장 중인 병원',
      tagline: '실제 노출 키워드 25,000개 잡기',
      features: [
        '도메인 3개',
        '월 10회 스캔',
        '롱테일 자동 발굴 (45+ 키워드)',
        'Google Search Console 연동',
        '실측 노출 데이터 25,000개',
        '놓친 키워드 자동 추출',
        '7일 무료체험',
      ],
      cta: '시작하기',
      href: '/login',
      popular: true,
    },
    {
      name: 'Agency',
      price: 490000,
      desc: '마케팅 에이전시',
      tagline: '병원당 4.9만원 꼴',
      features: [
        '도메인 20개',
        '월 50회 스캔',
        'Pro 전체 기능 포함',
        'API 접근',
        '화이트라벨 리포트',
        '우선 기술지원',
      ],
      cta: '문의하기',
      href: 'mailto:hello@patientrank.kr',
    },
  ]

  return (
    <Layout title="가격 · Patient Rank">
      <NavBar />
      {/* 다크 히어로 헤더 (랜딩과 톤 통일) */}
      <section id="pricing-hero" class="relative hero-dark overflow-hidden pt-28 pb-40 md:pt-32 md:pb-48">
        <div class="absolute inset-0 stars-grid pointer-events-none"></div>
        <div class="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(0, 102, 255, 0.35) 0%, transparent 60%); filter: blur(80px);"></div>
        <div class="absolute top-[200px] left-[-150px] w-[500px] h-[500px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(124, 92, 255, 0.25) 0%, transparent 60%); filter: blur(80px);"></div>
        <div class="relative max-w-3xl mx-auto px-5 text-center">
          <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-dark text-xs font-semibold text-white/85 mb-6">
            <i class="fas fa-gift text-accent"></i>
            페이션트 퍼널 교육 수료생 50% 평생 할인
          </span>
          <h1 class="text-display-md md:text-display-lg text-white">
            광고비보다 <span class="text-gradient-dark">싼 SEO 진단</span>
          </h1>
          <p class="mt-5 text-white/60 text-base md:text-lg">
            월 광고비 1,000만원 쓰는 병원 기준, Pro 플랜 도입 후 평균 <b class="text-white">40% 절감</b> · ROI 약 27배
          </p>
          <p class="mt-3 text-xs text-white/40"><i class="fas fa-credit-card mr-1"></i>카드 등록 없이 Pro 7일 무료체험</p>
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white pointer-events-none"></div>
      </section>

      <main class="relative max-w-6xl mx-auto px-5 pb-16">
        {/* 플랜 카드 — 히어로 위로 올라타는 오버랩 */}
        <div class="-mt-32 md:-mt-36 relative z-10 grid md:grid-cols-4 gap-5">
          {plans.map((p: any) => (
            <div class={`relative p-7 rounded-3xl flex flex-col ${p.popular ? 'bg-gradient-to-br from-white via-brand-50/50 to-iris-500/5 shadow-glow-brand ring-2 ring-brand/60 md:scale-[1.03]' : 'card-v3 shadow-card'}`}>
              {p.popular && (
                <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand via-iris-500 to-accent text-white text-xs font-bold shadow-md whitespace-nowrap">
                  <i class="fas fa-star mr-1"></i> 가장 인기
                </div>
              )}
              <div class="text-xs text-ink-500 font-semibold uppercase tracking-wider">{p.desc}</div>
              <div class="text-2xl font-extrabold text-ink-900 mt-1">{p.name}</div>
              <div class="text-xs text-brand font-semibold mt-1 min-h-[20px]">{p.tagline || ''}</div>
              <div class="mt-5">
                <div class="text-4xl font-extrabold text-ink-900 tabular-nums">
                  {p.price === 0 ? '무료' : `${p.price.toLocaleString()}`}
                  {p.price > 0 && <span class="text-base font-medium text-ink-500">원/월</span>}
                </div>
                {p.price > 0 && (
                  <div class="text-xs text-ink-400 mt-1">VAT 별도 · 월간 자동결제</div>
                )}
              </div>
              <ul class="mt-6 space-y-2.5 text-sm text-ink-600 flex-1">
                {p.features.map((f: string) => (
                  <li class="flex gap-2"><i class="fas fa-circle-check text-accent mt-0.5"></i><span>{f}</span></li>
                ))}
              </ul>
              <a href={p.href} class={`btn-shine mt-7 block text-center py-3.5 rounded-xl font-bold text-sm transition ${p.popular ? 'bg-gradient-to-br from-brand via-iris-500 to-brand-600 text-white hover:shadow-glow-brand' : 'bg-ink-900 text-white hover:bg-ink-800'}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        {/* ROI 강조 카드 */}
        <div class="mt-12 relative overflow-hidden p-8 rounded-3xl hero-dark text-white">
          <div class="absolute inset-0 stars-grid opacity-50 pointer-events-none"></div>
          <div class="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-iris-500/20 blur-3xl pointer-events-none"></div>
          <div class="relative flex items-start gap-6 flex-wrap">
            <div class="flex-1 min-w-[280px]">
              <div class="text-xs uppercase tracking-wider text-brand-300 font-bold mb-2">
                <i class="fas fa-chart-line mr-1"></i>왜 PRO 플랜인가
              </div>
              <h2 class="text-2xl font-bold leading-tight">
                월 14.9만원 투자 → 평균 광고비 400만원 절감
              </h2>
              <p class="mt-3 text-white/70 text-sm leading-relaxed">
                페이션트 퍼널 교육 수료 병원들의 실측 데이터입니다. SEO로 자연 유입이 늘면 광고 의존도가 떨어지고,
                상담 전환율은 평균 62%까지 올라갑니다.
              </p>
            </div>
            <div class="flex gap-4 flex-wrap">
              <div class="bento-card text-center px-5 py-4 rounded-xl">
                <div class="text-3xl font-extrabold text-brand-300 tabular-nums">27x</div>
                <div class="text-xs text-white/40 mt-1">예상 ROI</div>
              </div>
              <div class="bento-card text-center px-5 py-4 rounded-xl">
                <div class="text-3xl font-extrabold text-accent tabular-nums">40%</div>
                <div class="text-xs text-white/40 mt-1">광고비 절감</div>
              </div>
              <div class="bento-card text-center px-5 py-4 rounded-xl">
                <div class="text-3xl font-extrabold text-warn tabular-nums">62%</div>
                <div class="text-xs text-white/40 mt-1">상담 전환율</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-16 p-8 rounded-3xl bg-ink-50 border border-ink-200">
          <div class="eyebrow mb-3"><i class="fas fa-circle-question text-[10px]"></i> FAQ</div>
          <h2 class="text-xl font-extrabold text-ink-900 mb-4">자주 묻는 질문</h2>
          <div class="space-y-4 text-sm">
            <details class="group">
              <summary class="font-semibold text-ink-900 cursor-pointer py-2">페이션트 퍼널 교육 수료생 할인은 어떻게 받나요?</summary>
              <p class="text-ink-600 pb-3">교육 수료증 또는 등록 시 사용한 이메일로 <a class="text-brand underline" href="mailto:hello@patientrank.kr">hello@patientrank.kr</a>에 문의 주시면 평생 50% 할인 코드를 발급해 드립니다. (Pro 14.9만 → 7.45만원/월)</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-ink-900 cursor-pointer py-2">Pro 무료체험은 카드 등록이 필요한가요?</summary>
              <p class="text-ink-600 pb-3">아니요. Google 계정으로 로그인만 하면 7일 동안 Pro 기능을 체험할 수 있습니다. 체험 후에는 자동으로 Free로 다운그레이드되며 결제가 발생하지 않습니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-ink-900 cursor-pointer py-2">월 스캔 횟수가 넘으면 어떻게 되나요?</summary>
              <p class="text-ink-600 pb-3">다음 달 1일 자동 초기화됩니다. 초과가 잦으면 상위 플랜 전환을 안내드리며, 1회 추가 스캔은 단건 결제로도 가능합니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-ink-900 cursor-pointer py-2">Google Search Console 연동은 안전한가요?</summary>
              <p class="text-ink-600 pb-3">읽기 전용(<code class="text-xs bg-ink-200 px-1.5 py-0.5 rounded">webmasters.readonly</code>) 권한만 요청하므로 사이트 설정을 변경할 수 없습니다. 데이터는 본인에게만 표시되며 제3자에게 공유하지 않습니다. 자세한 사항은 <a href="/privacy" class="text-brand underline">개인정보처리방침</a> 참고.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-ink-900 cursor-pointer py-2">결제 수단은 어떻게 되나요?</summary>
              <p class="text-ink-600 pb-3">토스페이먼츠를 통해 신용카드·계좌이체를 지원합니다. 안전하게 처리되며 카드 정보는 저장되지 않습니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-ink-900 cursor-pointer py-2">환불은 가능한가요?</summary>
              <p class="text-ink-600 pb-3">결제일로부터 7일 이내, 서비스를 사용하지 않으셨다면 전액 환불됩니다. 사용 후에는 잔여 기간 일할 계산하여 환불 가능합니다. 자세한 사항은 <a href="/terms" class="text-brand underline">이용약관 제11조</a> 참고.</p>
            </details>
          </div>
        </div>
      </main>
      <Footer />
    </Layout>
  )
}
