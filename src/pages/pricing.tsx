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
      <main class="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 rounded-full bg-warn/10 text-warn text-xs font-semibold mb-4">
            🎉 페이션트 퍼널 교육 수료생 50% 평생 할인
          </span>
          <h1 class="text-4xl md:text-5xl font-bold text-slate-900">광고비보다 싼 SEO 진단</h1>
          <p class="mt-4 text-slate-600">
            월 광고비 1,000만원 쓰는 병원 기준, Pro 플랜 도입 후 평균 <b>40% 절감</b> · ROI 약 27배
          </p>
          <p class="mt-2 text-xs text-slate-500">카드 등록 없이 Pro 7일 무료체험</p>
        </div>

        <div class="grid md:grid-cols-4 gap-5">
          {plans.map((p: any) => (
            <div class={`relative p-7 rounded-2xl border-2 ${p.popular ? 'border-brand bg-gradient-to-b from-brand-50 to-white shadow-xl' : 'border-slate-200 bg-white'}`}>
              {p.popular && <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand text-white text-xs font-bold">가장 인기</div>}
              <div class="text-sm text-slate-500">{p.desc}</div>
              <div class="text-xl font-bold text-slate-900 mt-1">{p.name}</div>
              <div class="text-xs text-brand font-semibold mt-1 min-h-[20px]">{p.tagline || ''}</div>
              <div class="mt-5">
                <div class="text-4xl font-extrabold text-slate-900">
                  {p.price === 0 ? '무료' : `${p.price.toLocaleString()}`}
                  {p.price > 0 && <span class="text-base font-medium text-slate-500">원/월</span>}
                </div>
                {p.price > 0 && (
                  <div class="text-xs text-slate-400 mt-1">VAT 별도 · 월간 자동결제</div>
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

        {/* ROI 강조 카드 */}
        <div class="mt-12 p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-brand-900 text-white">
          <div class="flex items-start gap-6 flex-wrap">
            <div class="flex-1 min-w-[280px]">
              <div class="text-xs uppercase tracking-wider text-brand-300 font-bold mb-2">
                <i class="fas fa-chart-line mr-1"></i>왜 PRO 플랜인가
              </div>
              <h2 class="text-2xl font-bold leading-tight">
                월 14.9만원 투자 → 평균 광고비 400만원 절감
              </h2>
              <p class="mt-3 text-slate-300 text-sm leading-relaxed">
                페이션트 퍼널 교육 수료 병원들의 실측 데이터입니다. SEO로 자연 유입이 늘면 광고 의존도가 떨어지고,
                상담 전환율은 평균 62%까지 올라갑니다.
              </p>
            </div>
            <div class="flex gap-4 flex-wrap">
              <div class="text-center px-5 py-4 rounded-xl bg-white/5 border border-white/10">
                <div class="text-3xl font-extrabold text-brand-300">27x</div>
                <div class="text-xs text-slate-400 mt-1">예상 ROI</div>
              </div>
              <div class="text-center px-5 py-4 rounded-xl bg-white/5 border border-white/10">
                <div class="text-3xl font-extrabold text-accent">40%</div>
                <div class="text-xs text-slate-400 mt-1">광고비 절감</div>
              </div>
              <div class="text-center px-5 py-4 rounded-xl bg-white/5 border border-white/10">
                <div class="text-3xl font-extrabold text-warn">62%</div>
                <div class="text-xs text-slate-400 mt-1">상담 전환율</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-16 p-8 rounded-2xl bg-slate-50 border border-slate-200">
          <h2 class="text-xl font-bold text-slate-900 mb-4">자주 묻는 질문</h2>
          <div class="space-y-4 text-sm">
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">페이션트 퍼널 교육 수료생 할인은 어떻게 받나요?</summary>
              <p class="text-slate-600 pb-3">교육 수료증 또는 등록 시 사용한 이메일로 <a class="text-brand underline" href="mailto:hello@patientrank.kr">hello@patientrank.kr</a>에 문의 주시면 평생 50% 할인 코드를 발급해 드립니다. (Pro 14.9만 → 7.45만원/월)</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">Pro 무료체험은 카드 등록이 필요한가요?</summary>
              <p class="text-slate-600 pb-3">아니요. Google 계정으로 로그인만 하면 7일 동안 Pro 기능을 체험할 수 있습니다. 체험 후에는 자동으로 Free로 다운그레이드되며 결제가 발생하지 않습니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">월 스캔 횟수가 넘으면 어떻게 되나요?</summary>
              <p class="text-slate-600 pb-3">다음 달 1일 자동 초기화됩니다. 초과가 잦으면 상위 플랜 전환을 안내드리며, 1회 추가 스캔은 단건 결제로도 가능합니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">Google Search Console 연동은 안전한가요?</summary>
              <p class="text-slate-600 pb-3">읽기 전용(<code class="text-xs bg-slate-200 px-1.5 py-0.5 rounded">webmasters.readonly</code>) 권한만 요청하므로 사이트 설정을 변경할 수 없습니다. 데이터는 본인에게만 표시되며 제3자에게 공유하지 않습니다. 자세한 사항은 <a href="/privacy" class="text-brand underline">개인정보처리방침</a> 참고.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">결제 수단은 어떻게 되나요?</summary>
              <p class="text-slate-600 pb-3">토스페이먼츠를 통해 신용카드·계좌이체를 지원합니다. 안전하게 처리되며 카드 정보는 저장되지 않습니다.</p>
            </details>
            <details class="group">
              <summary class="font-semibold text-slate-900 cursor-pointer py-2">환불은 가능한가요?</summary>
              <p class="text-slate-600 pb-3">결제일로부터 7일 이내, 서비스를 사용하지 않으셨다면 전액 환불됩니다. 사용 후에는 잔여 기간 일할 계산하여 환불 가능합니다. 자세한 사항은 <a href="/terms" class="text-brand underline">이용약관 제11조</a> 참고.</p>
            </details>
          </div>
        </div>
      </main>
      <Footer />
    </Layout>
  )
}
