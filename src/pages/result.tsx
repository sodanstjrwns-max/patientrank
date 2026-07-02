// 진단 결과 페이지 — 다크 프리미엄 SaaS 톤
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'
import type { ScanSummary, WeeklyDelta, AiActionGuide } from '../lib/types'
import type { PrescriptionReport, Prescription } from '../lib/content-prescription'
import { formatNumber } from '../lib/utils'
import { topSpecialties } from '../lib/medical-keywords'

// 처방 유형별 뱃지 메타
const RX_META: Record<string, { label: string; icon: string; badge: string }> = {
  quick_win:   { label: '퀵윈',        icon: 'fa-bolt',            badge: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300' },
  ctr_fix:     { label: '클릭 회수',   icon: 'fa-arrow-pointer',   badge: 'bg-amber-500/15 border-amber-400/30 text-amber-300' },
  gap_attack:  { label: '갭 공략',     icon: 'fa-crosshairs',      badge: 'bg-rose-500/15 border-rose-400/30 text-rose-300' },
  new_content: { label: '신규 콘텐츠', icon: 'fa-pen-nib',         badge: 'bg-brand/15 border-brand/30 text-brand-200' },
  defend:      { label: 'TOP3 승격',   icon: 'fa-shield-halved',   badge: 'bg-violet-500/15 border-violet-400/30 text-violet-300' },
}

// 콘텐츠 처방전 카드 1장
const RxCard: FC<{ rx: Prescription; idx: number; locked?: boolean }> = ({ rx, idx, locked }) => {
  const meta = RX_META[rx.type] || RX_META.new_content
  return (
    <article class={`relative rounded-2xl border border-white/10 bg-slate-950/50 p-5 ${locked ? 'select-none' : ''}`}>
      {locked && (
        <div class="absolute inset-0 z-10 rounded-2xl backdrop-blur-md bg-slate-950/40 flex items-center justify-center">
          <a href="/pricing" class="px-4 py-2 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-600 transition">
            <i class="fas fa-lock mr-1.5"></i>Basic 플랜으로 전체 처방 보기
          </a>
        </div>
      )}
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-extrabold text-white/80 text-sm">
          {idx + 1}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span class={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${meta.badge}`}>
              <i class={`fas ${meta.icon} mr-1 text-[9px]`}></i>{meta.label}
            </span>
            {rx.search_volume != null && rx.search_volume > 0 && (
              <span class="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 font-mono">
                검색량 {formatNumber(rx.search_volume)}/월
              </span>
            )}
            {rx.current_rank != null && (
              <span class="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 font-mono">
                현재 {rx.current_rank}위
              </span>
            )}
            {rx.impressions != null && (
              <span class="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 font-mono">
                노출 {formatNumber(rx.impressions)}회
              </span>
            )}
          </div>
          <h4 class="font-extrabold text-white text-base leading-snug break-keep">{rx.keyword}</h4>
          <p class="mt-1 text-sm text-white/70">{rx.headline}</p>
          <div class="mt-3 space-y-2 text-[13px]">
            <div class="flex gap-2">
              <i class="fas fa-clipboard-check text-brand-300 mt-0.5 flex-shrink-0"></i>
              <span class="text-white/80"><b class="text-white/95">할 일:</b> {rx.action}</span>
            </div>
            <div class="flex gap-2">
              <i class="fas fa-chart-line text-emerald-300 mt-0.5 flex-shrink-0"></i>
              <span class="text-white/70"><b class="text-white/90">기대 효과:</b> {rx.expected}</span>
            </div>
            <div class="flex gap-2">
              <i class="fas fa-lightbulb text-amber-300 mt-0.5 flex-shrink-0"></i>
              <span class="text-white/70"><b class="text-white/90">추천 주제:</b> {rx.content_idea}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

const FREE_VISIBLE_ROWS = 20
const FREE_BACKLINK_ROWS = 5
const FREE_GAP_ROWS = 3
const FREE_KWGAP_ROWS = 5

// SEO Grade 계산 (A+ ~ F)
function calcSeoGrade(scan: ScanSummary): {
  grade: string
  score: number
  color: string
  label: string
  bgGradient: string
  ringColor: string
} {
  const top3 = scan.top3_count || 0
  const top10 = scan.top10_count || 0
  const top30 = scan.top30_count || 0
  const total = scan.keyword_count || 0
  const dr = scan.backlink_summary?.domain_rank || 0
  const refDomains = scan.backlink_summary?.referring_domains || 0

  // 점수 계산 (0-100)
  let score = 0
  score += Math.min(top3 * 4, 25)              // TOP 3: 최대 25점
  score += Math.min(top10 * 1.5, 20)           // TOP 10: 최대 20점
  score += Math.min(top30 * 0.4, 15)           // TOP 30: 최대 15점
  score += Math.min(total * 0.15, 15)          // 총 키워드: 최대 15점
  score += Math.min(dr * 0.15, 15)             // DR: 최대 15점
  score += Math.min(refDomains * 0.5, 10)      // 리퍼링: 최대 10점
  score = Math.round(Math.min(score, 100))

  if (score >= 85) return { grade: 'A+', score, color: 'text-emerald-300', label: '구글 SEO 최상위', bgGradient: 'from-emerald-500/20 via-accent/10 to-transparent', ringColor: 'ring-emerald-400/40' }
  if (score >= 70) return { grade: 'A',  score, color: 'text-accent',       label: '우수한 SEO 상태',  bgGradient: 'from-accent/20 via-emerald-500/10 to-transparent', ringColor: 'ring-accent/40' }
  if (score >= 55) return { grade: 'B',  score, color: 'text-brand-300',    label: '평균 이상',         bgGradient: 'from-brand/20 via-brand-500/10 to-transparent', ringColor: 'ring-brand/40' }
  if (score >= 40) return { grade: 'C',  score, color: 'text-amber-300',    label: '개선 필요',         bgGradient: 'from-amber-500/20 via-yellow-500/10 to-transparent', ringColor: 'ring-amber-400/40' }
  if (score >= 25) return { grade: 'D',  score, color: 'text-orange-300',   label: '심각한 부족',       bgGradient: 'from-orange-500/20 via-amber-500/10 to-transparent', ringColor: 'ring-orange-400/40' }
  return { grade: 'F', score, color: 'text-rose-400', label: '구글 노출 사실상 0', bgGradient: 'from-rose-500/20 via-red-500/10 to-transparent', ringColor: 'ring-rose-400/40' }
}

// 핵심 인사이트 3줄 자동 생성
function buildInsights(scan: ScanSummary): { icon: string; tone: 'good' | 'warn' | 'bad'; text: string }[] {
  const out: { icon: string; tone: 'good' | 'warn' | 'bad'; text: string }[] = []
  const top3 = scan.top3_count || 0
  const top10 = scan.top10_count || 0
  const total = scan.keyword_count || 0
  const dr = scan.backlink_summary?.domain_rank || 0
  const lt = scan.longtail_keywords?.length || 0
  const gaps = scan.keyword_gaps?.length || 0
  const traffic = scan.estimated_traffic || 0

  // 1. 메인 상태
  if (total === 0) {
    out.push({ icon: 'fa-skull-crossbones', tone: 'bad', text: `구글 한국 TOP 100 안에 단 하나의 키워드도 없습니다. 사실상 검색 노출 0인 상태.` })
  } else if (top10 === 0) {
    out.push({ icon: 'fa-triangle-exclamation', tone: 'bad', text: `${total}개 키워드가 랭크돼 있지만 1페이지(TOP 10) 진입은 0개. 90% 이상 사용자에게 안 보임.` })
  } else if (top3 >= 5) {
    out.push({ icon: 'fa-trophy', tone: 'good', text: `TOP 3에 ${top3}개 키워드 노출 중. 월 ${traffic.toLocaleString()}명 자연 유입 예상되는 안정적 자산.` })
  } else {
    out.push({ icon: 'fa-chart-line', tone: 'warn', text: `TOP 10에 ${top10}개 진입 · TOP 3는 ${top3}개. 상위 노출을 ${Math.max(5, top3 + 3)}개까지 늘리면 트래픽 2~3배 가능.` })
  }

  // 2. 백링크/DR 상태
  if (dr === 0) {
    out.push({ icon: 'fa-link-slash', tone: 'bad', text: `도메인 권위(DR) 0 · 살아있는 백링크 0개. 구글이 "이 사이트 신뢰 못해"로 판단 중. 콘텐츠를 만들어도 상위 진입이 매우 어려움.` })
  } else if (dr < 20) {
    out.push({ icon: 'fa-shield-halved', tone: 'warn', text: `DR ${dr} · 백링크 자산 부족. 보도자료·기고·제휴로 권위 도메인 5개만 확보해도 전체 키워드 순위 +10 가능.` })
  } else if (dr >= 50) {
    out.push({ icon: 'fa-shield-check', tone: 'good', text: `DR ${dr} · 강한 백링크 자산 보유. 신규 콘텐츠도 빠르게 상위 진입 가능한 권위 보유 상태.` })
  } else {
    out.push({ icon: 'fa-shield', tone: 'warn', text: `DR ${dr} · 평균 수준 권위. 경쟁사 대비 갭 분석으로 추가 링크 기회 공략 가능.` })
  }

  // 3. 롱테일 / 갭 기회
  if (lt > 0) {
    out.push({ icon: 'fa-compass', tone: 'good', text: `지역×진료 롱테일 ${lt}개 발견 (DataForSEO DB 누락). 광고비 0원 자연 유입 자산 — 매주 모니터링하면 순위 보호 가능.` })
  } else if (gaps > 0) {
    out.push({ icon: 'fa-bullseye', tone: 'warn', text: `경쟁사가 잡은 ${gaps}개 키워드를 놓치고 있음. 상위 5개만 콘텐츠로 만들어도 즉시 트래픽 회수 가능.` })
  } else {
    out.push({ icon: 'fa-magnifying-glass-chart', tone: 'warn', text: `롱테일 스캔 미실행 · 지역 롱테일 키워드는 DataForSEO에 없는 숨겨진 자산입니다. 아래에서 무료 실행 가능.` })
  }

  return out
}

export const ResultPage: FC<{
  scan: ScanSummary
  viewer?: { id: number; email: string; is_admin: 0 | 1; plan: string } | null
  weeklyDelta?: WeeklyDelta | null
  actionGuide?: AiActionGuide | null
  prescriptions?: PrescriptionReport | null
}> = ({ scan, viewer, weeklyDelta, actionGuide, prescriptions }) => {
  // ADMIN 또는 Pro/Agency 플랜은 GSC 풀 액세스
  const isGscUnlocked = !!(viewer && (viewer.is_admin === 1 || viewer.plan === 'pro' || viewer.plan === 'agency'))
  const visibleKeywords = scan.is_gated ? scan.keywords.slice(0, FREE_VISIBLE_ROWS) : scan.keywords
  const hiddenKeywords = scan.is_gated ? scan.keywords.slice(FREE_VISIBLE_ROWS) : []
  const hiddenCount = hiddenKeywords.length
  const specs = topSpecialties(scan.keywords)

  const bls = scan.backlink_summary
  const bl = scan.backlinks || []
  const gap = scan.competitor_gap || []
  const visibleBacklinks = scan.is_gated ? bl.slice(0, FREE_BACKLINK_ROWS) : bl
  const hiddenBacklinks = scan.is_gated ? bl.slice(FREE_BACKLINK_ROWS) : []
  const visibleGap = scan.is_gated ? gap.slice(0, FREE_GAP_ROWS) : gap
  const hiddenGap = scan.is_gated ? gap.slice(FREE_GAP_ROWS) : []

  const kwGaps = scan.keyword_gaps || []
  const visibleKwGaps = scan.is_gated ? kwGaps.slice(0, FREE_KWGAP_ROWS) : kwGaps
  const hiddenKwGaps = scan.is_gated ? kwGaps.slice(FREE_KWGAP_ROWS) : []
  const maxRank = scan.max_rank || 100

  const longtail = scan.longtail_keywords || []
  const longtailMeta = scan.longtail_meta
  const longtailFromSitemap = longtail.filter(k => k.source === 'sitemap')
  const longtailFromMatrix = longtail.filter(k => k.source === 'matrix')

  const total = scan.keyword_count || 1
  const pct = (n: number) => Math.round((n / total) * 100)

  // Executive Summary 데이터
  const seoGrade = calcSeoGrade(scan)
  const insights = buildInsights(scan)
  const dr = scan.backlink_summary?.domain_rank || 0
  const refDomains = scan.backlink_summary?.referring_domains || 0
  const aliveLinks = scan.backlink_summary?.alive_count || 0
  const competitorAvgDR = 45 // 의료 업종 경쟁사 평균 DR (벤치마크)
  const competitorAvgLinks = 120

  return (
    <Layout
      title={`${scan.domain} 구글 SEO 진단 · Patient Rank`}
      description={`${scan.domain}의 구글 한국 랭크 키워드 ${scan.keyword_count}개, TOP 3 ${scan.top3_count}개, TOP 10 ${scan.top10_count}개`}
    >
      <NavBar loggedIn />
      <main class="hero-dark relative overflow-hidden min-h-screen">
        {/* 별 그리드 + 오로라 글로우 */}
        <div class="absolute inset-0 stars-grid pointer-events-none"></div>
        <div class="absolute top-[-220px] right-[-120px] w-[720px] h-[720px] rounded-full pointer-events-none"
             style="background: radial-gradient(circle, rgba(0,102,255,0.35) 0%, transparent 60%); filter: blur(80px);"></div>
        <div class="absolute top-[640px] left-[-180px] w-[520px] h-[520px] rounded-full pointer-events-none"
             style="background: radial-gradient(circle, rgba(0,208,132,0.22) 0%, transparent 60%); filter: blur(90px);"></div>
        <div class="absolute top-[1400px] right-[-100px] w-[420px] h-[420px] rounded-full pointer-events-none"
             style="background: radial-gradient(circle, rgba(122,166,255,0.20) 0%, transparent 60%); filter: blur(90px);"></div>

        <div class="relative max-w-7xl mx-auto px-5 pt-28 pb-20">

          {/* ==================== 헤더 (글래스 다크) ==================== */}
          <div class="glass-dark rounded-3xl p-6 md:p-8 mb-8">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-3">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
                    <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                    진단 완료
                  </span>
                  <span class="text-xs text-white/40 font-mono">{new Date(scan.created_at).toLocaleString('ko-KR')}</span>
                </div>
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white break-all leading-tight">
                  <i class="fas fa-globe text-brand-300 mr-2.5"></i>
                  {scan.domain}
                </h1>
                <div class="text-sm text-white/50 mt-3">
                  <i class="fab fa-google mr-1.5 text-amber-300"></i>
                  구글 한국 SEO 진단 리포트 · TOP {maxRank}
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  onclick="navigator.clipboard.writeText(location.href); this.innerHTML='<i class=&quot;fas fa-check mr-2&quot;></i>복사됨'; this.classList.add('!bg-accent','!text-slate-900','!border-accent')"
                  class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all">
                  <i class="fas fa-link mr-2"></i>결과 공유
                </button>
                <a href="/dashboard" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all">
                  <i class="fas fa-table-columns mr-2"></i>대시보드
                </a>
                <a href="/#diagnose" class="group relative px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand via-brand-600 to-brand-700 text-white text-sm font-bold shadow-glow-brand hover:shadow-glow-brand-lg transition-all overflow-hidden">
                  <i class="fas fa-rotate mr-2"></i>다른 URL 진단
                </a>
              </div>
            </div>
          </div>

          {/* ==================== Executive Summary (SEO Grade + 인사이트) ==================== */}
          <div class={`relative overflow-hidden rounded-3xl mb-10 border border-white/10 bg-gradient-to-br ${seoGrade.bgGradient}`}>
            {/* 배경 글로우 */}
            <div class="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-50 pointer-events-none"
                 style={`background: radial-gradient(circle, ${seoGrade.grade === 'F' ? 'rgba(244,63,94,0.35)' : seoGrade.grade.startsWith('A') ? 'rgba(0,208,132,0.35)' : seoGrade.grade === 'B' ? 'rgba(0,102,255,0.35)' : 'rgba(251,191,36,0.35)'} 0%, transparent 65%); filter: blur(70px);`}></div>
            <div class="absolute inset-0 stars-grid pointer-events-none opacity-50"></div>

            <div class="relative grid lg:grid-cols-[auto_1fr] gap-8 p-7 md:p-9">
              {/* SEO Grade 메달 */}
              <div class="flex lg:flex-col items-center lg:items-start gap-5 lg:gap-3">
                <div class={`relative flex-shrink-0 w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-2 border-white/10 ring-4 ${seoGrade.ringColor} flex flex-col items-center justify-center shadow-2xl`}>
                  <div class="text-[9px] uppercase tracking-[0.25em] text-white/50 font-bold">SEO GRADE</div>
                  <div class={`text-7xl md:text-8xl font-black tracking-tighter ${seoGrade.color} leading-none mt-1`} style="text-shadow: 0 4px 30px currentColor;">
                    {seoGrade.grade}
                  </div>
                  <div class="mt-1.5 text-[11px] text-white/60 font-mono tabular-nums">{seoGrade.score} <span class="text-white/30">/ 100</span></div>
                </div>
                <div class="lg:mt-2">
                  <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold">종합 진단</div>
                  <div class={`text-xl md:text-2xl font-extrabold ${seoGrade.color} mt-1`}>{seoGrade.label}</div>
                  <div class="hidden lg:block mt-3 text-xs text-white/40">
                    <i class="fas fa-circle-info mr-1.5"></i>키워드·랭킹·권위 6개 지표 종합
                  </div>
                </div>
              </div>

              {/* 핵심 인사이트 + 위험 게이지 */}
              <div class="flex flex-col gap-5 min-w-0">
                <div>
                  <div class="flex items-center gap-2 mb-3">
                    <span class="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/80 text-[10px] font-extrabold tracking-wider uppercase">
                      <i class="fas fa-microscope mr-1"></i>EXECUTIVE BRIEF
                    </span>
                    <span class="text-[11px] text-white/40 font-bold">자동 생성된 의료 SEO 진단 요약</span>
                  </div>
                  <div class="space-y-2.5">
                    {insights.map((ins, i) => {
                      const toneStyle =
                        ins.tone === 'good' ? { bg: 'bg-accent/10 border-accent/25', dot: 'bg-accent', icon: 'text-accent' }
                        : ins.tone === 'warn' ? { bg: 'bg-amber-500/10 border-amber-400/25', dot: 'bg-amber-300', icon: 'text-amber-300' }
                        : { bg: 'bg-rose-500/10 border-rose-400/25', dot: 'bg-rose-400', icon: 'text-rose-300' }
                      return (
                        <div class={`flex items-start gap-3 p-3.5 rounded-2xl border ${toneStyle.bg} backdrop-blur-sm`}>
                          <div class="flex-shrink-0 mt-0.5">
                            <span class={`relative flex w-8 h-8 rounded-xl bg-slate-950/60 border border-white/10 items-center justify-center ${toneStyle.icon}`}>
                              <i class={`fas ${ins.icon} text-sm`}></i>
                              <span class={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${toneStyle.dot} ring-2 ring-slate-950`}></span>
                            </span>
                          </div>
                          <div class="flex-1 text-sm md:text-[15px] text-white/85 leading-relaxed">
                            <span class="text-white/40 font-mono mr-1">0{i + 1}</span>
                            {ins.text}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 위험 레벨 게이지 + 6개 메트릭 점수 */}
                <div class="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                  {[
                    { label: 'TOP 3', value: scan.top3_count, max: 10, color: 'accent' },
                    { label: 'TOP 10', value: scan.top10_count, max: 20, color: 'brand' },
                    { label: 'TOP 30', value: scan.top30_count, max: 40, color: 'amber' },
                    { label: '롱테일', value: longtail.length, max: 50, color: 'emerald' },
                    { label: 'DR', value: dr, max: 100, color: 'sky' },
                    { label: '백링크', value: aliveLinks, max: 100, color: 'violet' },
                  ].map((m) => {
                    const pctVal = Math.min(Math.round((m.value / m.max) * 100), 100)
                    const colorMap: Record<string, string> = {
                      accent: 'from-accent to-emerald-500',
                      brand: 'from-brand to-brand-700',
                      amber: 'from-amber-300 to-amber-500',
                      emerald: 'from-emerald-300 to-accent',
                      sky: 'from-sky-300 to-brand',
                      violet: 'from-violet-300 to-purple-500',
                    }
                    return (
                      <div class="p-3 rounded-xl bg-slate-950/40 border border-white/10 backdrop-blur-sm">
                        <div class="text-[9px] uppercase tracking-widest text-white/50 font-bold">{m.label}</div>
                        <div class="text-xl md:text-2xl font-extrabold text-white mt-1 tabular-nums">{m.value}</div>
                        <div class="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                          <div class={`h-full rounded-full bg-gradient-to-r ${colorMap[m.color]}`} style={`width:${pctVal}%`}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 이번 달 콘텐츠 처방전 ==================== */}
          {prescriptions && prescriptions.prescriptions.length > 0 && (() => {
            const isPaid = !!(viewer && (viewer.is_admin === 1 || viewer.plan !== 'free'))
            const FREE_RX = 3
            const rxList = prescriptions.prescriptions
            const s = prescriptions.summary
            return (
              <section id="prescription" class="bento-card rounded-3xl p-7 mb-10 relative overflow-hidden group">
                <div class="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-25 group-hover:opacity-40 transition-opacity"
                     style="background: radial-gradient(circle, #F59E0B 0%, transparent 70%); filter: blur(40px);"></div>
                <div class="relative">
                  <header class="flex flex-wrap items-center justify-between gap-3 mb-1.5">
                    <h3 class="text-xl md:text-2xl font-extrabold text-white">
                      <i class="fas fa-file-prescription text-amber-300 mr-2.5"></i>
                      이번 달 콘텐츠 처방전
                    </h3>
                    <span class="text-[11px] px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-200 font-bold">
                      기회 {prescriptions.total_opportunities}건 발견
                    </span>
                  </header>
                  <p class="text-sm text-white/60 mb-5">
                    진단 데이터를 기반으로 <b class="text-white/85">우선순위 순</b>으로 정리한 실행 계획입니다.
                    위에서부터 하나씩 처리하시면 됩니다.
                  </p>

                  {/* 유형별 요약 칩 */}
                  <div class="flex flex-wrap gap-2 mb-6">
                    {[
                      { k: 'quick_win', n: s.quick_win },
                      { k: 'ctr_fix', n: s.ctr_fix },
                      { k: 'gap_attack', n: s.gap_attack },
                      { k: 'new_content', n: s.new_content },
                      { k: 'defend', n: s.defend },
                    ].filter((x) => x.n > 0).map((x) => {
                      const m = RX_META[x.k]
                      return (
                        <span class={`text-[11px] px-2.5 py-1 rounded-lg border font-bold ${m.badge}`}>
                          <i class={`fas ${m.icon} mr-1`}></i>{m.label} {x.n}
                        </span>
                      )
                    })}
                  </div>

                  <div class="grid md:grid-cols-2 gap-4">
                    {rxList.map((rx, i) => (
                      <RxCard rx={rx} idx={i} locked={!isPaid && i >= FREE_RX} />
                    ))}
                  </div>

                  {!isPaid && rxList.length > FREE_RX && (
                    <div class="mt-5 text-center text-sm text-white/50">
                      무료 플랜은 상위 {FREE_RX}건까지 공개됩니다 ·{' '}
                      <a href="/pricing" class="text-brand-300 font-bold hover:underline">전체 처방전 + 주간 추적 시작하기 →</a>
                    </div>
                  )}
                </div>
              </section>
            )
          })()}

          {/* ==================== 이번 주 변화 + AI 액션 가이드 (Pro 전용) ==================== */}
          {(weeklyDelta || actionGuide) && (
            <div class="grid lg:grid-cols-2 gap-5 mb-10">
              {/* ---------- 주간 변화 카드 ---------- */}
              {weeklyDelta && (
                <div class="bento-card rounded-3xl p-7 relative overflow-hidden group">
                  <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-25 group-hover:opacity-40 transition-opacity"
                       style="background: radial-gradient(circle, #10B981 0%, transparent 70%); filter: blur(40px);"></div>
                  <div class="relative">
                    <div class="flex items-center justify-between mb-5">
                      <div class="flex items-center gap-3">
                        <span class="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                          <i class="fas fa-chart-line"></i>
                        </span>
                        <div>
                          <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold">WEEKLY DELTA</div>
                          <div class="text-lg font-extrabold text-white">이번 주 변화</div>
                        </div>
                      </div>
                      {weeklyDelta.previous ? (
                        <span class="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-mono">
                          vs {weeklyDelta.previous.snapshot_date}
                        </span>
                      ) : (
                        <span class="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-300 font-bold">
                          첫 스캔
                        </span>
                      )}
                    </div>

                    {weeklyDelta.previous ? (
                      <div class="grid grid-cols-2 gap-3">
                        {[
                          { label: 'TOP 3', delta: weeklyDelta.delta.top3_count, suffix: '개' },
                          { label: 'TOP 10', delta: weeklyDelta.delta.top10_count, suffix: '개' },
                          { label: 'TOP 30', delta: weeklyDelta.delta.top30_count, suffix: '개' },
                          { label: 'DR', delta: weeklyDelta.delta.domain_rating, suffix: '' },
                        ].map((m) => {
                          const isUp = m.delta > 0
                          const isDown = m.delta < 0
                          const tone = isUp ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/25'
                                     : isDown ? 'text-rose-300 bg-rose-500/10 border-rose-400/25'
                                     : 'text-white/50 bg-white/5 border-white/10'
                          const icon = isUp ? 'fa-arrow-trend-up' : isDown ? 'fa-arrow-trend-down' : 'fa-minus'
                          const sign = isUp ? '+' : ''
                          return (
                            <div class={`p-3.5 rounded-2xl border ${tone} backdrop-blur-sm`}>
                              <div class="flex items-center justify-between mb-1">
                                <span class="text-[10px] uppercase tracking-wider text-white/60 font-bold">{m.label}</span>
                                <i class={`fas ${icon} text-xs opacity-70`}></i>
                              </div>
                              <div class="text-2xl font-extrabold font-mono">
                                {sign}{m.delta}<span class="text-xs text-white/50 ml-0.5">{m.suffix}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div class="p-5 rounded-2xl bg-slate-950/40 border border-white/10 text-center">
                        <div class="text-white/60 text-sm leading-relaxed">
                          <i class="fas fa-seedling text-emerald-300 text-2xl mb-2 block"></i>
                          첫 스캔 기록이 저장됐어요.<br/>
                          다음 주 월요일 06:00에 자동 재스캔되어<br/>
                          <span class="text-emerald-300 font-bold">주간 변화 추이</span>가 표시됩니다.
                        </div>
                      </div>
                    )}

                    {/* 4주 트렌드 미니 차트 */}
                    {weeklyDelta.trend_4w && weeklyDelta.trend_4w.length >= 2 && (
                      <div class="mt-5 pt-5 border-t border-white/10">
                        <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">4주 TOP10 추이</div>
                        <div class="flex items-end gap-1.5 h-12">
                          {weeklyDelta.trend_4w.map((pt: any) => {
                            const max = Math.max(...weeklyDelta.trend_4w.map((p: any) => p.top10_count || 0), 1)
                            const h = Math.max(Math.round(((pt.top10_count || 0) / max) * 100), 8)
                            return (
                              <div class="flex-1 flex flex-col items-center gap-1" title={`${pt.snapshot_date}: ${pt.top10_count}`}>
                                <div class="w-full rounded-t-md bg-gradient-to-t from-brand to-accent" style={`height:${h}%`}></div>
                                <div class="text-[8px] text-white/40 font-mono">{(pt.snapshot_date || '').slice(5)}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------- AI 액션 가이드 카드 ---------- */}
              {actionGuide && actionGuide.this_week_actions && actionGuide.this_week_actions.length > 0 && (
                <div class="bento-card rounded-3xl p-7 relative overflow-hidden group">
                  <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-25 group-hover:opacity-40 transition-opacity"
                       style="background: radial-gradient(circle, #0066FF 0%, transparent 70%); filter: blur(40px);"></div>
                  <div class="relative">
                    <div class="flex items-center justify-between mb-5">
                      <div class="flex items-center gap-3">
                        <span class="w-10 h-10 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-200">
                          <i class="fas fa-wand-magic-sparkles"></i>
                        </span>
                        <div>
                          <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold">PATIENT FUNNEL AI</div>
                          <div class="text-lg font-extrabold text-white">이번 주 할 일 3가지</div>
                        </div>
                      </div>
                      <span class="text-[10px] px-2.5 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand-200 font-bold">
                        <i class="fas fa-crown mr-1"></i>PRO
                      </span>
                    </div>

                    {(actionGuide.top_strength || actionGuide.top_weakness) && (
                      <div class="mb-4 p-3.5 rounded-2xl bg-slate-950/40 border border-white/10 text-sm text-white/80 leading-relaxed space-y-1.5">
                        {actionGuide.top_strength && (
                          <div><i class="fas fa-thumbs-up text-emerald-300/60 text-xs mr-1.5"></i>{actionGuide.top_strength}</div>
                        )}
                        {actionGuide.top_weakness && (
                          <div><i class="fas fa-triangle-exclamation text-amber-300/60 text-xs mr-1.5"></i>{actionGuide.top_weakness}</div>
                        )}
                      </div>
                    )}

                    <div class="space-y-3">
                      {actionGuide.this_week_actions.slice(0, 3).map((a: any, i: number) => {
                        const priorityColor =
                          a.priority === 1 ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
                          : a.priority === 2 ? 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                          : 'bg-white/5 border-white/15 text-white/70'
                        const priorityLabel = a.priority === 1 ? '긴급' : a.priority === 2 ? '중요' : '권장'
                        const catIcon =
                          a.category === 'content' ? 'fa-file-pen'
                          : a.category === 'technical' ? 'fa-gear'
                          : a.category === 'backlink' ? 'fa-link'
                          : a.category === 'gsc' ? 'fa-magnifying-glass-chart'
                          : a.category === 'local' ? 'fa-location-dot'
                          : 'fa-bullseye'
                        return (
                          <div class="p-4 rounded-2xl bg-slate-950/40 border border-white/10 backdrop-blur-sm hover:border-brand/30 transition-colors">
                            <div class="flex items-start gap-3">
                              <span class="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-brand/30 to-accent/20 border border-white/10 flex items-center justify-center text-white">
                                <i class={`fas ${catIcon} text-sm`}></i>
                              </span>
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span class="text-white/40 font-mono text-xs">0{i + 1}</span>
                                  <span class="font-extrabold text-white text-[15px] leading-tight">{a.title}</span>
                                  <span class={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold uppercase tracking-wider ${priorityColor}`}>
                                    {priorityLabel}
                                  </span>
                                </div>
                                <div class="text-[13px] text-white/70 leading-relaxed mb-2">
                                  {a.why}{a.how ? ` — ${a.how}` : ''}
                                </div>
                                <div class="flex items-center gap-2 flex-wrap">
                                  {a.patient_funnel_stage && (
                                    <span class="text-[10px] px-2 py-0.5 rounded-md bg-brand/10 border border-brand/20 text-brand-200 font-bold">
                                      <i class="fas fa-funnel-dollar mr-1 text-[9px]"></i>{a.patient_funnel_stage}
                                    </span>
                                  )}
                                  {a.expected_impact && (
                                    <span class="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 font-bold">
                                      <i class="fas fa-chart-line mr-1 text-[9px]"></i>{a.expected_impact}
                                    </span>
                                  )}
                                  {a.estimated_time && (
                                    <span class="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 font-mono">
                                      <i class="far fa-clock mr-1 text-[9px]"></i>{a.estimated_time}
                                    </span>
                                  )}
                                  {a.estimated_cost && (
                                    <span class="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 font-mono">
                                      <i class="fas fa-coins mr-1 text-[9px]"></i>{a.estimated_cost}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40 font-mono">
                      <span><i class="fas fa-robot mr-1"></i>{actionGuide.model_used || 'gpt-5.5'}</span>
                      <span>생성: {(actionGuide.generated_at || '').slice(0, 10)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== 스코어카드 + KPI Bento ==================== */}
          <div class="grid lg:grid-cols-3 gap-5 mb-10">
            {/* 메인 KPI 카드 (랭크 키워드 총합) */}
            <div class="lg:col-span-1 bento-card rounded-3xl p-7 relative overflow-hidden group">
              <div class="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"
                   style="background: radial-gradient(circle, #0066FF 0%, transparent 70%); filter: blur(40px);"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs uppercase tracking-widest text-white/50 font-bold">총 랭크 키워드</div>
                  <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center text-white shadow-glow-brand">
                    <i class="fas fa-key text-sm"></i>
                  </span>
                </div>
                <div class="text-6xl md:text-7xl font-extrabold tracking-tight text-gradient-dark leading-none mt-3">
                  {formatNumber(scan.keyword_count)}
                </div>
                <div class="text-sm text-white/50 mt-3">
                  <i class="fab fa-google mr-1.5 text-amber-300"></i>구글 한국 TOP {maxRank} 기준
                </div>
                <div class="mt-5 pt-5 border-t border-white/10">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-white/60">월 추정 유입</span>
                    <span class="text-2xl font-extrabold text-accent">{formatNumber(scan.estimated_traffic)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 랭킹 분포 */}
            <div class="lg:col-span-2 bento-card rounded-3xl p-7 relative">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <div class="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">랭킹 분포</div>
                  <div class="text-xl font-extrabold text-white">키워드 위치별 분석</div>
                </div>
                <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-emerald-700 flex items-center justify-center text-white">
                  <i class="fas fa-chart-pie text-sm"></i>
                </span>
              </div>

              <div class="grid grid-cols-4 gap-3 mb-6">
                <div class="p-4 rounded-2xl bg-accent/10 border border-accent/30 text-center group hover:bg-accent/20 transition-all">
                  <div class="text-[10px] text-accent font-bold uppercase tracking-wider">TOP 3</div>
                  <div class="text-3xl font-extrabold text-accent mt-1.5">{scan.top3_count}</div>
                  <div class="text-[10px] text-white/50 mt-1">{pct(scan.top3_count)}%</div>
                </div>
                <div class="p-4 rounded-2xl bg-brand/10 border border-brand/30 text-center group hover:bg-brand/20 transition-all">
                  <div class="text-[10px] text-brand-300 font-bold uppercase tracking-wider">TOP 10</div>
                  <div class="text-3xl font-extrabold text-brand-300 mt-1.5">{scan.top10_count}</div>
                  <div class="text-[10px] text-white/50 mt-1">{pct(scan.top10_count)}%</div>
                </div>
                <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center group hover:bg-amber-500/20 transition-all">
                  <div class="text-[10px] text-amber-300 font-bold uppercase tracking-wider">TOP 30</div>
                  <div class="text-3xl font-extrabold text-amber-300 mt-1.5">{scan.top30_count}</div>
                  <div class="text-[10px] text-white/50 mt-1">{pct(scan.top30_count)}%</div>
                </div>
                <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center group hover:bg-white/10 transition-all">
                  <div class="text-[10px] text-white/60 font-bold uppercase tracking-wider">TOP 100</div>
                  <div class="text-3xl font-extrabold text-white/80 mt-1.5">{scan.top100_count}</div>
                  <div class="text-[10px] text-white/50 mt-1">{pct(scan.top100_count)}%</div>
                </div>
              </div>

              <div class="flex items-center gap-5 pt-5 border-t border-white/10">
                <canvas id="rank-donut" width="120" height="120" class="w-[120px] h-[120px]"></canvas>
                <div class="flex-1 grid grid-cols-2 gap-2 text-xs">
                  <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-sm bg-accent"></span><span class="text-white/70">상단 노출 (1-3)</span></div>
                  <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-sm bg-brand"></span><span class="text-white/70">1페이지 (4-10)</span></div>
                  <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-sm bg-amber-400"></span><span class="text-white/70">2-3페이지 (11-30)</span></div>
                  <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-sm bg-white/30"></span><span class="text-white/70">잠재 (31-100)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 진료과 분석 ==================== */}
          {specs.length > 0 && (
            <div class="bento-card rounded-3xl p-6 md:p-7 mb-8">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <div class="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">진료과 분포</div>
                  <div class="text-xl font-extrabold text-white">
                    <i class="fas fa-stethoscope text-brand-300 mr-2"></i>
                    주요 진료과 키워드
                  </div>
                </div>
                <span class="px-3 py-1.5 rounded-full bg-brand/15 border border-brand/30 text-brand-300 text-xs font-bold">
                  {specs.length}개 진료과
                </span>
              </div>
              <div class="grid md:grid-cols-3 gap-3">
                {specs.map((s) => (
                  <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand/40 hover:bg-white/[0.06] transition-all">
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="text-base font-bold text-white">{s.specialty}</div>
                      <span class="px-2 py-0.5 rounded-md bg-brand/15 text-brand-300 text-[10px] font-bold">{s.count}</span>
                    </div>
                    <div class="text-xs text-white/50">월 검색량 <b class="text-accent">{formatNumber(s.volume)}</b></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 키워드 테이블 ==================== */}
          <div class="bento-card rounded-3xl overflow-hidden mb-10">
            <div class="p-6 flex items-center justify-between border-b border-white/10">
              <div>
                <div class="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">전체 리스트</div>
                <div class="text-xl font-extrabold text-white">
                  <i class="fas fa-list-ol text-brand-300 mr-2"></i>
                  랭크 키워드 · 검색량 정렬
                </div>
              </div>
              <input
                id="kw-search"
                type="search"
                placeholder="키워드 검색..."
                class="hidden md:block px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 focus:border-brand focus:bg-white/10 text-white placeholder-white/40 outline-none transition-all w-56"
              />
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-white/[0.03] text-white/50 text-[10px] uppercase tracking-widest">
                  <tr>
                    <th class="text-left px-5 py-3 w-14 font-bold">#</th>
                    <th class="text-left px-5 py-3 font-bold">키워드</th>
                    <th class="text-center px-5 py-3 w-24 font-bold">순위</th>
                    <th class="text-right px-5 py-3 w-28 font-bold">월 검색량</th>
                    <th class="text-left px-5 py-3 hidden md:table-cell font-bold">랭크 URL</th>
                  </tr>
                </thead>
                <tbody id="kw-tbody" class="divide-y divide-white/5">
                  {visibleKeywords.map((k, i) => {
                    const badge =
                      k.rank <= 3 ? 'bg-accent/20 border-accent/40 text-accent'
                      : k.rank <= 10 ? 'bg-brand/20 border-brand/40 text-brand-300'
                      : k.rank <= 30 ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                      : 'bg-white/5 border-white/10 text-white/60'
                    return (
                      <tr class="hover:bg-white/[0.04] transition-colors kw-row">
                        <td class="px-5 py-3.5 text-white/30 tabular-nums font-mono">{i + 1}</td>
                        <td class="px-5 py-3.5 font-semibold text-white">{k.keyword}</td>
                        <td class="px-5 py-3.5 text-center">
                          <span class={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-lg text-xs font-extrabold border ${badge}`}>{k.rank}위</span>
                        </td>
                        <td class="px-5 py-3.5 text-right tabular-nums text-white/80 font-mono">{formatNumber(k.search_volume)}</td>
                        <td class="px-5 py-3.5 hidden md:table-cell">
                          <a href={k.ranked_url} target="_blank" rel="noopener" class="text-brand-300 hover:text-brand-200 hover:underline text-xs break-all">
                            {k.ranked_url.length > 60 ? k.ranked_url.slice(0, 60) + '...' : k.ranked_url}
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                  {scan.is_gated && hiddenCount > 0 && hiddenKeywords.slice(0, 5).map((k, i) => (
                    <tr class="relative select-none blur-row">
                      <td class="px-5 py-3.5 text-white/30 tabular-nums font-mono">{FREE_VISIBLE_ROWS + i + 1}</td>
                      <td class="px-5 py-3.5 font-semibold text-white/30 blur-sm">{k.keyword}</td>
                      <td class="px-5 py-3.5 text-center blur-sm">
                        <span class="inline-block min-w-[3rem] px-2.5 py-1 rounded-lg text-xs font-extrabold bg-white/5 border border-white/10 text-white/40">{k.rank}위</span>
                      </td>
                      <td class="px-5 py-3.5 text-right tabular-nums text-white/30 blur-sm">{formatNumber(k.search_volume)}</td>
                      <td class="px-5 py-3.5 hidden md:table-cell text-white/30 blur-sm">••••••</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================== 백링크 분석 (Pro) ==================== */}
          {bls && (
            <section class="mb-10">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-brand to-brand-700 text-white text-[10px] font-extrabold tracking-wider uppercase">PRO</span>
                    <div class="text-xs uppercase tracking-widest text-white/50 font-bold">백링크 분석</div>
                  </div>
                  <h2 class="text-2xl md:text-3xl font-extrabold text-white">
                    <i class="fas fa-link text-brand-300 mr-2"></i>
                    도메인 권위 · 링크 자산
                  </h2>
                  <div class="text-sm text-white/50 mt-1.5">
                    누가 <b class="text-white">{scan.domain}</b>에 권위를 흘려보내는지, 경쟁사는 어디서 링크 받는지 분석
                  </div>
                </div>
              </div>

              {/* DR + 경쟁사 벤치마크 비교 (다크 프리미엄) */}
              {(() => {
                const drGap = Math.max(competitorAvgDR - bls.domain_rank, 0)
                const linksGap = Math.max(competitorAvgLinks - bls.alive_count, 0)
                const drRiskColor = bls.domain_rank === 0 ? 'rose' : bls.domain_rank < 20 ? 'amber' : bls.domain_rank < 50 ? 'brand' : 'accent'
                const drColorMap: Record<string, { bg: string; border: string; text: string; glow: string; bar: string }> = {
                  rose:   { bg: 'bg-rose-500/10',   border: 'border-rose-400/30',   text: 'text-rose-300',   glow: 'rgba(244,63,94,0.4)',  bar: 'from-rose-500 to-red-500' },
                  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-400/30',  text: 'text-amber-300',  glow: 'rgba(251,191,36,0.4)', bar: 'from-amber-400 to-amber-600' },
                  brand:  { bg: 'bg-brand/10',      border: 'border-brand/30',      text: 'text-brand-300',  glow: 'rgba(0,102,255,0.4)',  bar: 'from-brand to-brand-700' },
                  accent: { bg: 'bg-accent/10',     border: 'border-accent/30',     text: 'text-accent',     glow: 'rgba(0,208,132,0.4)',  bar: 'from-accent to-emerald-600' },
                }
                const dc = drColorMap[drRiskColor]
                const drLabel = bls.domain_rank === 0 ? '권위 부재' : bls.domain_rank < 20 ? '심각한 부족' : bls.domain_rank < 50 ? '평균 미만' : '안정적'

                return (
                  <div class="grid lg:grid-cols-2 gap-4 mb-5">
                    {/* DR 게이지 (대형) */}
                    <div class={`bento-card rounded-3xl p-6 relative overflow-hidden ${dc.border}`}>
                      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-50 pointer-events-none"
                           style={`background: radial-gradient(circle, ${dc.glow} 0%, transparent 65%); filter: blur(60px);`}></div>
                      <div class="relative">
                        <div class="flex items-center justify-between mb-4">
                          <div>
                            <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">도메인 권위 (DR)</div>
                            <div class="text-xs text-white/40 mt-0.5">구글이 매기는 신뢰도 점수</div>
                          </div>
                          <span class={`px-2.5 py-1 rounded-full ${dc.bg} ${dc.border} border ${dc.text} text-[10px] font-extrabold uppercase tracking-wider`}>
                            <span class={`inline-block w-1.5 h-1.5 rounded-full ${dc.text.replace('text-', 'bg-')} mr-1 animate-pulse`}></span>
                            {drLabel}
                          </span>
                        </div>

                        {/* 거대 DR 숫자 + 게이지 */}
                        <div class="flex items-end gap-6 mb-4">
                          <div>
                            <div class={`text-7xl md:text-8xl font-black tracking-tighter ${dc.text} leading-none`} style={`text-shadow: 0 4px 30px ${dc.glow};`}>
                              {bls.domain_rank}
                            </div>
                            <div class="text-xs text-white/40 mt-1 font-mono">/ 100</div>
                          </div>
                          <div class="flex-1 pb-3">
                            <div class="text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1.5">의료 업종 평균 대비</div>
                            <div class="relative h-3 rounded-full bg-white/5 overflow-hidden">
                              <div class={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${dc.bar}`} style={`width:${bls.domain_rank}%`}></div>
                              {/* 경쟁사 평균 마커 */}
                              <div class="absolute inset-y-0 w-0.5 bg-white/60" style={`left:${competitorAvgDR}%`}>
                                <div class="absolute -top-1.5 -left-1 w-2.5 h-2.5 rotate-45 bg-white/80"></div>
                              </div>
                            </div>
                            <div class="flex justify-between mt-1.5 text-[10px] text-white/40 font-mono">
                              <span>0</span>
                              <span class="text-white/70">평균 {competitorAvgDR} <i class="fas fa-caret-down"></i></span>
                              <span>100</span>
                            </div>
                          </div>
                        </div>

                        {drGap > 0 && (
                          <div class={`p-3 rounded-xl ${dc.bg} border ${dc.border} text-xs text-white/80`}>
                            <i class={`fas fa-triangle-exclamation ${dc.text} mr-1.5`}></i>
                            경쟁사 평균보다 <b class={dc.text}>{drGap}점 부족</b> · 권위 도메인 {Math.ceil(drGap / 5)}개 확보 시 따라잡기 가능
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 백링크 자산 비교 차트 */}
                    <div class="bento-card rounded-3xl p-6 relative overflow-hidden">
                      <div class="flex items-center justify-between mb-5">
                        <div>
                          <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">백링크 자산 비교</div>
                          <div class="text-base font-extrabold text-white mt-0.5">우리 vs 경쟁사 평균</div>
                        </div>
                        <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center text-white shadow-glow-brand">
                          <i class="fas fa-chart-column text-sm"></i>
                        </span>
                      </div>

                      {/* 가로 막대 비교 차트 */}
                      <div class="space-y-4">
                        {[
                          { label: '리퍼링 도메인', us: bls.referring_domains, them: 28, unit: '개', color: 'brand' },
                          { label: '살아있는 백링크', us: bls.alive_count, them: competitorAvgLinks, unit: '개', color: 'accent' },
                          { label: 'Dofollow 비율', us: Math.round((bls.dofollow_ratio || 0) * 100), them: 65, unit: '%', color: 'amber' },
                        ].map((row) => {
                          const max = Math.max(row.us, row.them, 1)
                          const usPct = (row.us / max) * 100
                          const themPct = (row.them / max) * 100
                          const colorMap: Record<string, string> = {
                            brand: 'from-brand to-brand-700',
                            accent: 'from-accent to-emerald-600',
                            amber: 'from-amber-400 to-amber-600',
                          }
                          return (
                            <div>
                              <div class="flex items-center justify-between text-xs mb-1.5">
                                <span class="text-white/70 font-bold">{row.label}</span>
                                <span class="font-mono tabular-nums">
                                  <span class={row.us < row.them ? 'text-rose-300' : 'text-accent'}>{formatNumber(row.us)}{row.unit}</span>
                                  <span class="text-white/30 mx-1.5">vs</span>
                                  <span class="text-white/60">{formatNumber(row.them)}{row.unit}</span>
                                </span>
                              </div>
                              <div class="space-y-1">
                                <div class="relative h-2 rounded-full bg-white/5 overflow-hidden">
                                  <div class={`h-full rounded-full bg-gradient-to-r ${colorMap[row.color]}`} style={`width:${Math.max(usPct, 2)}%`}></div>
                                </div>
                                <div class="relative h-2 rounded-full bg-white/5 overflow-hidden">
                                  <div class="h-full rounded-full bg-white/30" style={`width:${themPct}%`}></div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div class="flex items-center gap-4 mt-5 pt-4 border-t border-white/10 text-[11px]">
                        <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm bg-gradient-to-r from-brand to-accent"></span><span class="text-white/70">우리 ({scan.domain.length > 18 ? scan.domain.slice(0, 18) + '...' : scan.domain})</span></span>
                        <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm bg-white/30"></span><span class="text-white/70">경쟁사 평균</span></span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Action Plan 카드 (DR/백링크 부족 시 우선 노출) */}
              {bls.domain_rank < 30 && (
                <div class="relative overflow-hidden rounded-3xl mb-5 p-6 md:p-7 border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.08] via-rose-500/[0.05] to-transparent">
                  <div class="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-40 pointer-events-none"
                       style="background: radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%); filter: blur(60px);"></div>
                  <div class="relative">
                    <div class="flex items-center gap-2 mb-3">
                      <span class="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-[10px] font-extrabold tracking-wider uppercase">ACTION PLAN</span>
                      <span class="text-[11px] text-white/50 font-bold">90일 권위 회복 로드맵</span>
                    </div>
                    <div class="text-xl md:text-2xl font-extrabold text-white mb-1">
                      <i class="fas fa-route text-amber-300 mr-2"></i>
                      DR {bls.domain_rank} → {Math.min(bls.domain_rank + 25, 50)} 끌어올리는 3단계
                    </div>
                    <div class="text-sm text-white/60 mb-5">의료 업종 평균(DR {competitorAvgDR})에 도달하려면 다음 순서로 실행하세요</div>

                    <div class="grid md:grid-cols-3 gap-3">
                      {[
                        { step: '01', icon: 'fa-newspaper', title: '보도자료 + 의료 매체 기고', detail: '한국경제, 머니투데이, 뉴시스 같은 DR 50+ 매체에 월 2건 기고. 90일 내 권위 도메인 6개 확보 가능.', kpi: '+12 DR', color: 'amber' },
                        { step: '02', icon: 'fa-handshake', title: '진료 협력 병원 상호 링크', detail: '동일 진료과 또는 보완 진료과 병원과 케이스 공유 페이지 교환. 자연스러운 의료 컨텍스트 링크 5건.', kpi: '+8 DR', color: 'brand' },
                        { step: '03', icon: 'fa-microphone', title: '환자 후기 → 외부 플랫폼 노출', detail: '네이버 카페·블로그·유튜브 의료 인플루언서 콜라보. 다양한 도메인에서 자연 백링크 유입.', kpi: '+5 DR', color: 'accent' },
                      ].map((s) => {
                        const cm: Record<string, { ring: string; text: string; bg: string }> = {
                          amber:  { ring: 'ring-amber-400/40',  text: 'text-amber-300',  bg: 'bg-amber-500/15' },
                          brand:  { ring: 'ring-brand/40',      text: 'text-brand-300',  bg: 'bg-brand/15' },
                          accent: { ring: 'ring-accent/40',     text: 'text-accent',     bg: 'bg-accent/15' },
                        }
                        const c = cm[s.color]
                        return (
                          <div class="relative p-5 rounded-2xl bg-slate-950/40 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group">
                            <div class="flex items-start justify-between mb-3">
                              <span class={`w-11 h-11 rounded-xl ${c.bg} ring-2 ${c.ring} flex items-center justify-center ${c.text}`}>
                                <i class={`fas ${s.icon}`}></i>
                              </span>
                              <span class="text-[10px] font-mono text-white/30 tracking-widest">STEP {s.step}</span>
                            </div>
                            <div class="text-base font-extrabold text-white mb-1.5">{s.title}</div>
                            <div class="text-xs text-white/60 leading-relaxed mb-3">{s.detail}</div>
                            <div class={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg} text-xs ${c.text} font-extrabold`}>
                              <i class="fas fa-arrow-trend-up"></i>예상 효과 {s.kpi}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 백링크 리스트 */}
              <div class="bento-card rounded-3xl overflow-hidden mb-5">
                <div class="p-6 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div class="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">살아있는 백링크</div>
                    <div class="text-xl font-extrabold text-white">
                      <i class="fas fa-signal text-accent mr-2"></i>
                      TOP {Math.min(bl.length, 20)} 권위 순
                    </div>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-white/[0.03] text-white/50 text-[10px] uppercase tracking-widest">
                      <tr>
                        <th class="text-left px-5 py-3 font-bold">출처 도메인</th>
                        <th class="text-left px-5 py-3 hidden md:table-cell font-bold">앵커 텍스트</th>
                        <th class="text-center px-5 py-3 w-24 font-bold">DR</th>
                        <th class="text-center px-5 py-3 w-24 font-bold">유형</th>
                        <th class="text-center px-5 py-3 w-20 font-bold">상태</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                      {visibleBacklinks.map((b) => (
                        <tr class="hover:bg-white/[0.04] transition-colors">
                          <td class="px-5 py-3.5">
                            <a href={b.source_url} target="_blank" rel="noopener" class="text-brand-300 hover:text-brand-200 hover:underline font-semibold">
                              {b.source_domain}
                            </a>
                            <div class="text-[11px] text-white/30 truncate max-w-[280px] mt-0.5">{b.source_url}</div>
                          </td>
                          <td class="px-5 py-3.5 hidden md:table-cell text-white/70 truncate max-w-[200px]" title={b.anchor}>
                            {b.anchor || <span class="text-white/30">(없음)</span>}
                          </td>
                          <td class="px-5 py-3.5 text-center">
                            <span class={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-lg text-xs font-extrabold border ${
                              b.domain_rank >= 70 ? 'bg-accent/20 border-accent/40 text-accent'
                              : b.domain_rank >= 50 ? 'bg-brand/20 border-brand/40 text-brand-300'
                              : b.domain_rank >= 30 ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                              : 'bg-white/5 border-white/10 text-white/60'
                            }`}>{b.domain_rank}</span>
                          </td>
                          <td class="px-5 py-3.5 text-center">
                            {b.is_dofollow ? (
                              <span class="px-2 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold">dofollow</span>
                            ) : (
                              <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/50 text-[10px]">nofollow</span>
                            )}
                          </td>
                          <td class="px-5 py-3.5 text-center">
                            {b.is_lost ? (
                              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warn/15 border border-warn/30 text-warn text-[10px] font-bold">
                                <i class="fas fa-link-slash"></i> lost
                              </span>
                            ) : (
                              <span class="inline-flex items-center gap-1 text-accent text-[10px] font-bold">
                                <i class="fas fa-heart-pulse"></i> alive
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {hiddenBacklinks.slice(0, 5).map((b) => (
                        <tr class="relative select-none">
                          <td class="px-5 py-3.5 blur-sm">
                            <div class="font-semibold text-white/40">{b.source_domain}</div>
                            <div class="text-[11px] text-white/20">{b.source_url}</div>
                          </td>
                          <td class="px-5 py-3.5 hidden md:table-cell text-white/30 blur-sm">{b.anchor}</td>
                          <td class="px-5 py-3.5 text-center blur-sm">
                            <span class="inline-block min-w-[2.5rem] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/40">{b.domain_rank}</span>
                          </td>
                          <td class="px-5 py-3.5 text-center blur-sm text-white/30 text-xs">••••</td>
                          <td class="px-5 py-3.5 text-center blur-sm text-white/30 text-xs">••••</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hiddenBacklinks.length > 0 && (
                  <div class="p-4 text-center text-sm text-white/60 border-t border-white/10 bg-white/[0.02]">
                    <i class="fas fa-lock mr-1.5 text-amber-300"></i>
                    <b class="text-white">{hiddenBacklinks.length}개</b> 백링크가 더 있습니다 ·
                    <a href="/pricing" class="text-brand-300 font-bold hover:underline ml-1">Pro로 전체 보기 →</a>
                  </div>
                )}
              </div>

              {/* 경쟁사 갭 */}
              {gap.length > 0 && (
                <div class="bento-card rounded-3xl overflow-hidden border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.04] to-transparent">
                  <div class="p-6 border-b border-amber-400/15">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-[10px] font-extrabold tracking-wider uppercase">GAP</span>
                      <span class="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-brand to-brand-700 text-white text-[10px] font-extrabold tracking-wider uppercase">PRO</span>
                    </div>
                    <div class="text-xl font-extrabold text-white">
                      <i class="fas fa-flag-checkered text-amber-300 mr-2"></i>
                      경쟁 치과 링크 소스 · 우리가 못 받은 기회
                    </div>
                    <div class="text-xs text-white/60 mt-1.5">
                      경쟁사가 받고 있는 링크 중 <b class="text-amber-200">우리는 아직 못 받은</b> 출처. 제보·기고·보도자료로 공략 가능.
                    </div>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead class="bg-white/[0.03] text-white/50 text-[10px] uppercase tracking-widest">
                        <tr>
                          <th class="text-left px-5 py-3 font-bold">링크 출처</th>
                          <th class="text-left px-5 py-3 hidden md:table-cell font-bold">받은 경쟁사</th>
                          <th class="text-left px-5 py-3 hidden md:table-cell font-bold">맥락 (앵커)</th>
                          <th class="text-center px-5 py-3 w-24 font-bold">출처 권위</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-white/5">
                        {visibleGap.map((g) => (
                          <tr class="hover:bg-amber-500/[0.04] transition-colors">
                            <td class="px-5 py-3.5">
                              <a href={g.source_url} target="_blank" rel="noopener" class="text-brand-300 font-semibold hover:underline">
                                {g.source_domain}
                              </a>
                              <div class="text-[11px] text-white/30 truncate max-w-[260px] mt-0.5">{g.source_url}</div>
                            </td>
                            <td class="px-5 py-3.5 hidden md:table-cell">
                              <div class="text-white font-semibold">{g.competitor_domain}</div>
                              <div class="text-[11px] text-white/50">DR {g.competitor_rank}</div>
                            </td>
                            <td class="px-5 py-3.5 hidden md:table-cell text-white/70 truncate max-w-[200px]" title={g.anchor}>
                              {g.anchor}
                            </td>
                            <td class="px-5 py-3.5 text-center">
                              <span class={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-lg text-xs font-extrabold border ${
                                g.source_rank >= 70 ? 'bg-accent/20 border-accent/40 text-accent'
                                : g.source_rank >= 50 ? 'bg-brand/20 border-brand/40 text-brand-300'
                                : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                              }`}>{g.source_rank}</span>
                            </td>
                          </tr>
                        ))}
                        {hiddenGap.slice(0, 3).map((g) => (
                          <tr class="relative select-none">
                            <td class="px-5 py-3.5 blur-sm">
                              <div class="font-semibold text-white/40">{g.source_domain}</div>
                            </td>
                            <td class="px-5 py-3.5 hidden md:table-cell text-white/30 blur-sm">{g.competitor_domain}</td>
                            <td class="px-5 py-3.5 hidden md:table-cell text-white/30 blur-sm">{g.anchor}</td>
                            <td class="px-5 py-3.5 text-center blur-sm">
                              <span class="inline-block min-w-[2.5rem] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/40">{g.source_rank}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hiddenGap.length > 0 && (
                    <div class="p-4 text-center text-sm text-white/70 bg-amber-500/[0.05] border-t border-amber-400/15">
                      <i class="fas fa-lock mr-1.5 text-amber-300"></i>
                      <b class="text-white">{hiddenGap.length}개</b>의 경쟁사 링크 기회가 더 있습니다 ·
                      <a href="/pricing" class="text-brand-300 font-bold hover:underline ml-1">Pro로 전체 보기 →</a>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ==================== 키워드 갭 ==================== */}
          {kwGaps.length > 0 && (
            <section class="mb-10">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-warn to-amber-600 text-white text-[10px] font-extrabold tracking-wider uppercase">GAP</span>
                    <div class="text-xs uppercase tracking-widest text-white/50 font-bold">키워드 기회</div>
                  </div>
                  <h2 class="text-2xl md:text-3xl font-extrabold text-white">
                    <i class="fas fa-bullseye text-warn mr-2"></i>
                    경쟁사가 잡은 키워드 · 우리가 놓친
                  </h2>
                  <div class="text-sm text-white/50 mt-1.5">
                    <b class="text-white">{kwGaps[0]?.competitor_domain}</b>는 랭크되어 있지만 <b class="text-white">{scan.domain}</b>는 놓친 키워드 · 검색량 정렬
                  </div>
                </div>
                <div class="text-right hidden md:block">
                  <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">기회 키워드</div>
                  <div class="text-3xl font-extrabold text-warn mt-1">{kwGaps.length}<span class="text-base text-white/40 ml-1">개</span></div>
                </div>
              </div>

              <div class="bento-card rounded-3xl overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-white/[0.03] text-white/50 text-[10px] uppercase tracking-widest">
                      <tr>
                        <th class="text-left px-5 py-3 w-12 font-bold">#</th>
                        <th class="text-left px-5 py-3 font-bold">키워드</th>
                        <th class="text-right px-5 py-3 w-28 font-bold">월 검색량</th>
                        <th class="text-center px-5 py-3 w-24 font-bold">난이도</th>
                        <th class="text-center px-5 py-3 w-24 font-bold">경쟁 순위</th>
                        <th class="text-right px-5 py-3 w-24 hidden md:table-cell font-bold">CPC</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                      {visibleKwGaps.map((k, i) => {
                        const diffColor =
                          k.keyword_difficulty >= 70 ? 'bg-warn/20 border-warn/40 text-warn'
                          : k.keyword_difficulty >= 40 ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                          : 'bg-accent/20 border-accent/40 text-accent'
                        const rankColor =
                          k.competitor_rank <= 3 ? 'bg-accent/20 border-accent/40 text-accent'
                          : k.competitor_rank <= 10 ? 'bg-brand/20 border-brand/40 text-brand-300'
                          : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                        return (
                          <tr class="hover:bg-white/[0.04] transition-colors">
                            <td class="px-5 py-3.5 text-white/30 tabular-nums font-mono">{i + 1}</td>
                            <td class="px-5 py-3.5 font-semibold text-white">
                              {k.keyword}
                              {k.our_rank && (
                                <span class="ml-2 text-[11px] text-white/40">(우리 {k.our_rank}위)</span>
                              )}
                            </td>
                            <td class="px-5 py-3.5 text-right tabular-nums text-white font-bold font-mono">{formatNumber(k.search_volume)}</td>
                            <td class="px-5 py-3.5 text-center">
                              <span class={`inline-block min-w-[2.5rem] px-2 py-0.5 rounded-lg text-xs font-extrabold border ${diffColor}`}>
                                {k.keyword_difficulty || '-'}
                              </span>
                            </td>
                            <td class="px-5 py-3.5 text-center">
                              <span class={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-lg text-xs font-extrabold border ${rankColor}`}>{k.competitor_rank}위</span>
                            </td>
                            <td class="px-5 py-3.5 text-right tabular-nums text-white/60 hidden md:table-cell font-mono">
                              {k.cpc > 0 ? `$${k.cpc.toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        )
                      })}
                      {hiddenKwGaps.slice(0, 5).map((k, i) => (
                        <tr class="relative select-none">
                          <td class="px-5 py-3.5 text-white/30 tabular-nums font-mono">{FREE_KWGAP_ROWS + i + 1}</td>
                          <td class="px-5 py-3.5 font-semibold text-white/30 blur-sm">{k.keyword}</td>
                          <td class="px-5 py-3.5 text-right blur-sm text-white/30">{formatNumber(k.search_volume)}</td>
                          <td class="px-5 py-3.5 text-center blur-sm">••</td>
                          <td class="px-5 py-3.5 text-center blur-sm">••</td>
                          <td class="px-5 py-3.5 text-right blur-sm hidden md:table-cell text-white/30">••••</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hiddenKwGaps.length > 0 && (
                  <div class="p-4 text-center text-sm text-white/70 bg-white/[0.02] border-t border-white/10">
                    <i class="fas fa-lock mr-1.5 text-amber-300"></i>
                    <b class="text-white">{hiddenKwGaps.length}개</b>의 키워드 기회가 더 있습니다 ·
                    <a href="/pricing" class="text-brand-300 font-bold hover:underline ml-1">Pro로 전체 보기 →</a>
                  </div>
                )}
              </div>

              {!scan.is_gated && kwGaps.length > 0 && (
                <div class="mt-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] to-warn/[0.08] border border-amber-400/20 text-sm text-white/80">
                  <i class="fas fa-lightbulb mr-2 text-amber-300"></i>
                  <b class="text-white">기회 요약</b> · 경쟁사가 잡은 TOP 30 중 <b class="text-amber-300">{kwGaps.length}개</b>를 우리는 놓침.
                  월 총 검색량 <b class="text-accent">{formatNumber(kwGaps.reduce((s, k) => s + k.search_volume, 0))}회</b>.
                  상위 5개 키워드로 콘텐츠 만드는 것부터 시작하세요.
                </div>
              )}
            </section>
          )}

          {/* ==================== 롱테일 (옵션 A+B) ==================== */}
          <section class="mb-10">
            <div class="flex items-center justify-between mb-5">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-accent to-emerald-700 text-white text-[10px] font-extrabold tracking-wider uppercase">A+B</span>
                  <div class="text-xs uppercase tracking-widest text-white/50 font-bold">지역 롱테일</div>
                </div>
                <h2 class="text-2xl md:text-3xl font-extrabold text-white">
                  <i class="fas fa-compass text-accent mr-2"></i>
                  롱테일 키워드 발견
                </h2>
                <div class="text-sm text-white/50 mt-1.5 max-w-3xl">
                  "홍성 라미네이트" 같은 <b class="text-white">지역×진료 롱테일</b>은 DataForSEO DB에 없어 누락됩니다.<br class="hidden md:inline" />
                  Sitemap 역추적 + 한국 250개 지역 매트릭스로 <b class="text-accent">실제 Google 순위</b>를 직접 측정.
                </div>
              </div>
              {!scan.is_gated && longtailMeta && (
                <div class="text-right hidden md:block">
                  <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">발견된 롱테일</div>
                  <div class="text-3xl font-extrabold text-accent mt-1">{longtail.length}<span class="text-base text-white/40 ml-1">개</span></div>
                </div>
              )}
            </div>

            {/* 롱테일 스캔 시작 CTA */}
            {!longtailMeta && !scan.is_gated && (
              <div class="bento-card rounded-3xl p-7 border border-accent/20 bg-gradient-to-br from-accent/[0.05] via-transparent to-brand/[0.05]">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div class="flex-1">
                    <div class="text-xl font-extrabold text-white mb-3">
                      <i class="fas fa-radar text-accent mr-2"></i>
                      롱테일 스캔 실행
                    </div>
                    <ul class="text-sm text-white/70 space-y-2">
                      <li class="flex items-start gap-2"><i class="fas fa-check text-accent mt-0.5"></i><span>sitemap.xml 전체 파싱 → URL 슬러그에서 한글 키워드 역추출</span></li>
                      <li class="flex items-start gap-2"><i class="fas fa-check text-accent mt-0.5"></i><span>한국 주요 30개 지역 × 10개 진료과 매트릭스 생성</span></li>
                      <li class="flex items-start gap-2"><i class="fas fa-check text-accent mt-0.5"></i><span>키워드 200개 실측 Google 검색 → 순위 측정 (1~2분)</span></li>
                    </ul>
                  </div>
                  <button
                    id="longtail-btn"
                    type="button"
                    data-scan-id={scan.scanId}
                    class="group relative px-6 py-3.5 rounded-xl bg-gradient-to-br from-accent via-emerald-500 to-emerald-700 text-white text-sm font-extrabold whitespace-nowrap shadow-glow-accent hover:shadow-glow-accent-lg transition-all overflow-hidden">
                    <i class="fas fa-play mr-2"></i>롱테일 스캔 시작
                  </button>
                </div>
                <div id="longtail-status" class="mt-4 text-sm text-white/70 hidden"></div>
              </div>
            )}

            {/* 비회원 게이팅 */}
            {scan.is_gated && (
              <div class="bento-card rounded-3xl p-8 text-center">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <i class="fas fa-lock text-2xl text-white/30"></i>
                </div>
                <div class="text-lg font-extrabold text-white">Google 로그인 후 롱테일 스캔 가능</div>
                <div class="text-sm text-white/50 mt-2">상단 "로그인" 버튼으로 Google 계정 연결 후 지역 롱테일까지 확인</div>
              </div>
            )}

            {/* 롱테일 결과 */}
            {longtailMeta && (
              <>
                {/* ====== 키워드 자산 흐름 시각화 (메인 + 롱테일 = 총 자산) ====== */}
                {(() => {
                  const mainCount = scan.keyword_count || 0
                  const ltCount = longtail.length
                  const totalAsset = mainCount + ltCount
                  const mainPct = totalAsset > 0 ? (mainCount / totalAsset) * 100 : 50
                  const ltPct = totalAsset > 0 ? (ltCount / totalAsset) * 100 : 50
                  const sitemapPct = ltCount > 0 ? (longtailFromSitemap.length / ltCount) * 100 : 0
                  const matrixPct = ltCount > 0 ? (longtailFromMatrix.length / ltCount) * 100 : 0
                  // 검색량 합계 (롱테일은 search_volume이 null인 경우가 많음)
                  const ltVolume = longtail.reduce((s, k) => s + (k.search_volume || 0), 0)
                  const ltMissingVolume = longtail.filter(k => !k.search_volume).length

                  return (
                    <div class="bento-card rounded-3xl p-6 md:p-7 mb-5 relative overflow-hidden">
                      <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 pointer-events-none"
                           style="background: radial-gradient(circle, rgba(0,208,132,0.4) 0%, transparent 65%); filter: blur(70px);"></div>
                      <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-25 pointer-events-none"
                           style="background: radial-gradient(circle, rgba(0,102,255,0.4) 0%, transparent 65%); filter: blur(70px);"></div>

                      <div class="relative">
                        <div class="flex items-center justify-between mb-5">
                          <div>
                            <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">키워드 자산 흐름</div>
                            <div class="text-xl font-extrabold text-white mt-1">
                              <i class="fas fa-diagram-project text-accent mr-2"></i>
                              발견 경로 → 키워드 → 트래픽
                            </div>
                            <div class="text-xs text-white/50 mt-1.5">
                              총 <b class="text-white">{totalAsset}개</b> 키워드 자산 ·
                              <b class="text-accent ml-1">+{ltCount}</b> 숨겨진 롱테일 추가 발견
                            </div>
                          </div>
                          <span class="hidden md:inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-emerald-700 items-center justify-center text-white shadow-glow-accent">
                            <i class="fas fa-stream text-sm"></i>
                          </span>
                        </div>

                        {/* Sankey 스타일 흐름도 (3 컬럼) */}
                        <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 lg:gap-2 items-stretch">
                          {/* COL 1: 발견 경로 */}
                          <div class="space-y-2.5">
                            <div class="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1.5">SOURCE · 발견 경로</div>
                            <div class="p-4 rounded-2xl bg-brand/10 border border-brand/25 hover:bg-brand/15 transition-all">
                              <div class="flex items-center justify-between mb-1.5">
                                <span class="text-xs font-bold text-brand-300 uppercase tracking-wider">DataForSEO</span>
                                <span class="text-[10px] text-white/40 font-mono">SERP</span>
                              </div>
                              <div class="text-2xl font-extrabold text-white">{mainCount}<span class="text-xs text-white/40 ml-1">개</span></div>
                              <div class="text-[10px] text-white/50 mt-0.5">메인 DB 키워드</div>
                            </div>
                            <div class="p-4 rounded-2xl bg-accent/10 border border-accent/25 hover:bg-accent/15 transition-all">
                              <div class="flex items-center justify-between mb-1.5">
                                <span class="text-xs font-bold text-accent uppercase tracking-wider">Sitemap</span>
                                <span class="text-[10px] text-white/40 font-mono">{longtailMeta.total_urls_crawled} URL</span>
                              </div>
                              <div class="text-2xl font-extrabold text-white">{longtailFromSitemap.length}<span class="text-xs text-white/40 ml-1">개</span></div>
                              <div class="text-[10px] text-white/50 mt-0.5">슬러그 역추적</div>
                            </div>
                            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 hover:bg-emerald-500/15 transition-all">
                              <div class="flex items-center justify-between mb-1.5">
                                <span class="text-xs font-bold text-emerald-300 uppercase tracking-wider">지역×진료</span>
                                <span class="text-[10px] text-white/40 font-mono">매트릭스</span>
                              </div>
                              <div class="text-2xl font-extrabold text-white">{longtailFromMatrix.length}<span class="text-xs text-white/40 ml-1">개</span></div>
                              <div class="text-[10px] text-white/50 mt-0.5">{longtailMeta.total_candidates}개 후보 중</div>
                            </div>
                          </div>

                          {/* 흐름 화살표 */}
                          <div class="hidden lg:flex items-center justify-center">
                            <div class="relative w-16 h-full flex items-center justify-center">
                              <div class="absolute inset-y-0 left-0 w-full overflow-hidden opacity-30">
                                <svg viewBox="0 0 64 200" preserveAspectRatio="none" class="w-full h-full">
                                  <path d="M0 30 Q32 30 64 100" stroke="url(#flow1)" stroke-width="3" fill="none" />
                                  <path d="M0 100 L64 100" stroke="url(#flow2)" stroke-width="4" fill="none" />
                                  <path d="M0 170 Q32 170 64 100" stroke="url(#flow3)" stroke-width="3" fill="none" />
                                  <defs>
                                    <linearGradient id="flow1" x1="0" x2="1"><stop offset="0" stop-color="#0066FF" /><stop offset="1" stop-color="#00D084" /></linearGradient>
                                    <linearGradient id="flow2" x1="0" x2="1"><stop offset="0" stop-color="#00D084" /><stop offset="1" stop-color="#00D084" /></linearGradient>
                                    <linearGradient id="flow3" x1="0" x2="1"><stop offset="0" stop-color="#34D399" /><stop offset="1" stop-color="#00D084" /></linearGradient>
                                  </defs>
                                </svg>
                              </div>
                              <i class="fas fa-arrow-right text-accent text-2xl relative z-10 animate-pulse"></i>
                            </div>
                          </div>

                          {/* COL 2: 통합 자산 (도넛 + 합계) */}
                          <div class="flex flex-col">
                            <div class="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1.5 text-center">ASSET · 키워드 자산</div>
                            <div class="flex-1 p-5 rounded-2xl bg-gradient-to-br from-slate-950/60 to-slate-900/60 border border-white/15 backdrop-blur-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                              <div class="absolute inset-0 stars-grid opacity-30"></div>
                              <div class="relative">
                                <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">총 키워드 자산</div>
                                <div class="text-6xl md:text-7xl font-black tracking-tighter text-gradient-aurora leading-none mt-2" style="text-shadow: 0 4px 30px rgba(0,208,132,0.3);">
                                  {totalAsset}
                                </div>
                                <div class="text-xs text-white/50 mt-2">개 키워드</div>

                                {/* 비율 막대 */}
                                <div class="mt-5 w-full max-w-xs mx-auto">
                                  <div class="flex items-center justify-between text-[10px] mb-1.5">
                                    <span class="text-brand-300 font-bold">메인 {mainCount}</span>
                                    <span class="text-accent font-bold">롱테일 +{ltCount}</span>
                                  </div>
                                  <div class="h-2 rounded-full bg-white/5 overflow-hidden flex">
                                    <div class="h-full bg-gradient-to-r from-brand to-brand-700" style={`width:${mainPct}%`}></div>
                                    <div class="h-full bg-gradient-to-r from-accent to-emerald-500" style={`width:${ltPct}%`}></div>
                                  </div>
                                  <div class="mt-2 text-[10px] text-white/40">
                                    {Math.round(ltPct)}%가 DataForSEO에 <b class="text-amber-300">없는 숨은 자산</b>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 흐름 화살표 */}
                          <div class="hidden lg:flex items-center justify-center">
                            <div class="relative w-16 h-full flex items-center justify-center">
                              <i class="fas fa-arrow-right text-amber-300 text-2xl animate-pulse" style="animation-delay: 0.5s;"></i>
                            </div>
                          </div>

                          {/* COL 3: 트래픽 결과 */}
                          <div class="space-y-2.5">
                            <div class="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1.5">TRAFFIC · 자연 유입</div>
                            <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-400/30">
                              <div class="flex items-center justify-between mb-1.5">
                                <span class="text-xs font-bold text-amber-300 uppercase tracking-wider">월 추정 유입</span>
                                <i class="fas fa-bolt text-amber-300"></i>
                              </div>
                              <div class="text-2xl font-extrabold text-white">{formatNumber(scan.estimated_traffic)}<span class="text-xs text-white/40 ml-1">명/월</span></div>
                              <div class="text-[10px] text-white/50 mt-0.5">메인 키워드 기준</div>
                            </div>
                            <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-accent/10 border border-emerald-400/30">
                              <div class="flex items-center justify-between mb-1.5">
                                <span class="text-xs font-bold text-emerald-300 uppercase tracking-wider">롱테일 검색량</span>
                                <i class="fas fa-magnifying-glass-plus text-emerald-300"></i>
                              </div>
                              <div class="text-2xl font-extrabold text-white">{formatNumber(ltVolume)}<span class="text-xs text-white/40 ml-1">/월</span></div>
                              <div class="text-[10px] text-white/50 mt-0.5">{ltMissingVolume}개는 DB 누락</div>
                            </div>
                            <div class="p-4 rounded-2xl bg-gradient-to-br from-brand/15 to-purple-500/10 border border-brand/30">
                              <div class="flex items-center justify-between mb-1.5">
                                <span class="text-xs font-bold text-brand-300 uppercase tracking-wider">광고비 절감</span>
                                <i class="fas fa-coins text-brand-300"></i>
                              </div>
                              <div class="text-2xl font-extrabold text-white">${(ltCount * 1.2).toFixed(0)}<span class="text-xs text-white/40 ml-1">/월</span></div>
                              <div class="text-[10px] text-white/50 mt-0.5">롱테일 자연 유입 환산</div>
                            </div>
                          </div>
                        </div>

                        {/* 푸터 메타 */}
                        <div class="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/50">
                          <span><i class="fas fa-sitemap mr-1.5 text-brand-300"></i>{longtailMeta.sitemap_url ? 'Sitemap 발견' : 'Sitemap 없음'}</span>
                          <span><i class="fas fa-satellite-dish mr-1.5 text-emerald-300"></i>후보 {longtailMeta.total_candidates}개 스캔</span>
                          <span><i class="fas fa-coins mr-1.5 text-amber-300"></i>API 비용 ${longtailMeta.total_cost.toFixed(2)}</span>
                          <span class="ml-auto text-accent font-bold"><i class="fas fa-shield-check mr-1.5"></i>실측 Google SERP</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {longtail.length > 0 ? (
                  <div class="bento-card rounded-3xl overflow-hidden">
                    <div class="p-6 border-b border-white/10">
                      <div class="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">실측 결과</div>
                      <div class="text-xl font-extrabold text-white">
                        <i class="fas fa-map-marker-alt text-accent mr-2"></i>
                        지역×진료 롱테일 랭킹
                      </div>
                      <div class="text-[11px] text-white/50 mt-1">
                        Sitemap {longtailFromSitemap.length}개 · 매트릭스 {longtailFromMatrix.length}개 · 순위 오름차순
                      </div>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead class="bg-white/[0.03] text-white/50 text-[10px] uppercase tracking-widest">
                          <tr>
                            <th class="text-left px-5 py-3 w-12 font-bold">#</th>
                            <th class="text-left px-5 py-3 font-bold">키워드</th>
                            <th class="text-center px-5 py-3 w-20 font-bold">순위</th>
                            <th class="text-right px-5 py-3 w-24 hidden md:table-cell font-bold">검색량</th>
                            <th class="text-center px-5 py-3 w-24 hidden md:table-cell font-bold">발견 경로</th>
                            <th class="text-left px-5 py-3 hidden lg:table-cell font-bold">랭크 URL</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                          {longtail.map((k, i) => {
                            const rankBadge =
                              (k.rank ?? 999) <= 3 ? 'bg-accent/20 border-accent/40 text-accent'
                              : (k.rank ?? 999) <= 10 ? 'bg-brand/20 border-brand/40 text-brand-300'
                              : (k.rank ?? 999) <= 30 ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                              : 'bg-white/5 border-white/10 text-white/60'
                            const sourceBadge =
                              k.source === 'sitemap'
                                ? 'bg-accent/15 border-accent/30 text-accent'
                                : 'bg-brand/15 border-brand/30 text-brand-300'
                            const sourceLabel = k.source === 'sitemap' ? 'Sitemap' : '지역×진료'
                            return (
                              <tr class="hover:bg-white/[0.04] transition-colors">
                                <td class="px-5 py-3.5 text-white/30 tabular-nums font-mono">{i + 1}</td>
                                <td class="px-5 py-3.5 font-semibold text-white">{k.keyword}</td>
                                <td class="px-5 py-3.5 text-center">
                                  <span class={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-lg text-xs font-extrabold border ${rankBadge}`}>
                                    {k.rank}위
                                  </span>
                                </td>
                                <td class="px-5 py-3.5 text-right tabular-nums text-white/80 hidden md:table-cell font-mono">
                                  {k.search_volume ? formatNumber(k.search_volume) : <span class="text-white/30 text-xs">미측정</span>}
                                </td>
                                <td class="px-5 py-3.5 text-center hidden md:table-cell">
                                  <span class={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${sourceBadge}`}>{sourceLabel}</span>
                                </td>
                                <td class="px-5 py-3.5 hidden lg:table-cell">
                                  {k.ranked_url ? (
                                    <a href={k.ranked_url} target="_blank" rel="noopener" class="text-brand-300 hover:text-brand-200 hover:underline text-xs break-all">
                                      {k.ranked_url.length > 50 ? k.ranked_url.slice(0, 50) + '...' : k.ranked_url}
                                    </a>
                                  ) : (
                                    <span class="text-white/30 text-xs">—</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div class="bento-card rounded-3xl p-8 text-center">
                    <i class="fas fa-search text-3xl text-white/20 mb-3"></i>
                    <div class="text-sm text-white/70">후보 {longtailMeta.total_candidates}개 중 Google TOP 100 내 롱테일 없음</div>
                    <div class="text-xs text-white/50 mt-1">다른 진료과·지역 조합으로 재시도</div>
                  </div>
                )}

                {longtail.length > 0 && (
                  <div class="mt-4 p-5 rounded-2xl bg-gradient-to-r from-accent/[0.08] to-brand/[0.08] border border-accent/20 text-sm text-white/80">
                    <i class="fas fa-lightbulb mr-2 text-accent"></i>
                    <b class="text-white">롱테일 요약</b> · 기존 {scan.keyword_count}개 TOP 100 키워드에 <b class="text-accent">{longtail.length}개의 숨겨진 지역 롱테일</b>이 추가되었습니다.
                    DataForSEO DB에 검색량이 없지만 실제로 랭킹돼서 트래픽 가져오는 키워드들.
                  </div>
                )}
              </>
            )}

            {/* ============= 옵션 C: GSC 직접 연동 (Premium) — 풀 리뉴얼 ============= */}
            {!scan.is_gated && (
              <div
                id="gsc-card"
                class="mt-8 relative overflow-hidden rounded-3xl border-2 border-amber-400/30 p-7 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950/40"
                data-scan-id={scan.scanId}
                style="box-shadow: 0 30px 80px -20px rgba(251,191,36,0.25), inset 0 1px 0 rgba(255,255,255,0.08);">

                {/* 다층 글로우 + 별 그리드 */}
                <div class="absolute inset-0 stars-grid opacity-50 pointer-events-none"></div>
                <div class="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-50 pointer-events-none"
                     style="background: radial-gradient(circle, rgba(251,191,36,0.45) 0%, transparent 65%); filter: blur(70px);"></div>
                <div class="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full opacity-40 pointer-events-none"
                     style="background: radial-gradient(circle, rgba(0,102,255,0.45) 0%, transparent 65%); filter: blur(70px);"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 pointer-events-none"
                     style="background: conic-gradient(from 0deg, transparent, rgba(251,191,36,0.3), transparent, rgba(0,102,255,0.3), transparent); animation: auroraSpin 30s linear infinite;"></div>

                <div class="relative">
                  {/* 헤더 */}
                  <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-3 flex-wrap">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-900 text-[10px] font-extrabold tracking-wider uppercase shadow-lg shadow-amber-500/40">
                          <i class="fas fa-crown text-[10px]"></i>PREMIUM
                        </span>
                        <span class="px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-400/30 text-rose-300 text-[10px] font-extrabold tracking-wider uppercase">
                          <i class="fas fa-fire mr-1"></i>가장 정확한 데이터
                        </span>
                        {isGscUnlocked ? (
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold tracking-wider uppercase">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>UNLOCKED · 즉시 사용 가능
                          </span>
                        ) : (
                          <span class="text-[11px] text-white/40 font-bold ml-1">Pro / Agency 전용</span>
                        )}
                      </div>
                      <div class="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                        <span class="inline-block w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white align-middle mr-2.5 shadow-lg" style="background-image: conic-gradient(from -45deg, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4); padding: 7px;">
                          <span class="block w-full h-full rounded-md bg-slate-950 flex items-center justify-center">
                            <i class="fab fa-google text-amber-300"></i>
                          </span>
                        </span>
                        Google Search Console
                        <span class="block text-base md:text-lg lg:text-xl text-amber-300 font-bold mt-1.5">
                          <i class="fas fa-arrow-right text-xs mr-1"></i>실제 노출된 모든 검색어 직접 가져오기
                        </span>
                      </div>
                      <div class="text-sm md:text-[15px] text-white/70 mt-3 max-w-2xl leading-relaxed">
                        원장님 GSC 계정 연결만 하면 구글이 직접 알려준 <b class="text-amber-300">실제 노출 검색어 최대 25,000개</b> 즉시 수집.<br class="hidden md:inline" />
                        DataForSEO 샘플링 없이 <b class="text-white">100% 실측 데이터</b> · 우리가 못 잡은 키워드까지 자동 추출.
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
                      <button
                        id="gsc-connect-btn"
                        type="button"
                        class="group relative hidden px-5 py-3.5 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-900 text-sm font-extrabold whitespace-nowrap shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 transition-all overflow-hidden">
                        <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                        <span class="relative"><i class="fab fa-google mr-2"></i>GSC 계정 연결</span>
                      </button>
                      <button
                        id="gsc-sync-btn"
                        type="button"
                        class="hidden px-5 py-3.5 rounded-xl bg-gradient-to-br from-emerald-400 to-accent hover:from-emerald-300 hover:to-accent text-slate-900 text-sm font-extrabold whitespace-nowrap shadow-lg shadow-emerald-500/40 transition-all">
                        <i class="fas fa-sync mr-2"></i>키워드 동기화
                      </button>
                      <button
                        id="gsc-disconnect-btn"
                        type="button"
                        class="hidden px-3 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs whitespace-nowrap transition-all"
                        title="GSC 연결 해제">
                        <i class="fas fa-unlink"></i>
                      </button>
                      <a
                        id="gsc-upgrade-btn"
                        href="/pricing"
                        class="group relative hidden px-5 py-3.5 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-900 text-sm font-extrabold whitespace-nowrap shadow-lg shadow-amber-500/40 transition-all overflow-hidden">
                        <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                        <span class="relative"><i class="fas fa-crown mr-2"></i>Pro 플랜 업그레이드</span>
                      </a>
                    </div>
                  </div>

                  {/* GSC 차별점 3 박스 */}
                  <div class="grid md:grid-cols-3 gap-3 mb-6">
                    {[
                      { icon: 'fa-eye', label: '실제 노출 데이터', value: '25,000개', detail: 'DataForSEO 샘플링 한계 돌파', color: 'amber' },
                      { icon: 'fa-bullseye', label: '평균 순위 정확도', value: '소수점', detail: '실측 평균 순위 (1.0 ~ 100+)', color: 'brand' },
                      { icon: 'fa-magnifying-glass-dollar', label: '놓친 키워드 추출', value: '자동', detail: '노출은 됐는데 우리가 못 잡은 것', color: 'emerald' },
                    ].map((b) => {
                      const cm: Record<string, { text: string; bg: string; border: string }> = {
                        amber:   { text: 'text-amber-300',  bg: 'bg-amber-500/10',  border: 'border-amber-400/25' },
                        brand:   { text: 'text-brand-300',  bg: 'bg-brand/10',      border: 'border-brand/25' },
                        emerald: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-400/25' },
                      }
                      const c = cm[b.color]
                      return (
                        <div class={`p-4 rounded-2xl ${c.bg} border ${c.border} backdrop-blur-sm`}>
                          <div class="flex items-center gap-2.5">
                            <span class={`w-9 h-9 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-center ${c.text}`}>
                              <i class={`fas ${b.icon}`}></i>
                            </span>
                            <div class="flex-1 min-w-0">
                              <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">{b.label}</div>
                              <div class={`text-lg font-extrabold ${c.text}`}>{b.value}</div>
                            </div>
                          </div>
                          <div class="text-[11px] text-white/55 mt-2">{b.detail}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* GSC 미리보기 Mockup — ADMIN/Pro/Agency는 unlocked 안내, 그 외는 잠금 mockup */}
                  {!isGscUnlocked ? (
                    <div id="gsc-mockup" class="relative rounded-2xl bg-gradient-to-br from-slate-950/80 to-slate-900/80 border border-white/10 overflow-hidden mb-2 backdrop-blur-sm">
                      <div class="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <div class="flex items-center gap-2">
                          <span class="flex gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-rose-400/60"></span>
                            <span class="w-2.5 h-2.5 rounded-full bg-amber-400/60"></span>
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/60"></span>
                          </span>
                          <span class="text-[11px] text-white/40 font-mono ml-2">search.google.com/search-console/performance</span>
                        </div>
                        <span class="text-[10px] text-white/30 font-bold">PREVIEW</span>
                      </div>
                      <div class="relative p-5">
                        <div class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950/85 via-slate-950/70 to-slate-900/85 backdrop-blur-[3px]">
                          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 shadow-2xl shadow-amber-500/40 mb-4 ring-4 ring-amber-400/20">
                            <i class="fas fa-lock text-2xl"></i>
                          </div>
                          <div class="text-lg md:text-xl font-extrabold text-white mb-1.5 text-center px-4">Premium 플랜에서 즉시 활성화</div>
                          <div class="text-xs text-white/60 text-center max-w-md px-4">GSC 계정만 연결하면 아래처럼 실측 데이터가 바로 표시됩니다 · 평균 활성화 시간 30초</div>
                          <a href="/pricing" class="mt-5 group relative px-6 py-3 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-900 text-sm font-extrabold shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 transition-all overflow-hidden">
                            <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                            <span class="relative"><i class="fas fa-crown mr-2"></i>Pro 플랜 업그레이드 →</span>
                          </a>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 blur-[2px] select-none">
                          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10">
                            <div class="text-[10px] uppercase text-white/50 font-bold">총 키워드</div>
                            <div class="text-2xl font-extrabold text-white mt-1">12,847</div>
                          </div>
                          <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30">
                            <div class="text-[10px] uppercase text-amber-200 font-bold">놓친 키워드</div>
                            <div class="text-2xl font-extrabold text-amber-300 mt-1">2,341</div>
                          </div>
                          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10">
                            <div class="text-[10px] uppercase text-white/50 font-bold">놓친 노출</div>
                            <div class="text-2xl font-extrabold text-white mt-1">187,230</div>
                          </div>
                          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10">
                            <div class="text-[10px] uppercase text-white/50 font-bold">기간</div>
                            <div class="text-xs font-bold text-white mt-2">최근 90일</div>
                          </div>
                        </div>
                        <div class="space-y-1.5 blur-[2px] select-none">
                          {[
                            { kw: '강남 임플란트 가격', imp: '8,420', clk: '124', ctr: '1.5%', pos: '14.2' },
                            { kw: '치아 미백 비용', imp: '5,230', clk: '67', ctr: '1.3%', pos: '18.7' },
                            { kw: '서초 라미네이트', imp: '3,840', clk: '92', ctr: '2.4%', pos: '11.4' },
                            { kw: '치아교정 기간', imp: '2,910', clk: '41', ctr: '1.4%', pos: '22.1' },
                          ].map((r) => (
                            <div class="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 rounded-lg bg-white/[0.02] text-xs text-white/60">
                              <span class="font-bold text-white">{r.kw}</span>
                              <span class="font-mono">{r.imp}</span>
                              <span class="font-mono">{r.clk}</span>
                              <span class="font-mono">{r.ctr}</span>
                              <span class="font-mono text-amber-300">{r.pos}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ADMIN / Pro / Agency: unlocked 안내 카드 */
                    <div class="relative rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/[0.08] via-accent/[0.05] to-transparent p-5 mb-2 overflow-hidden">
                      <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-40 pointer-events-none"
                           style="background: radial-gradient(circle, rgba(0,208,132,0.4) 0%, transparent 65%); filter: blur(50px);"></div>
                      <div class="relative flex flex-col md:flex-row md:items-center gap-4">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                          <span class="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-accent flex items-center justify-center text-slate-900 shadow-glow-accent ring-2 ring-emerald-300/40">
                            <i class="fas fa-unlock-keyhole text-lg"></i>
                          </span>
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                              <span class="px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-400 to-accent text-slate-900 text-[10px] font-black tracking-wider uppercase">UNLOCKED</span>
                              {viewer?.is_admin === 1 && (
                                <span class="px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-400 to-amber-400 text-slate-900 text-[10px] font-black tracking-wider uppercase">
                                  <i class="fas fa-shield-halved mr-1"></i>ADMIN
                                </span>
                              )}
                              {viewer?.plan && viewer.plan !== 'free' && viewer.is_admin !== 1 && (
                                <span class="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase">
                                  <i class="fas fa-crown mr-1"></i>{viewer.plan}
                                </span>
                              )}
                            </div>
                            <div class="text-base md:text-lg font-extrabold text-white mt-1.5">
                              {viewer?.is_admin === 1 ? '운영자 권한 — GSC 풀 액세스' : 'Pro 플랜 — GSC 풀 액세스'}
                            </div>
                            <div class="text-xs text-white/60 mt-0.5 truncate">
                              {viewer?.email} · 우측 <b class="text-emerald-300">"GSC 계정 연결"</b> 버튼으로 즉시 시작
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-white/70 md:flex-shrink-0">
                          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <i class="fas fa-eye text-amber-300"></i>25,000 검색어
                          </span>
                          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <i class="fas fa-bullseye text-emerald-300"></i>실측 100%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 사이트 선택 패널 */}
                  <div id="gsc-sites-panel" class="mt-6 hidden">
                    <div class="text-[11px] text-white/60 mb-2 font-bold uppercase tracking-wider">
                      <i class="fas fa-globe text-amber-300 mr-1.5"></i>동기화할 사이트 선택 (GSC 등록 도메인)
                    </div>
                    <div class="flex flex-col md:flex-row gap-2">
                      <select id="gsc-site-select" class="flex-1 px-4 py-3.5 rounded-xl bg-slate-950/60 border border-white/15 focus:border-amber-400 text-white text-sm outline-none transition-all">
                        <option value="">불러오는 중...</option>
                      </select>
                      <button
                        id="gsc-run-sync-btn"
                        type="button"
                        class="px-5 py-3.5 rounded-xl bg-gradient-to-br from-emerald-400 to-accent text-slate-900 text-sm font-extrabold whitespace-nowrap shadow-lg shadow-emerald-500/40 transition-all">
                        <i class="fas fa-bolt mr-1.5"></i>동기화 실행
                      </button>
                    </div>
                    <div id="gsc-sync-status" class="mt-3 text-sm text-white/70 hidden"></div>
                  </div>

                  {/* 결과 패널 (실제 동기화 후) */}
                  <div id="gsc-result-panel" class="mt-6 hidden">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">GSC 총 키워드</div>
                        <div id="gsc-total-rows" class="text-2xl font-extrabold text-white mt-1.5">—</div>
                      </div>
                      <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 backdrop-blur-sm">
                        <div class="text-[10px] uppercase tracking-widest text-amber-200 font-bold">
                          <i class="fas fa-eye mr-1"></i>놓친 키워드
                        </div>
                        <div id="gsc-new-found" class="text-2xl font-extrabold text-amber-300 mt-1.5">—</div>
                      </div>
                      <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-400/30 backdrop-blur-sm">
                        <div class="text-[10px] uppercase tracking-widest text-rose-200 font-bold">
                          <i class="fas fa-fire mr-1"></i>놓친 노출수
                        </div>
                        <div id="gsc-missed-impressions" class="text-2xl font-extrabold text-rose-300 mt-1.5">—</div>
                      </div>
                      <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div class="text-[10px] uppercase tracking-widest text-white/50 font-bold">데이터 기간</div>
                        <div id="gsc-date-range" class="text-xs font-bold text-white mt-2">—</div>
                      </div>
                    </div>

                    <div class="rounded-2xl bg-slate-950/40 border border-white/10 overflow-hidden backdrop-blur-sm">
                      <div class="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-amber-500/[0.04]">
                        <div class="text-sm font-extrabold text-white">
                          <i class="fas fa-crosshairs text-amber-300 mr-2"></i>
                          GSC가 알려준 "노출됐는데 못 잡은" TOP 키워드
                        </div>
                        <span class="text-[11px] text-amber-200 font-bold">노출수 ↓</span>
                      </div>
                      <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                          <thead class="bg-white/[0.02] text-white/50 text-[10px] uppercase tracking-widest">
                            <tr>
                              <th class="text-left px-5 py-3 w-12 font-bold">#</th>
                              <th class="text-left px-5 py-3 font-bold">키워드</th>
                              <th class="text-right px-5 py-3 hidden md:table-cell font-bold">노출</th>
                              <th class="text-right px-5 py-3 hidden md:table-cell font-bold">클릭</th>
                              <th class="text-right px-5 py-3 hidden md:table-cell font-bold">CTR</th>
                              <th class="text-right px-5 py-3 font-bold">평균 순위</th>
                            </tr>
                          </thead>
                          <tbody id="gsc-missed-tbody" class="divide-y divide-white/5"></tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ==================== TOP 100 ↔ TOP 500 토글 ==================== */}
          {!scan.is_gated && (
            <div class="bento-card rounded-3xl p-6 mb-8">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div class="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">스캔 범위</div>
                  <div class="text-xl font-extrabold text-white">
                    <i class="fas fa-expand text-brand-300 mr-2"></i>
                    구글 한국 TOP {maxRank}
                  </div>
                  <div class="text-sm text-white/60 mt-2 max-w-2xl">
                    {maxRank === 100
                      ? 'TOP 100 안 키워드만 집계됨. TOP 500 확장 시 잠재 키워드(100~500위)까지 확인 가능.'
                      : 'TOP 500 확장 모드 · 100위 밖 잠재 키워드까지 전부 집계됨.'}
                  </div>
                </div>
                <button
                  id="rescan-wider"
                  type="button"
                  data-domain={scan.domain}
                  data-max-rank={maxRank === 500 ? 100 : 500}
                  class="px-5 py-3 rounded-xl bg-gradient-to-br from-brand via-brand-600 to-brand-700 text-white text-sm font-extrabold whitespace-nowrap shadow-glow-brand hover:shadow-glow-brand-lg transition-all">
                  <i class="fas fa-rotate mr-2"></i>
                  TOP {maxRank === 500 ? '100 정밀' : '500 확장'}으로 재스캔
                </button>
              </div>
            </div>
          )}

          {/* ==================== 게이팅 CTA (비회원 + 추가 키워드) ==================== */}
          {scan.is_gated && hiddenCount > 0 && (
            <div class="relative overflow-hidden rounded-3xl p-8 md:p-10 mb-8 border border-brand/30 bg-gradient-to-br from-brand/[0.08] via-transparent to-accent/[0.08]">
              <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-40 pointer-events-none"
                   style="background: radial-gradient(circle, rgba(0,102,255,0.5) 0%, transparent 70%); filter: blur(60px);"></div>
              <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-30 pointer-events-none"
                   style="background: radial-gradient(circle, rgba(0,208,132,0.5) 0%, transparent 70%); filter: blur(60px);"></div>

              <div class="relative max-w-xl mx-auto text-center">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warn/15 border border-warn/30 text-warn text-xs font-extrabold mb-5">
                  <i class="fas fa-lock"></i> {hiddenCount}개 키워드 잠김
                </div>
                <h3 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  전체 키워드 + PDF 리포트<br class="md:hidden" /> <span class="text-gradient-aurora">무료</span>로 받기
                </h3>
                <p class="mt-4 text-white/70">
                  이메일 입력하면 전체 <b class="text-white">{scan.keyword_count}개</b> 키워드 + PDF 리포트 즉시 발송<br />
                  <span class="text-xs text-white/50">스팸 없음 · 언제든 수신 거부 가능</span>
                </p>

                <form id="lead-form" class="mt-7 grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <input type="hidden" name="scan_id" value={scan.scanId} />
                  <div class="md:col-span-2">
                    <label class="text-[11px] text-white/60 font-bold uppercase tracking-wider">이메일 <span class="text-warn">*</span></label>
                    <input name="email" type="email" required placeholder="doctor@clinic.co.kr"
                      class="mt-1.5 w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 focus:border-brand focus:bg-white/10 text-white placeholder-white/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label class="text-[11px] text-white/60 font-bold uppercase tracking-wider">병원명</label>
                    <input name="clinic_name" type="text" placeholder="서울비디치과"
                      class="mt-1.5 w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 focus:border-brand focus:bg-white/10 text-white placeholder-white/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label class="text-[11px] text-white/60 font-bold uppercase tracking-wider">진료과</label>
                    <select name="specialty" class="mt-1.5 w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 focus:border-brand focus:bg-white/10 text-white outline-none transition-all">
                      <option value="" class="bg-slate-900">선택</option>
                      <option class="bg-slate-900">치과</option><option class="bg-slate-900">한의원</option><option class="bg-slate-900">피부과</option><option class="bg-slate-900">성형외과</option>
                      <option class="bg-slate-900">안과</option><option class="bg-slate-900">정형외과</option><option class="bg-slate-900">이비인후과</option><option class="bg-slate-900">산부인과</option>
                      <option class="bg-slate-900">내과</option><option class="bg-slate-900">기타</option>
                    </select>
                  </div>
                  <div class="md:col-span-2">
                    <label class="text-[11px] text-white/60 font-bold uppercase tracking-wider">원장명</label>
                    <input name="doctor_name" type="text" placeholder="문석준"
                      class="mt-1.5 w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 focus:border-brand focus:bg-white/10 text-white placeholder-white/30 outline-none transition-all" />
                  </div>
                  <label class="md:col-span-2 flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                    <input type="checkbox" name="kakao_opt_in" value="1" class="w-4 h-4 rounded border-white/20 bg-white/5" />
                    Patient Rank 카카오 채널 추가하고 주간 순위 알림 받기
                  </label>
                  <button type="submit" class="md:col-span-2 py-4 rounded-xl bg-gradient-to-br from-brand via-brand-600 to-brand-700 hover:from-brand-400 hover:to-brand-600 text-white font-extrabold text-lg shadow-glow-brand-lg transition-all">
                    <i class="fas fa-unlock mr-2"></i>전체 리포트 잠금 해제
                  </button>
                  <div id="lead-status" class="md:col-span-2 text-sm text-center text-white/70"></div>
                </form>
              </div>
            </div>
          )}

          {/* ==================== 로그인 안내 (Basic 업셀) ==================== */}
          <div class="bento-card rounded-3xl p-6 md:p-7">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div class="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">자동 모니터링</div>
                <div class="text-xl font-extrabold text-white">
                  <i class="fas fa-bell text-amber-300 mr-2"></i>
                  매주 자동으로 순위 변동 받기
                </div>
                <div class="text-sm text-white/60 mt-2">
                  Basic 플랜: 주간 카톡 알림 · 경쟁사 갭 분석 · 백링크(Pro)
                </div>
              </div>
              <a href="/pricing" class="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-extrabold whitespace-nowrap transition-all">
                플랜 보기 <i class="fas fa-arrow-right ml-1.5"></i>
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <script
        id="scan-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          top3: scan.top3_count,
          top10: scan.top10_count - scan.top3_count,
          top30: scan.top30_count - scan.top10_count,
          top100: scan.top100_count - scan.top30_count,
        }) }}
      />
      <script src="/static/result.js"></script>
    </Layout>
  )
}
