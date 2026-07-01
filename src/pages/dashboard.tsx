// 일반 유저 대시보드 + 로그인 페이지
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'
import type { AuthUser } from '../lib/auth'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  agency: 'Agency',
}

export const LoginPage: FC<{ error?: string; detail?: string }> = ({ error, detail }) => {
  const errMap: Record<string, string> = {
    login_required: '로그인이 필요합니다',
    google_not_configured: 'Google 로그인이 아직 설정되지 않았습니다. 잠시 후 다시 시도해주세요',
    google_init_failed: 'Google 로그인 초기화에 실패했습니다. 다시 시도해주세요',
    missing_code: 'Google 로그인 응답이 올바르지 않습니다',
    invalid_state: '보안 검증에 실패했습니다. 다시 로그인해주세요',
    token_exchange_failed: 'Google 인증 교환에 실패했습니다',
    userinfo_failed: 'Google 계정 정보를 불러올 수 없습니다',
    email_not_verified: '이메일이 인증되지 않은 Google 계정입니다',
    gsc_session_mismatch: '세션이 만료됐습니다. 다시 로그인해주세요',
    user_upsert_failed: '계정 정보 저장 중 오류가 발생했습니다',
    session_create_failed: '세션 생성 중 오류가 발생했습니다',
    callback_failed: '로그인 처리 중 오류가 발생했습니다',
  }
  const errMsg = error ? (errMap[error] || (error.startsWith('google_') ? 'Google 로그인 중 오류가 발생했습니다' : null)) : null

  return (
    <Layout title="로그인 · Patient Rank">
      <NavBar />
      <main class="max-w-md mx-auto px-5 py-24">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-600 text-white shadow-lg shadow-brand/20 mb-5">
            <i class="fas fa-stethoscope text-2xl"></i>
          </div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">로그인</h1>
          <p class="mt-2.5 text-slate-600">Google 계정으로 1초 만에 시작하세요</p>
        </div>

        {errMsg && (
          <div class="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <div><i class="fas fa-circle-exclamation mr-2"></i>{errMsg}</div>
            {detail && (
              <div class="mt-2 pl-6 text-xs text-red-600/80 font-mono break-all">상세: {detail}</div>
            )}
          </div>
        )}

        <div class="p-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Google 로그인 — 단일 진입점 */}
          <a
            href="/auth/google"
            class="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-sm transition font-semibold text-slate-800">
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            <span>Google 계정으로 계속하기</span>
          </a>

          <ul class="mt-6 space-y-2.5 text-sm text-slate-600">
            <li class="flex items-start gap-2">
              <i class="fas fa-check text-accent mt-0.5"></i>
              <span>회원가입 절차 없이 Google 계정만 있으면 즉시 사용</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fas fa-check text-accent mt-0.5"></i>
              <span>이메일/비밀번호 관리 불필요 · 스팸 메일 없음</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fas fa-check text-accent mt-0.5"></i>
              <span>Pro/Agency는 Google Search Console 연동까지 한 번에</span>
            </li>
          </ul>
        </div>

        <p class="mt-5 text-center text-xs text-slate-400">
          로그인 시 <a href="/terms" class="underline hover:text-slate-600">이용약관</a> 및 <a href="/privacy" class="underline hover:text-slate-600">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
        </p>
      </main>
      <Footer />
    </Layout>
  )
}

interface DashboardProps {
  user: AuthUser
  scans: Array<{
    id: number
    url: string
    keyword_count: number
    top10_count: number
    estimated_traffic: number
    created_at: string
  }>
}

export const DashboardPage: FC<DashboardProps> = ({ user, scans }) => {
  const planLabel = PLAN_LABELS[user.plan] || 'Free'
  const isPaid = user.plan !== 'free'

  // KPI 집계
  const totalScans = scans.length
  const totalKeywords = scans.reduce((s, x) => s + (x.keyword_count || 0), 0)
  const totalTop10 = scans.reduce((s, x) => s + (x.top10_count || 0), 0)
  const avgTop10 = totalScans > 0 ? (totalTop10 / totalScans).toFixed(1) : '0'
  const totalTraffic = scans.reduce((s, x) => s + (x.estimated_traffic || 0), 0)

  // 이번 달 스캔
  const now = new Date()
  const thisMonthScans = scans.filter((s) => {
    const d = new Date(s.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
  const monthLimit = user.plan === 'free' ? 3 : user.plan === 'basic' ? 30 : user.plan === 'pro' ? 50 : user.plan === 'agency' ? 150 : 999
  const monthPct = Math.min(100, Math.round((thisMonthScans / monthLimit) * 100))

  const initials = (user.clinic_name || user.email || 'U').slice(0, 1).toUpperCase()
  const displayName = user.clinic_name || user.email
  const greeting = user.name ? `${user.name} 원장님,` : '안녕하세요,'

  return (
    <Layout title="대시보드 · Patient Rank">
      <NavBar loggedIn />
      <main class="hero-dark relative overflow-hidden min-h-screen">
        {/* 배경 별 그리드 + Aurora */}
        <div class="absolute inset-0 stars-grid pointer-events-none"></div>
        <div class="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] rounded-full pointer-events-none"
             style="background: radial-gradient(circle, rgba(0, 102, 255, 0.35) 0%, transparent 60%); filter: blur(80px);"></div>
        <div class="absolute top-[600px] left-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none"
             style="background: radial-gradient(circle, rgba(0, 208, 132, 0.25) 0%, transparent 60%); filter: blur(80px);"></div>

        <div class="relative max-w-7xl mx-auto px-5 pt-28 pb-20">
          {/* ==================== 헤더 — 글래스 ==================== */}
          <div class="glass-dark rounded-3xl p-6 md:p-8 mb-8 reveal">
            <div class="flex flex-wrap items-center gap-5">
              <div class="relative">
                <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-brand via-brand-600 to-accent flex items-center justify-center text-white text-3xl font-extrabold shadow-glow-brand">
                  {initials}
                </div>
                <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent ring-4 ring-[#0A0E1F] flex items-center justify-center">
                  <i class="fas fa-check text-[8px] text-white"></i>
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">
                  <i class="fas fa-circle text-accent text-[6px] mr-1.5 animate-pulse"></i>
                  대시보드
                </div>
                <h1 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight truncate">
                  {greeting}
                </h1>
                <p class="mt-1.5 text-white/60 text-sm md:text-base flex flex-wrap items-center gap-2">
                  <span class="truncate"><b class="text-white">{displayName}</b></span>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-xs">
                    <i class={`fas fa-crown text-[10px] ${isPaid ? 'text-amber-400' : 'text-white/40'}`}></i>
                    <span class={`font-semibold ${isPaid ? 'text-amber-400' : 'text-white/70'}`}>{planLabel}</span>
                  </span>
                  {user.is_admin === 1 && (
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-bold">
                      <i class="fas fa-shield-halved text-[9px]"></i>ADMIN
                    </span>
                  )}
                </p>
              </div>
              <div class="flex gap-2 flex-wrap">
                {user.is_admin === 1 && (
                  <a href="/admin" class="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/80 hover:bg-white/[0.1] hover:text-white font-semibold text-sm transition">
                    <i class="fas fa-shield-halved mr-1.5"></i>어드민
                  </a>
                )}
                <button id="logoutBtn"
                  class="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 hover:bg-rose-500/10 hover:border-rose-400/30 hover:text-rose-300 font-semibold text-sm transition">
                  <i class="fas fa-right-from-bracket mr-1.5"></i>로그아웃
                </button>
              </div>
            </div>
          </div>

          {/* ==================== KPI Bento 4칸 ==================== */}
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 reveal">
            {/* 1. 누적 진단 */}
            <div class="bento-card rounded-3xl p-5 md:p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 flex items-center justify-center text-brand-300">
                  <i class="fas fa-magnifying-glass-chart"></i>
                </span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-white/40">총 진단</span>
              </div>
              <div class="text-3xl md:text-4xl font-extrabold text-white tabular-nums leading-none">
                <span class="counter" data-target={String(totalScans)}>0</span><span class="text-white/30 text-xl">회</span>
              </div>
              <div class="mt-1.5 text-xs text-white/50">누적 진단 횟수</div>
            </div>

            {/* 2. 누적 키워드 */}
            <div class="bento-card rounded-3xl p-5 md:p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center text-accent">
                  <i class="fas fa-key"></i>
                </span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-white/40">총 키워드</span>
              </div>
              <div class="text-3xl md:text-4xl font-extrabold text-white tabular-nums leading-none">
                <span class="counter" data-target={String(totalKeywords)}>0</span>
              </div>
              <div class="mt-1.5 text-xs text-white/50">발견된 랭킹 키워드</div>
            </div>

            {/* 3. 평균 TOP 10 */}
            <div class="bento-card rounded-3xl p-5 md:p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <i class="fas fa-trophy"></i>
                </span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-white/40">평균 TOP 10</span>
              </div>
              <div class="text-3xl md:text-4xl font-extrabold text-white tabular-nums leading-none">
                <span class="counter" data-target={avgTop10}>0</span><span class="text-white/30 text-xl">개</span>
              </div>
              <div class="mt-1.5 text-xs text-white/50">스캔당 평균</div>
            </div>

            {/* 4. 이번 달 사용량 (게이지) */}
            <div class="bento-card rounded-3xl p-5 md:p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30 flex items-center justify-center text-rose-300">
                  <i class="fas fa-gauge-high"></i>
                </span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-white/40">이번 달</span>
              </div>
              <div class="text-3xl md:text-4xl font-extrabold text-white tabular-nums leading-none">
                <span class="counter" data-target={String(thisMonthScans)}>0</span>
                <span class="text-white/30 text-xl">/{monthLimit === 999 ? '∞' : monthLimit}</span>
              </div>
              <div class="mt-3 w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div class={`h-full rounded-full transition-all duration-1000 ${monthPct >= 80 ? 'bg-gradient-to-r from-amber-400 to-rose-500' : 'bg-gradient-to-r from-brand to-accent'}`}
                     style={`width: ${monthPct}%`}></div>
              </div>
            </div>
          </div>

          {/* ==================== 새 진단 — 메인 인풋 ==================== */}
          <section class="mb-10 reveal">
            <div class="bento-card rounded-3xl p-6 md:p-10 relative overflow-hidden">
              <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/15 blur-3xl pointer-events-none"></div>
              <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none"></div>

              <div class="relative">
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest">
                    <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>NEW SCAN
                  </span>
                  <span class="text-[10px] text-white/40 font-mono">~9.4s 평균 응답</span>
                </div>
                <h2 class="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  새 도메인 <span class="text-gradient-aurora">진단</span> 실행
                </h2>
                <p class="mt-2 text-white/60 text-sm md:text-base">
                  병원 홈페이지 URL 하나만 넣으면 구글에서 어떤 키워드로 몇 위인지 즉시 분석합니다.
                </p>

                <form id="scanForm" class="mt-7 max-w-3xl">
                  <div class="input-dark-glow rounded-2xl p-2 flex flex-col md:flex-row gap-2">
                    <div class="flex-1 flex items-center gap-3 px-4">
                      <i class="fas fa-globe text-white/40"></i>
                      <input id="scanUrl" type="text" autocomplete="off" autocapitalize="off" spellcheck={false}
                        required
                        placeholder="example-hospital.co.kr"
                        class="w-full py-3.5 text-base md:text-lg outline-none bg-transparent text-white placeholder:text-white/30 font-medium" />
                    </div>
                    <button type="submit" id="scanBtn"
                      class="magnetic group relative py-3.5 px-7 rounded-xl bg-gradient-to-br from-brand via-brand-600 to-brand-700 hover:shadow-glow-brand-lg text-white font-semibold text-base md:text-lg shadow-glow-brand transition-all duration-300 whitespace-nowrap overflow-hidden">
                      <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                      <i class="fas fa-bolt mr-2 relative group-hover:scale-110 transition"></i>
                      <span class="relative">진단 시작</span>
                    </button>
                  </div>
                  <div id="scanStatus" class="hidden mt-3 text-sm text-white/70"></div>

                  {/* 진단 단계 미리보기 */}
                  <div id="scanSteps" class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {[
                      { ic: 'fa-check', t: 'URL 검증', n: 1 },
                      { ic: 'fa-satellite-dish', t: '구글 색인 조회', n: 2 },
                      { ic: 'fa-stethoscope', t: '의료 키워드 매칭', n: 3 },
                      { ic: 'fa-chart-line', t: '랭킹 데이터 정리', n: 4 },
                    ].map((s) => (
                      <div class="step-item flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-white/50" data-step={String(s.n)}>
                        <span class="step-icon w-6 h-6 rounded-md bg-white/[0.05] flex items-center justify-center">
                          <i class={`fas ${s.ic} text-[10px]`}></i>
                        </span>
                        <span class="font-medium">{s.t}</span>
                      </div>
                    ))}
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* ==================== 스캔 이력 ==================== */}
          <section class="mb-10 reveal">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <i class="fas fa-clock-rotate-left text-white/40"></i>진단 이력
                {scans.length > 0 && (
                  <span class="text-sm font-mono px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-white/60">{scans.length}</span>
                )}
              </h2>
              {scans.length > 0 && (
                <a href="#scanForm" class="text-xs font-semibold text-brand-300 hover:text-brand-200 inline-flex items-center gap-1">
                  새 진단 <i class="fas fa-arrow-up text-[9px]"></i>
                </a>
              )}
            </div>

            {scans.length === 0 ? (
              <div class="bento-card rounded-3xl p-12 md:p-16 text-center">
                <div class="inline-flex w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-brand/20 to-accent/20 border border-white/10 items-center justify-center">
                  <i class="fas fa-magnifying-glass-chart text-3xl text-white/60"></i>
                </div>
                <h3 class="text-xl font-extrabold text-white">아직 진단 이력이 없어요</h3>
                <p class="mt-2 text-white/60 text-sm">위에서 첫 URL을 넣고 진단을 시작해보세요. 평균 9.4초면 끝납니다.</p>
                <a href="#scanForm" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand to-brand-700 text-white font-semibold text-sm shadow-glow-brand hover:shadow-glow-brand-lg transition">
                  <i class="fas fa-bolt"></i>첫 진단 시작
                </a>
              </div>
            ) : (
              <div class="bento-card rounded-3xl overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-white/[0.03] text-white/50 text-left border-b border-white/8">
                      <tr>
                        <th class="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px]">URL</th>
                        <th class="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">키워드</th>
                        <th class="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">TOP 10</th>
                        <th class="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">추정 유입</th>
                        <th class="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px]">일시</th>
                        <th class="px-5 py-3.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map((s) => (
                        <tr class="border-t border-white/5 hover:bg-white/[0.03] transition group">
                          <td class="px-5 py-4 truncate max-w-xs">
                            <div class="flex items-center gap-2.5">
                              <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-brand/20 to-accent/20 border border-white/10 flex items-center justify-center text-brand-300 shrink-0">
                                <i class="fas fa-globe text-[10px]"></i>
                              </span>
                              <span class="text-white/90 font-medium truncate">{s.url}</span>
                            </div>
                          </td>
                          <td class="px-5 py-4 text-right font-bold text-white tabular-nums">{s.keyword_count.toLocaleString()}</td>
                          <td class="px-5 py-4 text-right tabular-nums">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                              <i class="fas fa-trophy text-[9px] mr-1"></i>{s.top10_count}
                            </span>
                          </td>
                          <td class="px-5 py-4 text-right text-white/80 tabular-nums">{s.estimated_traffic.toLocaleString()}</td>
                          <td class="px-5 py-4 text-white/50 whitespace-nowrap text-xs">{new Date(s.created_at).toLocaleString('ko-KR')}</td>
                          <td class="px-5 py-4 text-right">
                            <a href={`/result/${s.id}`} class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/80 hover:bg-brand/15 hover:border-brand/40 hover:text-brand-200 font-semibold text-xs transition group-hover:border-brand/40">
                              보기 <i class="fas fa-arrow-right text-[9px]"></i>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* ==================== 플랜 업그레이드 ==================== */}
          {!isPaid && (
            <section class="reveal">
              <div class="relative overflow-hidden rounded-3xl p-7 md:p-10 border border-amber-400/30"
                   style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(0, 102, 255, 0.08) 100%);">
                <div class="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/20 blur-3xl pointer-events-none"></div>
                <div class="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-brand/20 blur-3xl pointer-events-none"></div>
                <div class="relative grid md:grid-cols-12 gap-6 items-center">
                  <div class="md:col-span-8">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                      <i class="fas fa-crown text-[10px]"></i>업그레이드 안내
                    </div>
                    <h3 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      Free 플랜은 <span class="text-amber-300">월 3회</span>까지예요
                    </h3>
                    <p class="mt-3 text-white/70 text-sm md:text-base leading-relaxed">
                      Basic으로 업그레이드하면 <b class="text-white">월 30회 + 전체 키워드 + 주간 카톡 알림</b>까지.<br />
                      얼리버드 가격으로 <b class="text-amber-300">월 1,450원</b>부터.
                    </p>
                  </div>
                  <div class="md:col-span-4 flex md:justify-end">
                    <a href="/pricing" class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-ink-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition">
                      <i class="fas fa-rocket"></i>플랜 업그레이드
                      <i class="fas fa-arrow-right text-xs"></i>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // 카운터 카운트업
            (function() {
              const counters = document.querySelectorAll('.counter');
              counters.forEach((el) => {
                const target = parseFloat(el.getAttribute('data-target') || '0');
                const isFloat = !Number.isInteger(target);
                const start = performance.now();
                const dur = 1400;
                function tick(now) {
                  const t = Math.min(1, (now - start) / dur);
                  const eased = 1 - Math.pow(1 - t, 3);
                  const cur = target * eased;
                  el.textContent = isFloat ? cur.toFixed(1) : Math.round(cur).toLocaleString();
                  if (t < 1) requestAnimationFrame(tick);
                  else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
                }
                requestAnimationFrame(tick);
              });
              // reveal
              document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
            })();

            // 로그아웃
            document.getElementById('logoutBtn').addEventListener('click', async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              location.href = '/';
            });

            // Magnetic CTA
            (function() {
              if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
              if (window.innerWidth < 1024) return;
              document.querySelectorAll('.magnetic').forEach((btn) => {
                btn.addEventListener('mousemove', (e) => {
                  const r = btn.getBoundingClientRect();
                  const dx = (e.clientX - (r.left + r.width/2)) * 0.25;
                  const dy = (e.clientY - (r.top + r.height/2)) * 0.25;
                  btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                });
                btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
              });
            })();

            // 진단 폼 — 단계 진행 시뮬레이션
            function activateStep(n) {
              document.querySelectorAll('.step-item').forEach((el) => {
                const s = parseInt(el.getAttribute('data-step') || '0', 10);
                if (s <= n) {
                  el.classList.remove('text-white/50');
                  el.classList.add('text-white');
                  el.style.background = 'linear-gradient(135deg, rgba(0, 102, 255, 0.15), rgba(0, 208, 132, 0.1))';
                  el.style.borderColor = 'rgba(0, 208, 132, 0.4)';
                  const icon = el.querySelector('.step-icon');
                  if (icon) {
                    icon.style.background = 'linear-gradient(135deg, #00D084, #00A66A)';
                    icon.style.color = '#fff';
                    icon.querySelector('i').className = 'fas fa-check text-[10px]';
                  }
                }
              });
            }
            function resetSteps() {
              document.querySelectorAll('.step-item').forEach((el) => {
                el.classList.add('text-white/50');
                el.classList.remove('text-white');
                el.style.background = '';
                el.style.borderColor = '';
                const icon = el.querySelector('.step-icon');
                if (icon) icon.style.background = '';
              });
            }

            document.getElementById('scanForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const url = document.getElementById('scanUrl').value.trim();
              const btn = document.getElementById('scanBtn');
              const st = document.getElementById('scanStatus');
              btn.disabled = true;
              btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>진단 중... (10~15초)';
              st.classList.remove('hidden');
              st.innerHTML = '<i class="fas fa-circle-info text-brand-300 mr-1.5"></i>DataForSEO API 호출 중...';
              activateStep(1);
              setTimeout(() => activateStep(2), 1200);
              setTimeout(() => activateStep(3), 3000);
              try {
                const res = await fetch('/api/scan', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                });
                const data = await res.json();
                if (data.ok && data.scan) {
                  activateStep(4);
                  setTimeout(() => { location.href = '/result/' + data.scan.scanId; }, 400);
                } else {
                  st.innerHTML = '<i class="fas fa-circle-exclamation text-rose-400 mr-1.5"></i>' + (data.message || '진단 실패');
                  btn.disabled = false;
                  btn.innerHTML = '<i class="fas fa-bolt mr-2"></i><span>진단 시작</span>';
                  resetSteps();
                }
              } catch (err) {
                st.innerHTML = '<i class="fas fa-circle-exclamation text-rose-400 mr-1.5"></i>오류가 발생했습니다. 다시 시도해주세요.';
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-bolt mr-2"></i><span>진단 시작</span>';
                resetSteps();
              }
            });
          `,
        }}
      />
    </Layout>
  )
}
