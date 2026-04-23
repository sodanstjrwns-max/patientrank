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
                        500: '#0066FF',
                        600: '#0052CC',
                        700: '#003D99',
                      },
                      accent: { DEFAULT: '#00D084', 600: '#00A66A' },
                      warn: { DEFAULT: '#FF6B6B', 600: '#E05555' },
                    },
                    fontFamily: {
                      sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
                    },
                  }
                }
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
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 group">
        <span class="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold shadow-sm">
          <i class="fas fa-arrow-trend-up text-sm"></i>
        </span>
        <span class="font-bold text-lg tracking-tight">
          Patient<span class="text-brand">Rank</span>
        </span>
      </a>
      <nav class="flex items-center gap-1 md:gap-4 text-sm">
        <a href="/pricing" class="hidden md:inline px-3 py-2 rounded-md text-slate-600 hover:text-brand hover:bg-brand-50">가격</a>
        <a href="/blog" class="hidden md:inline px-3 py-2 rounded-md text-slate-600 hover:text-brand hover:bg-brand-50">블로그</a>
        {loggedIn ? (
          <a href="/dashboard" class="px-4 py-2 rounded-md bg-brand text-white hover:bg-brand-600 font-semibold">대시보드</a>
        ) : (
          <>
            <a href="/login" class="px-3 py-2 rounded-md text-slate-600 hover:text-brand hover:bg-brand-50">로그인</a>
            <a href="#diagnose" class="px-4 py-2 rounded-md bg-brand text-white hover:bg-brand-600 font-semibold shadow-sm">
              무료 진단
            </a>
          </>
        )}
      </nav>
    </div>
  </header>
)

export const Footer: FC = () => (
  <footer class="mt-24 border-t border-slate-200 bg-slate-50">
    <div class="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-4 gap-8 text-sm text-slate-600">
      <div class="md:col-span-2">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-7 h-7 rounded-md bg-brand flex items-center justify-center text-white">
            <i class="fas fa-arrow-trend-up text-xs"></i>
          </span>
          <span class="font-bold text-slate-900">Patient Rank</span>
        </div>
        <p class="leading-relaxed">
          국내 최초 의료기관 전용 구글 SEO 진단 SaaS.<br />
          URL 하나로 10초 만에 구글 한국 노출 현황을 체크하세요.
        </p>
      </div>
      <div>
        <h4 class="font-semibold text-slate-900 mb-3">제품</h4>
        <ul class="space-y-2">
          <li><a href="/pricing" class="hover:text-brand">가격</a></li>
          <li><a href="/blog" class="hover:text-brand">블로그</a></li>
          <li><a href="/#features" class="hover:text-brand">기능 소개</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold text-slate-900 mb-3">정보</h4>
        <ul class="space-y-2">
          <li><a href="/terms" class="hover:text-brand">이용약관</a></li>
          <li><a href="/privacy" class="hover:text-brand">개인정보처리방침</a></li>
          <li><a href="mailto:hello@patientrank.co.kr" class="hover:text-brand">문의하기</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-slate-200">
      <div class="max-w-6xl mx-auto px-5 py-5 text-xs text-slate-500 flex flex-wrap gap-2 justify-between">
        <span>© 2026 Patient Rank. All rights reserved.</span>
        <span>비디치과 검증 기술 · 페이션트퍼널 공식 도구</span>
      </div>
    </div>
  </footer>
)
