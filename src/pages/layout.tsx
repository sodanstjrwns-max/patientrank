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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      brand: {
                        DEFAULT: '#0066FF',
                        50: '#EBF2FF',
                        100: '#D6E5FF',
                        200: '#ADC8FF',
                        300: '#7AA6FF',
                        400: '#3B82F6',
                        500: '#0066FF',
                        600: '#0052CC',
                        700: '#003D99',
                        800: '#002966',
                        900: '#001433',
                      },
                      accent: {
                        DEFAULT: '#00D084',
                        50: '#E6FBF3',
                        100: '#C2F4DD',
                        500: '#00D084',
                        600: '#00A66A',
                        700: '#007D50',
                      },
                      ink: {
                        50: '#F8FAFC',
                        100: '#F1F5F9',
                        200: '#E2E8F0',
                        300: '#CBD5E1',
                        400: '#94A3B8',
                        500: '#64748B',
                        600: '#475569',
                        700: '#334155',
                        800: '#1E293B',
                        900: '#0F172A',
                        950: '#020617',
                      },
                      warn: { DEFAULT: '#FF6B6B', 600: '#E05555' },
                    },
                    fontFamily: {
                      sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
                      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
                    },
                    fontSize: {
                      'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '800' }],
                      'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '800' }],
                      'display-md': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
                    },
                    boxShadow: {
                      'glow-brand': '0 20px 60px -15px rgba(0, 102, 255, 0.35)',
                      'glow-accent': '0 20px 60px -15px rgba(0, 208, 132, 0.35)',
                      'card': '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
                      'card-hover': '0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
                    },
                    backgroundImage: {
                      'mesh-hero': 'radial-gradient(at 27% 37%, hsla(215,98%,61%,0.12) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(160,98%,40%,0.10) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(217,97%,72%,0.10) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256,96%,67%,0.08) 0px, transparent 50%)',
                      'grid-light': 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
                    },
                    animation: {
                      'fade-up': 'fadeUp 0.6s ease-out',
                      'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                      'shimmer': 'shimmer 2.5s linear infinite',
                      'tick': 'tick 0.6s ease-out',
                    },
                    keyframes: {
                      fadeUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                      pulseSoft: { '0%,100%': { opacity: '0.7' }, '50%': { opacity: '1' } },
                      shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
                      tick: { '0%': { transform: 'scale(0.5)', opacity: '0' }, '60%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
                    },
                  }
                }
              }
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { color-scheme: light; }
              html { scroll-behavior: smooth; }
              body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
              /* 노이즈 텍스처 (히어로 배경 깊이감) */
              .bg-noise::before {
                content: ''; position: absolute; inset: 0; pointer-events: none;
                background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
                opacity: 0.6; mix-blend-mode: multiply; z-index: 0;
              }
              /* 그라디언트 텍스트 */
              .text-gradient-brand {
                background: linear-gradient(135deg, #0066FF 0%, #00D084 100%);
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .text-gradient-mesh {
                background: linear-gradient(135deg, #0F172A 0%, #0066FF 50%, #00D084 100%);
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              /* 스크롤 시 등장 애니메이션 (JS 없이) */
              .reveal { opacity: 0; transform: translateY(20px); transition: all 0.7s ease-out; }
              .reveal.in { opacity: 1; transform: translateY(0); }
              /* 커스텀 스크롤바 */
              ::-webkit-scrollbar { width: 10px; height: 10px; }
              ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 999px; }
              ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
              /* 카드 hover lift */
              .card-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
              .card-lift:hover { transform: translateY(-4px); }
              /* 배경 그리드 (헤어라인) */
              .bg-grid {
                background-image: linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px);
                background-size: 48px 48px;
              }
              .bg-grid-mask {
                mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%);
                -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%);
              }
              /* shimmer for skeleton */
              .skeleton {
                background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%);
                background-size: 1000px 100%;
                animation: shimmer 2.5s linear infinite;
              }
            `,
          }}
        />
        <link rel="stylesheet" href="/static/styles.css" />
      </head>
      <body class="font-sans bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}

export const NavBar: FC<{ loggedIn?: boolean }> = ({ loggedIn = false }) => (
  <header class="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-ink-200/80">
    <div class="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2.5 group">
        <span class="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition">
          <i class="fas fa-arrow-trend-up text-sm"></i>
          <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-white"></span>
        </span>
        <span class="font-extrabold text-lg tracking-tight text-ink-900">
          Patient<span class="text-gradient-brand">Rank</span>
        </span>
      </a>
      <nav class="flex items-center gap-1 md:gap-2 text-sm">
        <a href="/#features" class="hidden md:inline px-3 py-2 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-100 font-medium transition">기능</a>
        <a href="/#how" class="hidden md:inline px-3 py-2 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-100 font-medium transition">동작 원리</a>
        <a href="/pricing" class="hidden md:inline px-3 py-2 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-100 font-medium transition">가격</a>
        <a href="/blog" class="hidden md:inline px-3 py-2 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-100 font-medium transition">블로그</a>
        <span class="hidden md:inline w-px h-5 bg-ink-200 mx-1"></span>
        {loggedIn ? (
          <a href="/dashboard" class="px-4 py-2 rounded-lg bg-ink-900 text-white hover:bg-ink-800 font-semibold transition">대시보드</a>
        ) : (
          <>
            <a href="/login" class="px-3 py-2 rounded-lg text-ink-700 hover:text-ink-900 font-medium transition">로그인</a>
            <a href="/#diagnose" class="px-4 py-2 rounded-lg bg-ink-900 text-white hover:bg-ink-800 font-semibold shadow-sm transition flex items-center gap-1.5">
              <i class="fas fa-magnifying-glass text-xs"></i>
              무료 진단
            </a>
          </>
        )}
      </nav>
    </div>
  </header>
)

export const Footer: FC = () => (
  <footer class="relative mt-24 border-t border-ink-200 bg-ink-950 text-ink-300 overflow-hidden">
    <div class="absolute inset-0 bg-grid opacity-[0.04] pointer-events-none"></div>
    <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand/10 blur-3xl pointer-events-none"></div>
    <div class="relative max-w-7xl mx-auto px-5 pt-16 pb-10">
      <div class="grid md:grid-cols-5 gap-10 mb-12">
        <div class="md:col-span-2">
          <div class="flex items-center gap-2.5 mb-4">
            <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center text-white shadow-glow-brand">
              <i class="fas fa-arrow-trend-up text-sm"></i>
            </span>
            <span class="font-extrabold text-white text-lg tracking-tight">
              Patient<span class="text-gradient-brand">Rank</span>
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
