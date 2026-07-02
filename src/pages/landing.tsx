// 랜딩 페이지 — 의료 SaaS 프리미엄 디자인 v2
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'

export const LandingPage: FC = () => {
  return (
    <Layout>
      <NavBar />
      <main class="overflow-x-clip">
        {/* ============== HERO (v6 DARK PREMIUM) ============== */}
        <section id="hero" class="relative hero-dark overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
          <a id="diagnose" class="absolute -top-20" aria-hidden="true"></a>

          {/* 별 그리드 (배경 깊이감) */}
          <div class="absolute inset-0 stars-grid pointer-events-none"></div>

          {/* Aurora 글로우 — 마우스 따라 살짝 움직임 (v3: 3색) */}
          <div id="aurora-1" class="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(0, 102, 255, 0.4) 0%, transparent 60%); filter: blur(80px);"></div>
          <div id="aurora-2" class="absolute top-[400px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(0, 208, 132, 0.3) 0%, transparent 60%); filter: blur(80px);"></div>
          <div class="absolute top-[100px] left-[45%] w-[500px] h-[500px] rounded-full pointer-events-none animate-breathe" style="background: radial-gradient(circle, rgba(124, 92, 255, 0.25) 0%, transparent 60%); filter: blur(90px);"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-20 animate-aurora-spin pointer-events-none" style="background: conic-gradient(from 0deg, transparent, #0066FF, transparent, #7C5CFF, transparent, #00D084, transparent);"></div>

          {/* 떨어지는 광선 */}
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="beam" style="left: 12%; animation-delay: 0s; background: linear-gradient(to bottom, transparent, rgba(122, 166, 255, 0.5), transparent);"></div>
            <div class="beam" style="left: 28%; animation-delay: 1.2s; background: linear-gradient(to bottom, transparent, rgba(0, 208, 132, 0.4), transparent);"></div>
            <div class="beam" style="left: 47%; animation-delay: 2.5s; background: linear-gradient(to bottom, transparent, rgba(122, 166, 255, 0.5), transparent);"></div>
            <div class="beam" style="left: 71%; animation-delay: 0.8s; background: linear-gradient(to bottom, transparent, rgba(0, 208, 132, 0.4), transparent);"></div>
            <div class="beam" style="left: 89%; animation-delay: 3.4s; background: linear-gradient(to bottom, transparent, rgba(122, 166, 255, 0.5), transparent);"></div>
          </div>

          <div class="relative max-w-7xl mx-auto px-5">
            {/* 검증 뱃지 */}
            <div class="flex justify-center mb-10 reveal">
              <a href="https://patientfunnel.kr" target="_blank" rel="noopener" class="group relative inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full glass-dark text-xs md:text-sm hover:scale-[1.02] transition">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand to-accent text-white font-semibold text-[11px] shadow-md">
                  <i class="fas fa-shield-halved text-[10px]"></i>
                  검증
                </span>
                <span class="text-white/80"><b class="text-white">페이션트퍼널 ⨯ 서울비디치과</b> 공식 도구</span>
                <span class="inline-flex items-center gap-1 ml-1 text-[10px] text-white/50">
                  <span class="relative flex w-1.5 h-1.5">
                    <span class="absolute inline-flex w-full h-full rounded-full bg-accent opacity-75 animate-ping"></span>
                    <span class="relative inline-flex w-1.5 h-1.5 rounded-full bg-accent"></span>
                  </span>
                  LIVE
                </span>
                <i class="fas fa-arrow-right-long text-[10px] opacity-60 group-hover:translate-x-0.5 transition"></i>
              </a>
            </div>

            {/* 거대 H1 — 중앙 정렬 임팩트 */}
            <div class="text-center max-w-5xl mx-auto reveal">
              <div class="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur">
                <span class="relative flex w-2 h-2">
                  <span class="absolute inline-flex w-full h-full rounded-full bg-rose-400 opacity-75 animate-ping"></span>
                  <span class="relative inline-flex w-2 h-2 rounded-full bg-rose-500"></span>
                </span>
                <span class="text-xs font-semibold text-white/70">
                  지금 이 순간 <span id="live-search-count" class="text-rose-400 tabular-nums font-extrabold">2,847</span>명이 "<span id="live-search-kw" class="text-gradient-aurora">강남 임플란트</span>"
                </span>
              </div>

              <h1 class="text-display-md md:text-display-xl lg:text-display-2xl tracking-[-0.05em] leading-[0.95]">
                <span class="block text-white">광고 없이</span>
                <span class="block">
                  <span class="text-gradient-dark">구글에서</span>
                </span>
                <span class="block text-white">1위가 되는 법<span class="text-gradient-aurora">.</span></span>
              </h1>

              <p class="mt-8 text-base md:text-lg lg:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto font-medium">
                URL 하나만 넣으세요. <span class="text-white">구글 한국</span>에서 우리 병원이 어떤 키워드로 몇 위인지,<br class="hidden md:block" />
                경쟁사가 어디로 환자를 데려가는지 <b class="text-white">10초 안에</b> 보여드립니다.
              </p>
            </div>

            {/* 글로우 인풋 박스 (다크 글래스) */}
            <form id="scan-form" class="mt-12 max-w-2xl mx-auto reveal" onsubmit="return window.__submitScan && window.__submitScan(event)">
              <div class="aurora-ring input-dark-glow rounded-2xl p-2 flex flex-col md:flex-row gap-2">
                <div class="flex-1 flex items-center gap-3 px-4">
                  <i class="fas fa-globe text-white/40"></i>
                  <input id="scan-url" type="text" autocomplete="off" autocapitalize="off" spellcheck={false} placeholder="example-hospital.com" class="w-full py-3.5 text-base md:text-lg outline-none bg-transparent text-white placeholder:text-white/30 font-medium" />
                  <i id="input-check-icon" class="fas fa-circle-check text-accent text-lg opacity-0 scale-50 transition-all duration-300"></i>
                </div>
                <button type="submit" class="magnetic btn-shine group py-3.5 px-7 rounded-xl bg-gradient-to-br from-brand via-iris-500 to-brand-600 hover:shadow-glow-brand-lg text-white font-semibold text-base md:text-lg shadow-glow-brand transition-all duration-300 whitespace-nowrap">
                  <i class="fas fa-bolt mr-2 group-hover:scale-110 transition"></i>
                  <span>10초 진단</span>
                </button>
              </div>
              <div id="scan-error" class="hidden mt-3 text-sm text-rose-400 text-center"></div>
              <p class="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs md:text-sm text-white/50">
                <span class="inline-flex items-center gap-1.5"><i class="fas fa-credit-card text-white/30"></i> 카드 등록 불필요</span>
                <span class="inline-flex items-center gap-1.5"><i class="fas fa-user-shield text-white/30"></i> 회원가입 X</span>
                <span class="inline-flex items-center gap-1.5"><i class="fas fa-stopwatch text-white/30"></i> 평균 9.4초</span>
              </p>
              <div class="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span class="text-white/40 mr-1">예시:</span>
                {['bdbddc.com', 'snubidc.com'].map((d) => (
                  <button type="button" class="example-domain group px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur hover:bg-white/[0.08] hover:border-white/20 hover:text-white text-white/70 transition" data-domain={d}>
                    <i class="fas fa-link text-[9px] mr-1.5 opacity-50 group-hover:opacity-100"></i>
                    {d}
                  </button>
                ))}
              </div>
            </form>

            {/* ============ Bento Grid 6칸 (Apple/Linear 스타일) ============ */}
            <div class="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 reveal">
              {/* [1] Live SERP simulation - 큰 카드 */}
              <div class="bento-card md:col-span-2 lg:col-span-3 lg:row-span-2 rounded-3xl p-6 md:p-7 group">
                <div class="flex items-center justify-between mb-5">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span class="ml-2 text-[11px] font-mono text-white/50">google.co.kr/search?q=<span id="typing-keyword" class="text-accent typing-cursor">홍성 라미네이트</span></span>
                  </div>
                  <span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-accent/15 text-accent font-bold">
                    <span class="w-1 h-1 rounded-full bg-accent animate-pulse"></span>LIVE
                  </span>
                </div>

                <div class="grid grid-cols-4 gap-2 mb-5">
                  <div class="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
                    <div class="text-[10px] text-accent/80 font-medium">발견</div>
                    <div class="mt-0.5 text-2xl md:text-3xl font-extrabold text-white tabular-nums">45</div>
                  </div>
                  <div class="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div class="text-[10px] text-white/50 font-medium">후보</div>
                    <div class="mt-0.5 text-2xl md:text-3xl font-extrabold text-white tabular-nums">200</div>
                  </div>
                  <div class="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div class="text-[10px] text-white/50 font-medium">URL</div>
                    <div class="mt-0.5 text-2xl md:text-3xl font-extrabold text-white tabular-nums">706</div>
                  </div>
                  <div class="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div class="text-[10px] text-white/50 font-medium">비용</div>
                    <div class="mt-0.5 text-2xl md:text-3xl font-extrabold text-white tabular-nums">$2.5</div>
                  </div>
                </div>

                <div class="rounded-xl bg-black/20 border border-white/5 overflow-hidden">
                  <div class="px-4 py-2 bg-white/[0.02] text-[10px] font-semibold text-white/50 flex justify-between items-center border-b border-white/5">
                    <span><i class="fas fa-map-marker-alt text-accent mr-1.5"></i>지역×진료 롱테일 TOP</span>
                    <span class="text-white/30 font-mono">실측 SERP</span>
                  </div>
                  <ul class="divide-y divide-white/5">
                    {[
                      { rank: 1, kw: '홍성 라미네이트', tone: 'accent' },
                      { rank: 1, kw: '당진 인비절라인', tone: 'accent' },
                      { rank: 1, kw: '예산 인비절라인', tone: 'accent' },
                      { rank: 3, kw: '연기 치과', tone: 'brand' },
                      { rank: 4, kw: '아산 라미네이트', tone: 'brand' },
                    ].map((k) => (
                      <li class="serp-card flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.02] transition">
                        <span class={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold tabular-nums ${k.tone === 'accent' ? 'bg-gradient-to-br from-accent to-emerald-600 text-white shadow-md shadow-accent/40' : 'bg-brand/20 text-brand-200 border border-brand/30'}`}>
                          {k.rank}
                        </span>
                        <span class="flex-1 font-semibold text-white/90 truncate">{k.kw}</span>
                        <i class="fas fa-arrow-up-right-from-square text-white/20 text-xs"></i>
                      </li>
                    ))}
                  </ul>
                  <div class="px-4 py-2 bg-white/[0.02] text-center text-[10px] text-white/50">
                    외 <b class="text-white">40개</b> 발견 · 모두 광고비 0원 자산
                  </div>
                </div>
              </div>

              {/* [2] 3D 데이터 큐브 */}
              <div class="bento-card lg:col-span-3 rounded-3xl p-6 relative overflow-hidden">
                <div class="absolute inset-0 stars-grid opacity-50 pointer-events-none"></div>
                <div class="relative">
                  <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">
                    <i class="fas fa-cube text-accent mr-1.5"></i>실시간 데이터 메시
                  </div>
                  <div class="text-xl md:text-2xl font-extrabold text-white mb-1">전국 250개 시·군 매트릭스</div>
                  <div class="text-xs text-white/50">DataForSEO · GSC · Sitemap 3중 데이터</div>
                </div>
                <div class="my-6 flex justify-center" style="perspective: 1000px;">
                  <div class="data-cube">
                    <div class="cube-face front">홍성 #1</div>
                    <div class="cube-face back">당진 #1</div>
                    <div class="cube-face right">예산 #1</div>
                    <div class="cube-face left">연기 #3</div>
                    <div class="cube-face top">아산 #4</div>
                    <div class="cube-face bottom">서산 #1</div>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div><div class="text-lg font-extrabold text-white tabular-nums">250</div><div class="text-[10px] text-white/40">시·군</div></div>
                  <div><div class="text-lg font-extrabold text-white tabular-nums">10</div><div class="text-[10px] text-white/40">진료과</div></div>
                  <div><div class="text-lg font-extrabold text-accent tabular-nums">2,500</div><div class="text-[10px] text-white/40">매트릭스</div></div>
                </div>
              </div>

              {/* [3] 라이브 활동 피드 */}
              <div class="bento-card lg:col-span-2 rounded-3xl p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                    <i class="fas fa-tower-broadcast text-accent mr-1.5"></i>실시간 진단 피드
                  </div>
                  <span class="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>LIVE
                  </span>
                </div>
                <ul id="live-activity-feed" class="space-y-2.5 text-sm">
                  <li class="live-feed-row flex items-center gap-2.5 text-white/70" style="animation-delay: 0.1s;">
                    <span class="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <span class="text-xs"><b class="text-white">강남 ⨯ 치과</b> · 47개 키워드 발견</span>
                  </li>
                  <li class="live-feed-row flex items-center gap-2.5 text-white/70" style="animation-delay: 0.4s;">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-300 shrink-0"></span>
                    <span class="text-xs"><b class="text-white">홍대 ⨯ 한의원</b> · 23개 롱테일</span>
                  </li>
                  <li class="live-feed-row flex items-center gap-2.5 text-white/70" style="animation-delay: 0.7s;">
                    <span class="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <span class="text-xs"><b class="text-white">분당 ⨯ 안과</b> · TOP 3 진입</span>
                  </li>
                  <li class="live-feed-row flex items-center gap-2.5 text-white/70" style="animation-delay: 1.0s;">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    <span class="text-xs"><b class="text-white">청담 ⨯ 피부과</b> · 백링크 +12</span>
                  </li>
                </ul>
              </div>

              {/* [4] KPI 카드 - 광고비 0원 */}
              <div class="bento-card rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <i class="fas fa-trophy text-accent text-2xl mb-3"></i>
                  <div class="text-3xl md:text-4xl font-extrabold text-white tabular-nums leading-none">
                    <span class="counter" data-target="45">0</span>
                  </div>
                  <div class="mt-1 text-xs text-white/50 font-bold">개 1위 · 광고비 0원</div>
                </div>
                <div class="mt-4 text-[10px] text-accent/80 font-semibold">
                  <i class="fas fa-arrow-up text-[8px]"></i> 평균 +37% 신규 발견
                </div>
              </div>

              {/* [5] KPI 카드 - 9.4초 */}
              <div class="bento-card rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <i class="fas fa-bolt text-brand-300 text-2xl mb-3"></i>
                  <div class="text-3xl md:text-4xl font-extrabold text-white tabular-nums leading-none">
                    <span class="counter" data-target="9.4">0</span><span class="text-white/40">초</span>
                  </div>
                  <div class="mt-1 text-xs text-white/50 font-bold">평균 응답 속도</div>
                </div>
                <div class="mt-4 text-[10px] text-brand-300 font-semibold">
                  <i class="fas fa-stopwatch text-[8px]"></i> 실측 SERP TOP 100
                </div>
              </div>
            </div>

            {/* 신뢰 마퀴 — 무한 스크롤 (다크) */}
            <div class="mt-20 md:mt-24 reveal">
              <div class="text-center text-xs uppercase tracking-[0.25em] text-white/40 font-semibold mb-6">
                <i class="fas fa-circle-check text-accent mr-1.5"></i>전국 1,847개 병원이 사용 중
              </div>
              <div class="marquee-mask overflow-hidden">
                <div class="marquee flex gap-3 w-max">
                  {[...Array(2)].map(() => (
                    <>
                      {[
                        { ic: 'fa-tooth', t: '치과', n: '서울 ⨯ 강남' },
                        { ic: 'fa-hand-holding-medical', t: '한의원', n: '부산 ⨯ 해운대' },
                        { ic: 'fa-eye', t: '안과', n: '대전 ⨯ 둔산' },
                        { ic: 'fa-bone', t: '정형외과', n: '광주 ⨯ 봉선' },
                        { ic: 'fa-syringe', t: '피부과', n: '인천 ⨯ 송도' },
                        { ic: 'fa-heart-pulse', t: '내과', n: '대구 ⨯ 수성' },
                        { ic: 'fa-baby', t: '산부인과', n: '세종 ⨯ 나성' },
                        { ic: 'fa-stethoscope', t: '성형외과', n: '울산 ⨯ 삼산' },
                        { ic: 'fa-ear-listen', t: '이비인후과', n: '제주 ⨯ 노형' },
                        { ic: 'fa-child', t: '소아과', n: '수원 ⨯ 영통' },
                      ].map((c) => (
                        <div class="shrink-0 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] backdrop-blur border border-white/10">
                          <span class="w-6 h-6 rounded-md bg-gradient-to-br from-brand/20 to-accent/20 flex items-center justify-center text-brand-300">
                            <i class={`fas ${c.ic} text-[10px]`}></i>
                          </span>
                          <span class="text-xs font-bold text-white">{c.t}</span>
                          <span class="text-[10px] text-white/50">{c.n}</span>
                          <span class="inline-flex items-center gap-1 text-[9px] font-semibold text-accent">
                            <span class="w-1 h-1 rounded-full bg-accent animate-pulse"></span>완료
                          </span>
                        </div>
                      ))}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 하단 페이드 — hero → live-demo 자연스러운 연결 (다크 → 라이트) */}
          <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none"></div>

          <div id="loading-overlay" class="hidden fixed inset-0 z-50 bg-[#0A0E1F]/95 backdrop-blur-md flex items-center justify-center">
            <div class="max-w-md w-full px-6 text-center">
              <div class="relative w-24 h-24 mx-auto">
                <div class="absolute inset-0 rounded-full border-4 border-white/10"></div>
                <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
                <div class="absolute inset-2 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white">
                  <i class="fas fa-arrow-trend-up text-xl"></i>
                </div>
              </div>
              <h3 class="mt-7 text-2xl font-extrabold text-white">진단 중입니다</h3>
              <p id="loading-message" class="mt-2 text-white/60">구글 색인에서 키워드 긁는 중...</p>
              <div class="mt-7 space-y-2 text-sm text-white/40">
                <div class="flex items-center justify-center gap-2"><i class="fas fa-check text-accent"></i> URL 검증</div>
                <div class="flex items-center justify-center gap-2" id="step-2"><i class="far fa-circle"></i> 구글 색인 조회</div>
                <div class="flex items-center justify-center gap-2" id="step-3"><i class="far fa-circle"></i> 의료 키워드 매칭</div>
                <div class="flex items-center justify-center gap-2" id="step-4"><i class="far fa-circle"></i> 랭킹 데이터 정리</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== 라이브 데모 ============== */}
        <section id="live-demo" class="relative max-w-6xl mx-auto px-5 py-20 md:py-24">
          <div class="grid lg:grid-cols-12 gap-10 items-center">
            <div class="lg:col-span-5 reveal">
              <div class="eyebrow">
                <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                LIVE 실제 결과
              </div>
              <h2 class="mt-4 text-3xl md:text-4xl font-extrabold text-ink-900 leading-tight">
                <span class="text-gradient-brand">"홍성 라미네이트 #1"</span><br />
                네이버 도구는 절대 못 찾는 <br class="hidden md:block" />
                지역×진료 롱테일.
              </h2>
              <p class="mt-5 text-ink-600 leading-relaxed">
                기존 SEO 도구들은 검색량 DB에 등록된 키워드만 봅니다.
                "홍성 라미네이트" 처럼 <b class="text-ink-900">실제로 환자가 검색하지만 DB에 없는 시·군 단위 롱테일</b>을
                Sitemap 역추적 + 한국 250개 지역 매트릭스로 직접 찾아냅니다.
              </p>
              <ul class="mt-6 space-y-2.5 text-sm text-ink-700">
                <li class="flex gap-2.5"><i class="fas fa-circle-check text-accent mt-1"></i><span>706개 URL을 sitemap.xml에서 자동 파싱</span></li>
                <li class="flex gap-2.5"><i class="fas fa-circle-check text-accent mt-1"></i><span>200개 후보 키워드를 실제 Google에서 SERP 측정</span></li>
                <li class="flex gap-2.5"><i class="fas fa-circle-check text-accent mt-1"></i><span>광고 한 푼 안 쓴 1위 자산을 가시화</span></li>
              </ul>
              <a href="#diagnose" class="mt-7 inline-flex items-center gap-2 text-brand font-semibold hover:gap-3 transition">
                내 사이트로 똑같이 해보기 <i class="fas fa-arrow-right text-xs"></i>
              </a>
            </div>

            <div class="lg:col-span-7 reveal">
              <div class="rounded-2xl overflow-hidden border border-ink-200 shadow-card-hover bg-white">
                <div class="px-4 py-3 bg-ink-50 border-b border-ink-200 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-300"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-300"></span>
                  <div class="ml-3 flex-1 px-3 py-1 rounded-md bg-white border border-ink-200 text-xs text-ink-500 font-mono truncate">
                    patientrank.kr/result/4 · bdbddc.com 롱테일 발견 결과
                  </div>
                  <span class="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent-600 font-semibold">실제 데이터</span>
                </div>
                <div class="p-5 md:p-6">
                  <div class="grid grid-cols-4 gap-2 md:gap-3 mb-5">
                    <div class="p-3 md:p-4 rounded-xl bg-gradient-to-br from-accent to-emerald-600 text-white">
                      <div class="text-[10px] md:text-xs text-emerald-100">발견</div>
                      <div class="mt-1 text-2xl md:text-3xl font-extrabold tabular-nums">45</div>
                    </div>
                    <div class="p-3 md:p-4 rounded-xl bg-ink-50">
                      <div class="text-[10px] md:text-xs text-ink-500">후보</div>
                      <div class="mt-1 text-2xl md:text-3xl font-extrabold text-ink-900 tabular-nums">200</div>
                    </div>
                    <div class="p-3 md:p-4 rounded-xl bg-ink-50">
                      <div class="text-[10px] md:text-xs text-ink-500">URL</div>
                      <div class="mt-1 text-2xl md:text-3xl font-extrabold text-ink-900 tabular-nums">706</div>
                    </div>
                    <div class="p-3 md:p-4 rounded-xl bg-ink-50">
                      <div class="text-[10px] md:text-xs text-ink-500">비용</div>
                      <div class="mt-1 text-2xl md:text-3xl font-extrabold text-ink-900 tabular-nums">$2.5</div>
                    </div>
                  </div>

                  <div class="rounded-xl border border-ink-200 overflow-hidden">
                    <div class="px-4 py-2.5 bg-ink-50 text-xs font-semibold text-ink-600 flex justify-between">
                      <span><i class="fas fa-map-marker-alt text-accent mr-1.5"></i>지역×진료 롱테일 TOP</span>
                      <span class="text-ink-400">실측 SERP</span>
                    </div>
                    <ul class="divide-y divide-ink-100 text-sm">
                      {[
                        { rank: 1, kw: '홍성 라미네이트', src: 'sitemap', tone: 'accent' },
                        { rank: 1, kw: '당진 인비절라인', src: 'sitemap', tone: 'accent' },
                        { rank: 1, kw: '예산 인비절라인', src: 'sitemap', tone: 'accent' },
                        { rank: 1, kw: '서산 인비절라인', src: 'sitemap', tone: 'accent' },
                        { rank: 3, kw: '연기 치과', src: 'sitemap', tone: 'brand' },
                        { rank: 4, kw: '아산 라미네이트', src: 'sitemap', tone: 'brand' },
                        { rank: 8, kw: '당진 임플란트', src: 'sitemap', tone: 'brand' },
                      ].map((k) => (
                        <li class="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50/50 transition">
                          <span class={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold tabular-nums ${k.tone === 'accent' ? 'bg-accent text-white' : 'bg-brand-50 text-brand'}`}>
                            {k.rank}
                          </span>
                          <span class="flex-1 font-semibold text-ink-900 truncate">{k.kw}</span>
                          <span class="hidden sm:inline px-2 py-0.5 rounded bg-ink-100 text-ink-500 text-[10px] font-mono uppercase">{k.src}</span>
                          <i class="fas fa-arrow-up-right-from-square text-ink-300 text-xs"></i>
                        </li>
                      ))}
                    </ul>
                    <div class="px-4 py-2.5 bg-ink-50/60 text-center text-xs text-ink-500">
                      외 38개 발견 · 모두 광고비 0원 자산
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== 마퀴 신뢰 띠 ============== */}
        <section class="relative py-10 bg-gradient-to-b from-white to-ink-50/40 border-y border-ink-100 overflow-hidden">
          <div class="max-w-7xl mx-auto px-5 mb-5 text-center">
            <span class="text-xs font-semibold uppercase tracking-widest text-ink-400">
              <i class="fas fa-stethoscope mr-1.5 text-brand"></i>
              전국 6,000+ 원장님이 검증한 의료 키워드 사전
            </span>
          </div>
          <div class="marquee-mask">
            <div class="marquee-track whitespace-nowrap">
              {[
                ...['치과', '한의원', '피부과', '성형외과', '안과', '정형외과', '이비인후과', '산부인과', '내과', '소아과', '통증의학과', '비뇨의학과'],
                ...['치과', '한의원', '피부과', '성형외과', '안과', '정형외과', '이비인후과', '산부인과', '내과', '소아과', '통증의학과', '비뇨의학과'],
              ].map((s, i) => (
                <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-ink-200 shadow-sm text-sm font-semibold text-ink-700 shrink-0">
                  <i class={`fas ${i % 4 === 0 ? 'fa-tooth text-brand' : i % 4 === 1 ? 'fa-mortar-pestle text-accent' : i % 4 === 2 ? 'fa-hand-holding-medical text-purple-500' : 'fa-stethoscope text-rose-500'}`}></i>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============== 신뢰 (원장님 자산) ============== */}
        <section id="trust" class="relative bg-gradient-to-b from-white via-brand-50/30 to-white border-y border-ink-100">
          <a id="why-us" class="absolute -top-20" aria-hidden="true"></a>
          <div class="max-w-6xl mx-auto px-5 py-20 md:py-28">
            <div class="text-center max-w-2xl mx-auto reveal">
              <div class="eyebrow">
                <i class="fas fa-user-doctor text-[10px]"></i>
                만든 사람
              </div>
              <h2 class="mt-4 text-3xl md:text-4xl font-extrabold text-ink-900">
                마케터가 아니라, <span class="text-gradient-brand">현직 대표원장이 만들었습니다</span>
              </h2>
              <p class="mt-4 text-ink-600 leading-relaxed">
                광고대행사가 만든 도구는 광고를 더 사게 합니다.<br class="hidden md:block" />
                저는 광고비를 자르려고 만들었습니다.
              </p>
            </div>

            <div class="mt-14 grid lg:grid-cols-12 gap-8 items-stretch">
              <div class="lg:col-span-5 reveal">
                <div class="h-full p-7 md:p-9 rounded-3xl bg-white border border-ink-200 shadow-card relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand/10 to-accent/10 blur-3xl rounded-full"></div>
                  <div class="relative">
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white text-2xl font-extrabold shadow-glow-brand">
                        문
                      </div>
                      <div>
                        <div class="text-xl font-extrabold text-ink-900">문석준 대표원장</div>
                        <div class="text-sm text-ink-500">서울비디치과 · 페이션트퍼널 창립자</div>
                      </div>
                    </div>

                    <ul class="mt-7 space-y-3 text-sm text-ink-700">
                      <li class="flex gap-2.5"><i class="fas fa-graduation-cap text-brand mt-1 w-4"></i><span>서울대학교 치의학과 / 치의학대학원 석사</span></li>
                      <li class="flex gap-2.5"><i class="fas fa-certificate text-brand mt-1 w-4"></i><span>통합치의학과 전문의</span></li>
                      <li class="flex gap-2.5"><i class="fas fa-hospital text-brand mt-1 w-4"></i><span>서울비디치과 대표원장 (400평, 6개 수술실)</span></li>
                      <li class="flex gap-2.5"><i class="fas fa-chalkboard-user text-brand mt-1 w-4"></i><span>페이션트퍼널 — 6,000명+ 원장 교육 수료</span></li>
                    </ul>

                    <div class="mt-7 p-5 rounded-2xl bg-gradient-to-br from-ink-50 to-white border border-ink-200">
                      <div class="flex items-baseline justify-between mb-3">
                        <span class="text-xs text-ink-500">서울비디치과 매출 성장</span>
                        <span class="text-xs font-semibold text-accent">200배 ↑</span>
                      </div>
                      <div class="flex items-end gap-1.5 h-20">
                        {[8, 12, 18, 25, 36, 50, 68, 85, 95, 100].map((h, i) => (
                          <div class="flex-1 rounded-t bg-gradient-to-t from-brand to-accent reveal-bar" style={`height: ${h}%; animation-delay: ${i * 60}ms`}></div>
                        ))}
                      </div>
                      <div class="mt-3 flex justify-between text-xs text-ink-500">
                        <span>월 6천만원</span>
                        <span class="font-semibold text-ink-900">→ 연 120억원</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-7 reveal">
                <div class="grid md:grid-cols-2 gap-5 h-full">
                  {[
                    { icon: 'fa-stethoscope', title: '환자 경험 설계', desc: '환자가 병원을 인지하는 순간부터 지인 소개까지의 10단계 여정을 데이터로 설계합니다. 광고가 아니라 시스템으로 환자를 모십니다.' },
                    { icon: 'fa-magnifying-glass-chart', title: '데이터 기반 운영', desc: '직감 대신 숫자. SEO 키워드, 상담 전환율, 재내원율을 매주 추적해 의사결정 합니다.' },
                    { icon: 'fa-heart-pulse', title: '왜 만들었나', desc: '"필요한 진료를 받지 못하는 사람이 없도록 하자". 광고비에 치이는 원장님들이 자기 환자에게 가닿기 위한 인프라를 만듭니다.' },
                    { icon: 'fa-shield-halved', title: '광고가 아닌 자산', desc: '광고는 끄면 사라지지만, SEO 1위는 자산입니다. 그래서 측정·추적·복리화가 가능한 도구를 직접 만들었습니다.' },
                  ].map((c) => (
                    <div class="spotlight card-v3 p-6">
                      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-iris-500/10 text-brand flex items-center justify-center mb-4">
                        <i class={`fas ${c.icon}`}></i>
                      </div>
                      <h3 class="font-extrabold text-ink-900 text-lg">{c.title}</h3>
                      <p class="mt-2 text-sm text-ink-600 leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== 비교표 ============== */}
        <section id="comparison" class="max-w-6xl mx-auto px-5 py-20 md:py-24">
          <div class="text-center max-w-2xl mx-auto reveal">
            <div class="eyebrow">
              <i class="fas fa-scale-balanced text-[10px]"></i>
              비교
            </div>
            <h2 class="mt-4 text-3xl md:text-4xl font-extrabold text-ink-900">
              왜 네이버가 아니라 <span class="text-gradient-brand">구글</span>인가?
            </h2>
            <p class="mt-4 text-ink-600">AI 검색은 전부 구글 색인 기반입니다. 네이버는 한국 안에서만 갇힙니다.</p>
          </div>

          <div class="mt-12 overflow-x-auto reveal">
            <div class="min-w-[720px] grid grid-cols-4 gap-0 rounded-2xl border border-ink-200 bg-white overflow-hidden shadow-card">
              <div class="bg-ink-50 p-5 text-xs font-semibold text-ink-500 uppercase tracking-wider"></div>
              <div class="bg-ink-50 p-5 text-center">
                <div class="text-xs text-ink-500">전통 방식</div>
                <div class="font-extrabold text-ink-900 text-lg">네이버 광고</div>
              </div>
              <div class="bg-ink-50 p-5 text-center">
                <div class="text-xs text-ink-500">전통 SEO 도구</div>
                <div class="font-extrabold text-ink-900 text-lg">Ahrefs · Semrush</div>
              </div>
              <div class="bg-gradient-to-br from-brand to-brand-700 p-5 text-center text-white">
                <div class="text-xs text-brand-100">신세대</div>
                <div class="font-extrabold text-white text-lg">Patient Rank</div>
              </div>

              {[
                { label: '월 비용', n: '300~3,000만원', a: '€99~$449', p: '월 1,450원~' },
                { label: '한국어 의료 키워드', n: '✓', a: '△ (영문 위주)', p: '✓ 의료 특화' },
                { label: '"홍성 라미네이트" 류', n: '×', a: '× DB 없음', p: '✓ Sitemap 역추적' },
                { label: 'AI 검색 노출 측정', n: '×', a: '×', p: '✓ Google = AI 색인' },
                { label: '광고 의존도', n: '100%', a: '0%', p: '0% (자산화)' },
                { label: '경쟁 병원 자동 분석', n: '×', a: '✓', p: '✓ 한국 의료 한정' },
                { label: '주간 카톡 알림', n: '×', a: '×', p: '✓' },
              ].map((row, i) => (
                <>
                  <div class={`p-4 md:p-5 text-sm font-semibold text-ink-700 ${i % 2 === 0 ? 'bg-white' : 'bg-ink-50/40'}`}>{row.label}</div>
                  <div class={`p-4 md:p-5 text-sm text-center text-ink-500 ${i % 2 === 0 ? 'bg-white' : 'bg-ink-50/40'}`}>{row.n}</div>
                  <div class={`p-4 md:p-5 text-sm text-center text-ink-500 ${i % 2 === 0 ? 'bg-white' : 'bg-ink-50/40'}`}>{row.a}</div>
                  <div class={`p-4 md:p-5 text-sm text-center font-semibold text-brand-700 ${i % 2 === 0 ? 'bg-brand-50/60' : 'bg-brand-50/30'}`}>{row.p}</div>
                </>
              ))}
            </div>
          </div>
        </section>

        {/* ============== 기능 6단 ============== */}
        <section id="features" class="bg-ink-50/50 border-y border-ink-100">
          <div class="max-w-6xl mx-auto px-5 py-20 md:py-24">
            <div class="text-center max-w-2xl mx-auto reveal">
              <div class="eyebrow">
                <i class="fas fa-bolt text-[10px]"></i>
                기능
              </div>
              <h2 class="mt-4 text-3xl md:text-4xl font-extrabold text-ink-900">
                원장님이 <span class="text-gradient-brand">진짜 필요한 것만</span>
              </h2>
              <p class="mt-4 text-ink-600">복잡한 SEO 도구는 안 만들었습니다. 의료기관 운영자 시각에서 핵심만.</p>
            </div>

            <div class="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: 'fa-link', color: 'from-brand to-brand-700', title: 'URL 하나로 끝', desc: '키워드 입력 0개. 병원 홈페이지 주소만 넣으면 구글에서 랭크된 모든 키워드를 역추적합니다.', badge: '평균 9.4초' },
                { icon: 'fa-satellite-dish', color: 'from-accent to-emerald-700', title: '롱테일 발견기', desc: 'sitemap.xml 700개+ URL 파싱 + 한국 250개 시·군·구 매트릭스로 "홍성 라미네이트" 같은 숨은 1위를 발굴.', badge: '독점 기술' },
                { icon: 'fa-bell', color: 'from-amber-500 to-amber-700', title: '주간 카톡 알림', desc: '월요일 오전 9시. 급상승·급하락·신규 진입·이탈 4카테고리로 정리해서 발송.', badge: 'Basic+' },
                { icon: 'fa-chart-column', color: 'from-indigo-500 to-indigo-700', title: '경쟁 병원 갭 분석', desc: '동일 상권 경쟁 병원이 랭크하는 키워드 중, 우리만 없는 갭 키워드를 자동 추출.', badge: 'Pro+' },
                { icon: 'fa-link', color: 'from-rose-500 to-rose-700', title: '백링크 · 도메인 권위', desc: '어떤 사이트가 살아있는 링크로 권위를 흘려보내는지, 경쟁사는 어디서 받는지 추적.', badge: 'Pro+' },
                { icon: 'fa-arrow-up-right-from-square', color: 'from-purple-500 to-purple-700', title: 'GSC 연동', desc: 'Google Search Console OAuth 연결. 노출됐지만 우리가 못 찾은 키워드까지 100% 캐치.', badge: 'Premium' },
              ].map((f) => (
                <div class="spotlight card-v3 group relative p-6">
                  <div class={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-md mb-5`}>
                    <i class={`fas ${f.icon}`}></i>
                  </div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <h3 class="text-lg font-extrabold text-ink-900">{f.title}</h3>
                    <span class="shrink-0 px-2 py-0.5 rounded-md bg-ink-100 text-ink-600 text-[10px] font-semibold">{f.badge}</span>
                  </div>
                  <p class="text-sm text-ink-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============== 동작 원리 ============== */}
        <section id="how" class="max-w-6xl mx-auto px-5 py-20 md:py-24">
          <div class="text-center max-w-2xl mx-auto reveal">
            <div class="eyebrow">
              <i class="fas fa-cogs text-[10px]"></i>
              동작 원리
            </div>
            <h2 class="mt-4 text-3xl md:text-4xl font-extrabold text-ink-900">
              구글 색인 → AI 검색까지, <br class="hidden md:block" />
              <span class="text-gradient-brand">한 번에 측정</span>
            </h2>
          </div>

          <div class="mt-14 grid md:grid-cols-4 gap-5 reveal">
            {[
              { n: '01', title: 'URL 입력', desc: '병원 홈페이지 주소 하나만. 회원가입 없이 바로 진단.', icon: 'fa-keyboard' },
              { n: '02', title: '구글 색인 추적', desc: 'DataForSEO Labs API로 TOP100 (옵션 TOP500) 랭킹 키워드 일괄 조회.', icon: 'fa-satellite-dish' },
              { n: '03', title: '롱테일 발굴', desc: 'sitemap 역추적 + 250개 지역 매트릭스로 검색량 DB 밖 키워드까지.', icon: 'fa-radar' },
              { n: '04', title: '리포트 + 모니터링', desc: '경쟁사 갭, 백링크, 주간 알림까지 자동 생성.', icon: 'fa-clipboard-list' },
            ].map((s, i) => (
              <div class="relative">
                {i < 3 && <div class="hidden md:block absolute top-12 left-full w-full h-0.5 -translate-x-2 bg-gradient-to-r from-ink-200 to-transparent z-0"></div>}
                <div class="card-v3 relative p-6">
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-3xl font-extrabold text-ink-200 tabular-nums">{s.n}</span>
                    <span class="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center">
                      <i class={`fas ${s.icon}`}></i>
                    </span>
                  </div>
                  <h3 class="font-extrabold text-ink-900">{s.title}</h3>
                  <p class="mt-1.5 text-sm text-ink-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============== 가격 ============== */}
        <section id="pricing" class="relative bg-gradient-to-b from-ink-50/50 to-white border-t border-ink-100">
          <div class="max-w-6xl mx-auto px-5 py-20 md:py-24">
            <div class="text-center max-w-2xl mx-auto reveal">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warn/10 text-warn text-xs font-semibold animate-pulse-soft">
                <i class="fas fa-fire text-[10px]"></i>
                얼리버드 3개월 50%
              </div>
              <h2 class="mt-4 text-3xl md:text-4xl font-extrabold text-ink-900">
                월 <span class="text-gradient-brand">1,450원</span>부터
              </h2>
              <p class="mt-4 text-ink-600">런칭 3개월 한정 가격. 얼리버드 가입자는 6개월간 할인 유지합니다.</p>
            </div>

            <div class="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5 reveal">
              {[
                { name: 'Free', price: 0, desc: '체험용', features: ['도메인 1개', '월 3회 조회', '상위 20개 키워드 미리보기'], cta: '무료 시작', href: '#diagnose' },
                { name: 'Basic', price: 2900, early: 1450, desc: '소규모 1인 병원', features: ['도메인 1개', '월 30회 조회', '전체 키워드 공개', '주간 카톡 알림'], cta: '시작하기', href: '/pricing' },
                { name: 'Pro', price: 4900, early: 2450, desc: '성장 중인 병원', features: ['도메인 3개', '월 50회 조회', '경쟁사 갭 분석', '백링크 + 도메인 권위', '롱테일 200개/스캔'], cta: '시작하기', href: '/pricing', popular: true },
                { name: 'Premium', price: 9900, early: 4950, desc: 'GSC 연동 풀패키지', features: ['도메인 5개', '무제한 조회', 'GSC OAuth 연동', '롱테일 500개/스캔', '전화 컨설팅 1회'], cta: '문의하기', href: '/pricing' },
              ].map((p: any) => (
                <div class={`relative p-7 rounded-3xl ${p.popular ? 'border-2 border-transparent bg-gradient-to-br from-white via-brand-50/50 to-iris-500/5 shadow-glow-brand [background-clip:padding-box] ring-2 ring-brand/60 md:scale-[1.03]' : 'card-v3'} flex flex-col`}>
                  {p.popular && (
                    <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand via-iris-500 to-accent text-white text-xs font-bold shadow-md whitespace-nowrap">
                      <i class="fas fa-star mr-1"></i> 가장 인기
                    </div>
                  )}
                  <div class="text-xs text-ink-500 font-semibold uppercase tracking-wider">{p.desc}</div>
                  <div class="text-2xl font-extrabold text-ink-900 mt-1">{p.name}</div>
                  <div class="mt-5">
                    {p.early !== undefined ? (
                      <>
                        <div class="text-xs text-ink-400 line-through">월 {p.price.toLocaleString()}원</div>
                        <div class="flex items-baseline gap-1">
                          <span class="text-4xl font-extrabold text-ink-900 tabular-nums">{p.early.toLocaleString()}</span>
                          <span class="text-sm font-medium text-ink-500">원/월</span>
                        </div>
                      </>
                    ) : (
                      <div class="text-4xl font-extrabold text-ink-900">{p.price === 0 ? '무료' : `${p.price.toLocaleString()}원`}</div>
                    )}
                  </div>
                  <ul class="mt-6 space-y-2.5 text-sm text-ink-700 flex-1">
                    {p.features.map((f: string) => (
                      <li class="flex gap-2"><i class="fas fa-check-circle text-accent mt-0.5"></i><span>{f}</span></li>
                    ))}
                  </ul>
                  <a href={p.href} class={`btn-shine mt-7 block text-center py-3.5 rounded-xl font-bold text-sm transition ${p.popular ? 'bg-gradient-to-br from-brand via-iris-500 to-brand-600 text-white hover:shadow-glow-brand' : 'bg-ink-900 text-white hover:bg-ink-800'}`}>
                    {p.cta}
                  </a>
                </div>
              ))}
            </div>

            <div class="mt-10 text-center text-sm text-ink-500">
              <i class="fas fa-shield-halved mr-1"></i>
              7일 무조건 환불 보장 · 카드 등록은 결제 직전에만
            </div>
          </div>
        </section>

        {/* ============== FAQ ============== */}
        <section id="faq" class="max-w-4xl mx-auto px-5 py-20 md:py-24">
          <div class="text-center mb-12 reveal">
            <div class="eyebrow">
              <i class="fas fa-circle-question text-[10px]"></i>
              FAQ
            </div>
            <h2 class="mt-4 text-3xl md:text-4xl font-extrabold text-ink-900">자주 묻는 질문</h2>
            <p class="mt-3 text-ink-600">원장님들이 가장 많이 물으시는 것들</p>
          </div>

          <div class="space-y-3 reveal">
            {[
              { q: '내 사이트 데이터를 가져가나요?', a: 'URL과 공개된 색인 데이터(구글 SERP)만 조회합니다. 사이트 내부 코드/회원/EMR 정보는 일절 접근하지 않으며, GSC 연동도 100% 원장님 OAuth 토큰 기반이고 언제든 회수 가능합니다.' },
              { q: '"홍성 라미네이트" 같은 작은 키워드도 진짜 잡나요?', a: '네. 일반 SEO 도구는 검색량 DB에 키워드가 없으면 못 찾지만, 저희는 sitemap.xml의 URL 슬러그(/area/hongseong-laminate)를 직접 파싱해 한글로 역변환합니다. 실제 bdbddc.com에서 45개 롱테일을 모두 1~10위로 발견했고, 모두 광고비 0원 자산이었습니다.' },
              { q: 'DataForSEO 비용은 누가 부담하나요?', a: '저희가 부담합니다. 무료 플랜은 월 3회 TOP100 조회까지, Basic 이상은 롱테일 200개 풀스캔까지 모두 정액 요금에 포함됩니다.' },
              { q: 'GSC 연동을 안 해도 되나요?', a: '네. Free/Basic/Pro는 GSC 없이도 완전히 동작합니다. Premium 플랜의 GSC 연동은 "노출됐지만 SaaS가 못 찾은 키워드"까지 100% 잡고 싶은 원장님을 위한 옵션입니다.' },
              { q: '환불 되나요?', a: '결제 후 7일 이내 무조건 환불 보장입니다. 이메일(hello@patientrank.kr) 한 통이면 끝입니다. 위약금이나 사용량 차감 없습니다.' },
              { q: '광고대행사가 만든 다른 SEO 도구와 뭐가 달라요?', a: '광고대행사의 SEO 도구는 결국 "광고를 더 사세요"로 귀결됩니다. Patient Rank는 페이션트퍼널을 운영하는 현직 대표원장이 광고비를 자르려고 만든 도구라, 측정 항목 자체가 "광고가 아닌 자산"에 맞춰져 있습니다.' },
              { q: '치과 말고 다른 진료과목도 되나요?', a: '네. 한의원·피부과·성형외과·안과·정형외과·이비인후과·산부인과·내과·소아과·통증의학과까지 의료 키워드 사전이 내장되어 있습니다.' },
              { q: '계약 기간이나 약정이 있나요?', a: '월 단위 결제, 언제든 취소 가능합니다. 약정 없습니다.' },
            ].map((f, i) => (
              <details class="group rounded-2xl bg-white border border-ink-200 hover:border-ink-300 transition" open={i === 0}>
                <summary class="cursor-pointer px-5 md:px-6 py-4 md:py-5 flex items-center gap-3 font-semibold text-ink-900">
                  <span class="text-base md:text-lg">{f.q}</span>
                </summary>
                <div class="px-5 md:px-6 pb-5 md:pb-6 text-ink-600 leading-relaxed text-sm md:text-base border-t border-ink-100 pt-4">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ============== Final CTA ============== */}
        <section id="cta" class="relative">
          <div class="max-w-5xl mx-auto px-5 pb-20">
            <div class="relative overflow-hidden rounded-3xl hero-dark p-10 md:p-16 text-center text-white">
              <div class="absolute inset-0 stars-grid pointer-events-none"></div>
              <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand blur-3xl opacity-30"></div>
              <div class="absolute top-10 left-1/3 w-60 h-60 rounded-full bg-iris-500 blur-3xl opacity-20 animate-breathe"></div>
              <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-accent blur-3xl opacity-30"></div>
              <div class="relative">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs text-white/90 mb-6">
                  <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                  지금까지 1,847개 병원 진단 완료
                </div>
                <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight">
                  10초면 끝납니다.<br />
                  <span class="text-gradient-dark">우리 병원, 진짜 몇 위</span>일까요?
                </h2>
                <p class="mt-5 text-white/70 text-base md:text-lg">
                  카드 등록 X · 이메일 입력 X · 회원가입 X
                </p>
                <a href="#diagnose" class="magnetic btn-shine aurora-ring mt-8 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-ink-900 font-extrabold text-lg hover:scale-105 transition">
                  <i class="fas fa-bolt text-brand"></i>
                  무료 진단 받기
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script src="/static/landing.js"></script>
    </Layout>
  )
}
