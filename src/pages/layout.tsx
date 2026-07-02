// 공통 레이아웃 (HTML 셸)
import type { FC, PropsWithChildren } from 'hono/jsx'

interface LayoutProps {
  title?: string
  description?: string
  ogImage?: string
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  title = 'Patient Rank · 우리 병원 구글에서 몇 위?',
  description = '병원 홈페이지 URL 하나로 10초 안에 구글 한국 랭크 키워드와 순위를 확인하는 국내 최초 의료기관 전용 SEO 진단 SaaS',
  ogImage,
  children,
}) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="/static/tw-config.js?v=4"></script>
        <link rel="stylesheet" href="/static/app.css?v=4" />
      </head>
      <body class="font-sans bg-white text-slate-900 antialiased">
        <div id="scroll-progress" class="scroll-progress"></div>
        {children}
      </body>
    </html>
  )
}

export const NavBar: FC<{ loggedIn?: boolean; dark?: boolean }> = ({ loggedIn = false, dark = true }) => (
  <header id="navbar" class={`fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[min(96%,1180px)] rounded-2xl transition-all duration-500 ${dark ? 'bg-[#0A0E1F]/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]' : 'bg-white/85 backdrop-blur-2xl border border-ink-200/60 shadow-card'}`}>
    {/* 상단 헤어라인 그라디언트 */}
    <div class="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"></div>
    <div class="px-5 h-14 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2.5 group">
        <span class="relative w-8 h-8 rounded-xl bg-gradient-to-br from-brand via-iris-500 to-brand-700 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
          <i class="fas fa-arrow-trend-up text-xs"></i>
          <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-[#0A0E1F] animate-pulse"></span>
        </span>
        <span class={`font-extrabold text-base tracking-tight ${dark ? 'text-white' : 'text-ink-900'}`}>
          Patient<span class="text-gradient-aurora">Rank</span>
        </span>
      </a>
      <nav class="flex items-center gap-1 md:gap-1 text-sm">
        <a href="/#features" class={`nav-link hidden md:inline px-3 py-1.5 rounded-lg font-medium transition ${dark ? 'text-white/70 hover:text-white' : 'text-ink-600 hover:text-ink-900'}`}>기능</a>
        <a href="/#how" class={`nav-link hidden md:inline px-3 py-1.5 rounded-lg font-medium transition ${dark ? 'text-white/70 hover:text-white' : 'text-ink-600 hover:text-ink-900'}`}>동작 원리</a>
        <a href="/pricing" class={`nav-link hidden md:inline px-3 py-1.5 rounded-lg font-medium transition ${dark ? 'text-white/70 hover:text-white' : 'text-ink-600 hover:text-ink-900'}`}>가격</a>
        <a href="/blog" class={`nav-link hidden md:inline px-3 py-1.5 rounded-lg font-medium transition ${dark ? 'text-white/70 hover:text-white' : 'text-ink-600 hover:text-ink-900'}`}>블로그</a>
        <span class={`hidden md:inline w-px h-4 mx-1 ${dark ? 'bg-white/15' : 'bg-ink-200'}`}></span>
        {loggedIn ? (
          <a href="/dashboard" class="btn-shine px-3.5 py-1.5 rounded-lg bg-white text-ink-900 hover:bg-white/90 font-semibold transition text-xs flex items-center gap-1.5">
            <i class="fas fa-gauge-high text-[10px]"></i>대시보드
          </a>
        ) : (
          <>
            <a href="/login" class={`hidden sm:inline px-3 py-1.5 rounded-lg font-medium transition ${dark ? 'text-white/70 hover:text-white' : 'text-ink-700 hover:text-ink-900'}`}>로그인</a>
            <a href="/#diagnose" class="btn-shine px-3.5 py-1.5 rounded-lg bg-gradient-to-br from-brand via-iris-500 to-brand-600 text-white hover:shadow-glow-brand-lg font-semibold shadow-glow-brand transition-all duration-300 flex items-center gap-1.5">
              <i class="fas fa-bolt text-[10px]"></i>
              <span class="text-xs">무료 진단</span>
            </a>
          </>
        )}
      </nav>
    </div>
  </header>
)

export const Footer: FC = () => (
  <footer class="relative mt-24 bg-ink-950 text-ink-300 overflow-hidden">
    <div class="divider-glow"></div>
    <div class="absolute inset-0 stars-grid opacity-40 pointer-events-none"></div>
    <div class="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-brand/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-iris-500/10 blur-3xl pointer-events-none"></div>
    <div class="relative max-w-7xl mx-auto px-5 pt-16 pb-10">
      <div class="grid md:grid-cols-5 gap-10 mb-12">
        <div class="md:col-span-2">
          <div class="flex items-center gap-2.5 mb-4">
            <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand via-iris-500 to-brand-700 flex items-center justify-center text-white shadow-glow-brand">
              <i class="fas fa-arrow-trend-up text-sm"></i>
            </span>
            <span class="font-extrabold text-white text-lg tracking-tight">
              Patient<span class="text-gradient-aurora">Rank</span>
            </span>
          </div>
          <p class="leading-relaxed text-ink-400 text-sm max-w-sm">
            국내 최초 의료기관 전용 구글 SEO 진단 SaaS.<br />
            URL 하나로 10초 만에 구글 한국 노출 현황을 체크하세요.
          </p>
          <div class="mt-6 flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-ink-300">
              <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft"></span>
              서비스 정상
            </span>
            <span class="text-xs text-ink-500">v1.0 · 2026</span>
          </div>
        </div>
        <div>
          <h4 class="font-semibold text-white text-sm mb-4">제품</h4>
          <ul class="space-y-2.5 text-sm">
            <li><a href="/#features" class="hover:text-white transition">기능 소개</a></li>
            <li><a href="/#how" class="hover:text-white transition">동작 원리</a></li>
            <li><a href="/pricing" class="hover:text-white transition">가격</a></li>
            <li><a href="/blog" class="hover:text-white transition">블로그</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white text-sm mb-4">회사</h4>
          <ul class="space-y-2.5 text-sm">
            <li><a href="https://patientfunnel.com" target="_blank" class="hover:text-white transition">페이션트 퍼널</a></li>
            <li><a href="https://bdbddc.com" target="_blank" class="hover:text-white transition">서울비디치과</a></li>
            <li><a href="mailto:hello@patientrank.kr" class="hover:text-white transition">문의하기</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white text-sm mb-4">정보</h4>
          <ul class="space-y-2.5 text-sm">
            <li><a href="/terms" class="hover:text-white transition">이용약관</a></li>
            <li><a href="/privacy" class="hover:text-white transition">개인정보처리방침</a></li>
            <li><a href="/refund" class="hover:text-white transition">환불정책</a></li>
          </ul>
        </div>
      </div>
      <div class="pt-8 border-t border-white/10 flex flex-wrap gap-3 justify-between items-center text-xs text-ink-500">
        <span>© 2026 Patient Rank. All rights reserved.</span>
        <span class="flex items-center gap-2">
          <i class="fas fa-tooth text-brand"></i>
          서울비디치과 검증 기술 · 페이션트 퍼널 공식 도구
        </span>
      </div>
    </div>
  </footer>
)
