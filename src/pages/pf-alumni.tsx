// Day 8: 페이션트 퍼널 수료생 전용 런칭 LP
import { Layout, Footer } from './layout'

export const PfAlumniPage = () => (
  <Layout
    title="페이션트 퍼널 수료생 전용 — 임플란트·인비절라인·라미네이트·치아교정 SEO 진단 50% 평생 할인 | PatientRank"
    description="페이션트 퍼널 수료 원장님 전용 PatientRank 베타 혜택. 임플란트, 인비절라인, 라미네이트, 글로우네이트, 치아교정 등 의료 카테고리 Google SEO 진단 SaaS — 50% 평생 할인 + 1:1 컨설팅 무료."
  >
    {/* Hero */}
    <section class="bg-gradient-to-br from-rose-600 via-rose-700 to-pink-700 text-white py-20 px-6">
      <div class="max-w-5xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
          <i class="fas fa-graduation-cap"></i>
          페이션트 퍼널 수료생 전용 페이지
        </div>
        <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-5">
          환자 퍼널 10단계,<br />
          <span class="text-amber-200">'인지'의 첫 단계</span>를 책임지는 도구
        </h1>
        <p class="text-lg md:text-xl text-rose-100 max-w-3xl mx-auto mb-8 leading-relaxed">
          PF에서 배운 환자 여정 설계, 이제 Google 검색에서도 똑같이 적용하세요.<br />
          <strong class="text-white">의료 카테고리 전용</strong> SEO 진단으로 광고비 의존을 끊어내는 가장 빠른 길.
        </p>

        <div class="bg-amber-50 text-amber-900 rounded-2xl p-5 max-w-2xl mx-auto mb-8 shadow-xl">
          <p class="text-sm font-semibold text-amber-700 mb-1">
            <i class="fas fa-gift mr-1"></i> 수료생 한정 혜택
          </p>
          <p class="text-2xl font-bold mb-1">
            Pro 플랜 <span class="line-through text-gray-400 text-lg">149,000원</span>{' '}
            <span class="text-rose-600">74,500원</span> / 월
          </p>
          <p class="text-sm">50% 평생 할인 + 1:1 SEO 컨설팅 30분 무료 (선착순 100명)</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/beta?ref=pf-alumni"
            class="inline-block bg-white text-rose-700 font-bold rounded-xl px-8 py-4 text-lg hover:bg-amber-50 transition shadow-lg"
          >
            <i class="fas fa-rocket mr-2"></i>
            PF 코드로 베타 신청
          </a>
          <a
            href="#how"
            class="inline-block bg-white/15 backdrop-blur text-white font-semibold rounded-xl px-8 py-4 text-lg hover:bg-white/25 transition"
          >
            <i class="fas fa-circle-info mr-2"></i>
            먼저 자세히 보기
          </a>
        </div>

        <p class="text-rose-100 text-sm mt-6">
          <i class="fas fa-shield-check mr-1"></i>
          PF 코드는 <span class="font-mono bg-white/15 px-2 py-0.5 rounded">PF0000-001</span> 형식 (예: PF2024-042)
        </p>
      </div>
    </section>

    {/* PF 철학 연결 */}
    <section class="py-16 px-6 bg-white">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-3">
          왜 PF 수료생에게만 먼저 여나요?
        </h2>
        <p class="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          PatientRank는 페이션트 퍼널 10단계 중 <strong class="text-rose-600">1단계 '인지'</strong>를
          데이터로 증명하는 도구입니다. 환자 여정을 이미 이해하는 분들과 먼저 만들고 싶어요.
        </p>

        <div class="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: 'fa-magnifying-glass',
              title: '1단계: 인지',
              desc: '환자가 우리 병원을 검색 결과에서 처음 만나는 순간. Google에서 몇 위로 노출되고 있나요?',
              color: 'text-rose-600',
            },
            {
              icon: 'fa-handshake',
              title: '6단계: 상담',
              desc: '검색으로 우리를 찾아온 환자는 광고로 온 환자보다 상담 전환율이 평균 2.3배 높습니다.',
              color: 'text-amber-600',
            },
            {
              icon: 'fa-heart',
              title: '10단계: 추천',
              desc: '브랜드 검색량이 오르면 추천 환자도 따라 오릅니다. SEO는 모든 단계의 토대입니다.',
              color: 'text-emerald-600',
            },
          ].map((card) => (
            <div class="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
              <i class={`fas ${card.icon} ${card.color} text-3xl mb-3`}></i>
              <h3 class="font-bold text-gray-900 text-lg mb-2">{card.title}</h3>
              <p class="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 진료과목별 사례 */}
    <section id="how" class="py-16 px-6 bg-gray-50">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-3">
          진료과목별 SEO 진단 사례
        </h2>
        <p class="text-center text-gray-600 mb-10">
          의료 카테고리에 특화된 키워드 데이터 — 일반 SEO 도구와 다른 점
        </p>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { dept: '임플란트', kws: ['강남임플란트', '임플란트가격', '치아교정후임플란트'], color: 'bg-rose-100 text-rose-700' },
            { dept: '교정', kws: ['투명교정', '성인교정비용', '인비절라인'], color: 'bg-amber-100 text-amber-700' },
            { dept: '소아치과', kws: ['어린이충치치료', '실란트', '수면치료치과'], color: 'bg-sky-100 text-sky-700' },
            { dept: '심미보철', kws: ['라미네이트', '올세라믹크라운', '앞니치료'], color: 'bg-emerald-100 text-emerald-700' },
            { dept: '치주', kws: ['잇몸치료', '치주염', '레이저잇몸수술'], color: 'bg-purple-100 text-purple-700' },
            { dept: '구강악안면', kws: ['사랑니발치', '턱관절치료', '구강외과'], color: 'bg-slate-100 text-slate-700' },
          ].map((d) => (
            <div class="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition">
              <h3 class="font-bold text-gray-900 mb-3">
                <i class="fas fa-tooth text-rose-500 mr-1"></i> {d.dept}
              </h3>
              <div class="flex flex-wrap gap-1.5">
                {d.kws.map((k) => (
                  <span class={`${d.color} text-xs px-2.5 py-1 rounded-full font-medium`}>{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p class="text-center text-sm text-gray-500 mt-8">
          <i class="fas fa-info-circle mr-1"></i>
          DataForSEO 한국 데이터베이스 + 의료광고법 필터 + 지역×진료 매트릭스로 확장
        </p>
      </div>
    </section>

    {/* 베타 혜택 비교 */}
    <section class="py-16 px-6 bg-white">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-10">
          PF 수료생만 받는 4가지
        </h2>
        <div class="space-y-4">
          {[
            { icon: 'fa-tag', title: '50% 평생 할인', desc: '월 149,000원 → 74,500원, 해지하지 않는 한 영구 유지' },
            { icon: 'fa-user-tie', title: '1:1 SEO 컨설팅 30분', desc: '문석준 원장 또는 시니어 컨설턴트가 직접 진단 결과 해석 (선착순 100명)' },
            { icon: 'fa-flask', title: '신기능 우선 체험', desc: '경쟁사 추적, AI 액션 가이드, GSC 연동 등 모든 신기능 7일 먼저 오픈' },
            { icon: 'fa-comments', title: '전용 PF 단톡방 초대', desc: '같은 고민을 하는 PF 수료 원장님들과 SEO 노하우 공유 (운영진 상주)' },
          ].map((b) => (
            <div class="flex items-start gap-4 bg-rose-50 border border-rose-100 rounded-xl p-5">
              <div class="bg-rose-600 text-white rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                <i class={`fas ${b.icon}`}></i>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-1">{b.title}</h3>
                <p class="text-sm text-gray-700">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 최종 CTA */}
    <section class="py-20 px-6 bg-gradient-to-br from-gray-900 to-rose-900 text-white text-center">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          광고비 의존을 끊는 첫 걸음,<br />
          오늘 시작하세요
        </h2>
        <p class="text-rose-100 mb-8 text-lg">
          베타 신청 후 24시간 안에 초대장과 컨설팅 일정을 카카오톡으로 보내드립니다.
        </p>
        <a
          href="/beta?ref=pf-alumni"
          class="inline-block bg-white text-rose-700 font-bold rounded-xl px-10 py-5 text-xl hover:bg-amber-50 transition shadow-2xl"
        >
          <i class="fas fa-arrow-right mr-2"></i>
          PF 코드로 베타 신청하기
        </a>
        <p class="text-rose-200 text-sm mt-6">
          질문이 있으세요? <a href="mailto:hello@patientrank.kr" class="underline hover:text-white">hello@patientrank.kr</a>
        </p>
      </div>
    </section>

    <Footer />
  </Layout>
)
