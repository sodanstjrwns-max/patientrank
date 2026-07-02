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
                      iris: {
                        DEFAULT: '#7C5CFF',
                        200: '#C4B5FD',
                        300: '#A78BFA',
                        400: '#8B5CF6',
                        500: '#7C5CFF',
                        600: '#6D28D9',
                        700: '#5B21B6',
                      },
                    },
                    fontFamily: {
                      sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
                      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
                    },
                    fontSize: {
                      'display-2xl': ['6.5rem', { lineHeight: '0.95', letterSpacing: '-0.05em', fontWeight: '900' }],
                      'display-xl': ['5rem', { lineHeight: '1.0', letterSpacing: '-0.045em', fontWeight: '900' }],
                      'display-lg': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '900' }],
                      'display-md': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
                    },
                    boxShadow: {
                      'glow-brand': '0 20px 60px -15px rgba(0, 102, 255, 0.35)',
                      'glow-brand-lg': '0 30px 80px -20px rgba(0, 102, 255, 0.45), 0 10px 30px -10px rgba(0, 102, 255, 0.3)',
                      'glow-accent': '0 20px 60px -15px rgba(0, 208, 132, 0.35)',
                      'glow-iris': '0 20px 60px -15px rgba(124, 92, 255, 0.4)',
                      'glow-accent-lg': '0 30px 80px -20px rgba(0, 208, 132, 0.5), 0 10px 30px -10px rgba(0, 208, 132, 0.3)',
                      'card': '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
                      'card-hover': '0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
                      'inset-glow': 'inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
                      'premium': '0 50px 100px -20px rgba(15, 23, 42, 0.25), 0 30px 60px -30px rgba(0, 102, 255, 0.3)',
                    },
                    backgroundImage: {
                      'mesh-hero': 'radial-gradient(at 27% 37%, hsla(215,98%,61%,0.18) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(160,98%,40%,0.14) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(217,97%,72%,0.12) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256,96%,67%,0.10) 0px, transparent 50%)',
                      'mesh-dark': 'radial-gradient(at 20% 30%, hsla(215,98%,61%,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(160,98%,40%,0.20) 0px, transparent 50%), radial-gradient(at 50% 100%, hsla(280,96%,67%,0.15) 0px, transparent 50%)',
                      'grid-light': 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
                      'aurora': 'conic-gradient(from 180deg at 50% 50%, #0066FF 0deg, #7C5CFF 90deg, #00D084 180deg, #7AA6FF 270deg, #0066FF 360deg)',
                    },
                    animation: {
                      'fade-up': 'fadeUp 0.6s ease-out',
                      'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                      'shimmer': 'shimmer 2.5s linear infinite',
                      'tick': 'tick 0.6s ease-out',
                      'float': 'float 6s ease-in-out infinite',
                      'aurora-spin': 'auroraSpin 8s linear infinite',
                      'breathe': 'breathe 4s ease-in-out infinite',
                      'slide-in-right': 'slideInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                      'drop-in': 'dropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      'gradient-x': 'gradientX 6s ease infinite',
                    },
                    keyframes: {
                      fadeUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                      pulseSoft: { '0%,100%': { opacity: '0.7' }, '50%': { opacity: '1' } },
                      shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
                      tick: { '0%': { transform: 'scale(0.5)', opacity: '0' }, '60%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
                      float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
                      auroraSpin: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
                      breathe: { '0%,100%': { transform: 'scale(1)', opacity: '0.7' }, '50%': { transform: 'scale(1.05)', opacity: '1' } },
                      slideInRight: { '0%': { opacity: '0', transform: 'translateX(40px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
                      dropIn: { '0%': { opacity: '0', transform: 'translateY(-30px) scale(0.9)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
                      gradientX: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
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
                background: linear-gradient(135deg, #0066FF 0%, #7C5CFF 50%, #00D084 100%);
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .text-gradient-iris {
                background: linear-gradient(135deg, #7C5CFF 0%, #0066FF 100%);
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
              /* 3D Tilt 카드 (마우스 패럴랙스) */
              .tilt-card {
                transform-style: preserve-3d;
                transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
                will-change: transform;
              }
              .tilt-card > * {
                transform: translateZ(0);
              }
              /* 글로우 보더 (호흡) */
              .glow-border {
                position: relative;
                background: white;
                z-index: 0;
              }
              .glow-border::before {
                content: '';
                position: absolute;
                inset: -2px;
                border-radius: inherit;
                background: conic-gradient(from var(--angle, 0deg), #0066FF, #00D084, #7AA6FF, #0066FF);
                z-index: -1;
                opacity: 0;
                transition: opacity 0.3s ease;
                animation: rotateAngle 4s linear infinite;
              }
              .glow-border:focus-within::before,
              .glow-border:hover::before {
                opacity: 1;
              }
              @property --angle {
                syntax: '<angle>';
                initial-value: 0deg;
                inherits: false;
              }
              @keyframes rotateAngle {
                to { --angle: 360deg; }
              }
              /* Aurora 블롭 */
              .aurora-blob {
                background: radial-gradient(circle at 30% 30%, #0066FF 0%, transparent 60%),
                            radial-gradient(circle at 70% 70%, #00D084 0%, transparent 60%);
                filter: blur(60px);
                opacity: 0.4;
              }
              /* SERP 카드 떨어지는 애니메이션 */
              .serp-card {
                animation: dropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
              }
              .serp-card:nth-child(1) { animation-delay: 0.1s; }
              .serp-card:nth-child(2) { animation-delay: 0.25s; }
              .serp-card:nth-child(3) { animation-delay: 0.4s; }
              .serp-card:nth-child(4) { animation-delay: 0.55s; }
              .serp-card:nth-child(5) { animation-delay: 0.7s; }
              .serp-card:nth-child(6) { animation-delay: 0.85s; }
              .serp-card:nth-child(7) { animation-delay: 1.0s; }
              /* 뱃지 글로우 */
              .badge-glow {
                box-shadow: 0 0 0 1px rgba(0, 102, 255, 0.2),
                            0 0 20px rgba(0, 102, 255, 0.3),
                            0 0 40px rgba(0, 208, 132, 0.15);
              }
              /* 텍스트 그라디언트 애니메이션 */
              .text-gradient-animated {
                background: linear-gradient(90deg, #0066FF, #00D084, #7AA6FF, #00D084, #0066FF);
                background-size: 300% 100%;
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradientX 8s ease infinite;
              }
              /* 부드러운 마퀴 (브랜드 로고 무한 스크롤) */
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee { animation: marquee 30s linear infinite; }
              .marquee:hover { animation-play-state: paused; }
              /* 노이즈 강화 (히어로 배경 깊이감 +) */
              .bg-noise-strong::before {
                content: ''; position: absolute; inset: 0; pointer-events: none;
                background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
                opacity: 0.7; mix-blend-mode: multiply; z-index: 0;
              }
              /* 광선 효과 */
              .beam {
                position: absolute;
                width: 1px;
                height: 100%;
                background: linear-gradient(to bottom, transparent, rgba(0, 102, 255, 0.4), transparent);
                animation: beamFall 4s linear infinite;
              }
              @keyframes beamFall {
                0% { transform: translateY(-100%); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(100vh); opacity: 0; }
              }
              /* 카운터 숫자 hover 효과 */
              .counter-card {
                transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
              }
              .counter-card:hover {
                transform: translateY(-6px) scale(1.02);
              }
              .counter-card:hover .counter-num {
                background: linear-gradient(135deg, #0066FF 0%, #00D084 100%);
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              /* SERP 결과 라이브 핑 */
              .live-ping {
                position: relative;
              }
              .live-ping::after {
                content: '';
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                border-radius: inherit;
                background: rgba(0, 208, 132, 0.4);
                animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              }
              @keyframes ping {
                75%, 100% { transform: scale(2); opacity: 0; }
              }
              /* 스크롤 진행바 (상단 고정 그라디언트) */
              .scroll-progress {
                position: fixed; top: 0; left: 0; right: 0; height: 3px;
                background: linear-gradient(90deg, #0066FF 0%, #00D084 50%, #7AA6FF 100%);
                transform: scaleX(0); transform-origin: 0 0;
                z-index: 100; transition: transform 0.1s linear;
                box-shadow: 0 1px 8px rgba(0, 102, 255, 0.4);
              }
              /* 마퀴 그라디언트 마스크 */
              .marquee-mask {
                mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
                -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
              }
              /* 스포트라이트 카드 (마우스 따라 빛이 따라옴) */
              .spotlight {
                position: relative;
                overflow: hidden;
              }
              .spotlight::before {
                content: '';
                position: absolute;
                top: var(--mx, 0); left: var(--my, 0);
                width: 400px; height: 400px;
                transform: translate(-50%, -50%);
                background: radial-gradient(circle, rgba(0, 102, 255, 0.18) 0%, transparent 60%);
                opacity: 0; transition: opacity 0.3s ease;
                pointer-events: none;
                z-index: 0;
              }
              .spotlight:hover::before { opacity: 1; }
              .spotlight > * { position: relative; z-index: 1; }
              /* 인풋 입력 검증 체크 */
              .flash-success {
                animation: flashSuccess 0.6s ease-out;
              }
              @keyframes flashSuccess {
                0% { background-color: transparent; }
                30% { background-color: rgba(0, 208, 132, 0.12); }
                100% { background-color: transparent; }
              }
              .shake { animation: shake 0.4s; }
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-6px); }
                75% { transform: translateX(6px); }
              }
              /* 떠다니는 키워드 칩 (히어로 배경) */
              .floating-kw {
                position: absolute;
                padding: 6px 14px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(0, 102, 255, 0.15);
                box-shadow: 0 8px 24px rgba(0, 102, 255, 0.08);
                font-size: 12px; font-weight: 600;
                color: #334155;
                white-space: nowrap;
                animation: kwFloat 12s ease-in-out infinite;
                pointer-events: none;
                z-index: 1;
              }
              @keyframes kwFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
                50% { transform: translateY(-20px) rotate(2deg); opacity: 1; }
              }
              /* 자석 버튼 (마우스 따라 미세하게 끌림) */
              .magnetic { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
              /* SERP 시뮬레이션 타이핑 커서 */
              .typing-cursor::after {
                content: '|';
                color: #0066FF;
                font-weight: 200;
                animation: blink 1s infinite;
                margin-left: 1px;
              }
              @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
              /* ============ 다크 프리미엄 HERO (v3: 3색 오로라) ============ */
              .hero-dark {
                background:
                  radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0, 102, 255, 0.38), transparent 60%),
                  radial-gradient(ellipse 50% 35% at 85% 25%, rgba(124, 92, 255, 0.22), transparent 60%),
                  radial-gradient(ellipse 60% 40% at 75% 55%, rgba(0, 208, 132, 0.15), transparent 60%),
                  radial-gradient(ellipse 60% 40% at 15% 70%, rgba(122, 166, 255, 0.16), transparent 60%),
                  linear-gradient(180deg, #030614 0%, #080C1E 40%, #0F172A 100%);
                color: #F8FAFC;
              }
              .hero-dark .text-display,
              .hero-dark h1, .hero-dark h2 {
                color: #F8FAFC;
                text-shadow: 0 0 60px rgba(0, 102, 255, 0.15);
              }
              /* 별 그리드 (다크 hero 배경) */
              .stars-grid {
                background-image:
                  radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0);
                background-size: 32px 32px;
                mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 30%, transparent 80%);
                -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 30%, transparent 80%);
              }
              /* 큰 그라디언트 텍스트 (다크용) */
              .text-gradient-dark {
                background: linear-gradient(135deg, #FFFFFF 0%, #A78BFA 35%, #7AA6FF 60%, #00D084 100%);
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .text-gradient-aurora {
                background: linear-gradient(90deg, #7AA6FF 0%, #A78BFA 30%, #00D084 60%, #7AA6FF 100%);
                background-size: 200% 100%;
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradientX 6s ease infinite;
              }
              /* 글래스 패널 (다크 hero용) */
              .glass-dark {
                background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow:
                  inset 0 1px 0 rgba(255,255,255,0.1),
                  0 30px 80px -20px rgba(0,0,0,0.5);
              }
              /* Bento 카드 hover 보더 빛 */
              .bento-card {
                position: relative;
                background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
                border: 1px solid rgba(255,255,255,0.08);
                transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
                overflow: hidden;
              }
              .bento-card::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: inherit;
                padding: 1px;
                background: linear-gradient(135deg, rgba(0, 102, 255, 0.45), rgba(124, 92, 255, 0.35) 35%, transparent 50%, rgba(0, 208, 132, 0.45));
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor; mask-composite: exclude;
                opacity: 0; transition: opacity 0.4s;
                pointer-events: none;
              }
              .bento-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.15); }
              .bento-card:hover::before { opacity: 1; }
              /* 3D 데이터 큐브 (CSS only) */
              .data-cube {
                width: 280px; height: 280px;
                position: relative;
                transform-style: preserve-3d;
                animation: cubeRotate 22s linear infinite;
                margin: 0 auto;
              }
              .cube-face {
                position: absolute;
                inset: 0;
                border: 1px solid rgba(122, 166, 255, 0.4);
                background: linear-gradient(135deg, rgba(0, 102, 255, 0.18), rgba(0, 208, 132, 0.1));
                backdrop-filter: blur(8px);
                box-shadow: inset 0 0 60px rgba(0, 102, 255, 0.15);
                display: flex; align-items: center; justify-content: center;
                font-size: 11px; color: rgba(255,255,255,0.6); font-family: 'JetBrains Mono', monospace;
              }
              .cube-face.front  { transform: translateZ(140px); }
              .cube-face.back   { transform: rotateY(180deg) translateZ(140px); }
              .cube-face.right  { transform: rotateY(90deg) translateZ(140px); }
              .cube-face.left   { transform: rotateY(-90deg) translateZ(140px); }
              .cube-face.top    { transform: rotateX(90deg) translateZ(140px); }
              .cube-face.bottom { transform: rotateX(-90deg) translateZ(140px); }
              @keyframes cubeRotate {
                0%   { transform: rotateX(-15deg) rotateY(0deg); }
                100% { transform: rotateX(-15deg) rotateY(360deg); }
              }
              /* 다크 인풋 (글래스 + 글로우) */
              .input-dark-glow {
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.1);
                transition: all 0.3s;
              }
              .input-dark-glow:focus-within {
                border-color: rgba(0, 102, 255, 0.5);
                box-shadow:
                  0 0 0 4px rgba(0, 102, 255, 0.15),
                  0 0 60px rgba(0, 102, 255, 0.3),
                  0 20px 60px -10px rgba(0, 0, 0, 0.6);
              }
              /* 라이브 활동 피드 (다크) */
              .live-feed-row {
                opacity: 0;
                animation: feedIn 0.6s ease-out forwards;
              }
              @keyframes feedIn {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              /* 빛나는 보더 (orbit) */
              .orbit-border {
                position: relative;
              }
              .orbit-border::after {
                content: '';
                position: absolute;
                inset: -1px;
                border-radius: inherit;
                background: conic-gradient(from 0deg, transparent 0deg, #00D084 60deg, transparent 120deg, transparent 240deg, #0066FF 300deg, transparent 360deg);
                animation: rotateAngle 6s linear infinite;
                z-index: -1;
              }
              /* ============ v3 신규 유틸리티 ============ */
              /* 섹션 eyebrow (통일된 라벨) */
              .eyebrow {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 5px 14px; border-radius: 999px;
                font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
                background: linear-gradient(135deg, rgba(0,102,255,0.08), rgba(124,92,255,0.08));
                border: 1px solid rgba(0,102,255,0.15);
                color: #0052CC;
              }
              /* 프리미엄 CTA 버튼 shine */
              .btn-shine { position: relative; overflow: hidden; }
              .btn-shine::after {
                content: ''; position: absolute; inset: 0;
                background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
                transform: translateX(-100%);
                transition: transform 0.7s ease;
              }
              .btn-shine:hover::after { transform: translateX(100%); }
              /* 라이트 섹션 카드 v3 (미세한 그라디언트 헤어라인) */
              .card-v3 {
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 20px;
                transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s;
              }
              .card-v3:hover {
                transform: translateY(-4px);
                border-color: rgba(0,102,255,0.25);
                box-shadow: 0 20px 50px -12px rgba(0,102,255,0.12), 0 8px 24px -8px rgba(15,23,42,0.08);
              }
              /* 오로라 링 CTA 래퍼 */
              .aurora-ring {
                position: relative; border-radius: inherit;
              }
              .aurora-ring::before {
                content: ''; position: absolute; inset: -2px; border-radius: inherit;
                background: conic-gradient(from var(--angle, 0deg), #0066FF, #7C5CFF, #00D084, #7AA6FF, #0066FF);
                animation: rotateAngle 5s linear infinite;
                z-index: -1; filter: blur(6px); opacity: 0.7;
              }
              /* 내비 링크 그라디언트 언더라인 */
              .nav-link { position: relative; }
              .nav-link::after {
                content: ''; position: absolute; left: 12px; right: 12px; bottom: 4px; height: 2px;
                border-radius: 2px;
                background: linear-gradient(90deg, #0066FF, #00D084);
                transform: scaleX(0); transform-origin: left;
                transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
              }
              .nav-link:hover::after { transform: scaleX(1); }
              /* 숫자 강조 (지표) */
              .stat-num {
                font-variant-numeric: tabular-nums;
                background: linear-gradient(180deg, #FFFFFF 30%, rgba(255,255,255,0.55) 100%);
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              /* 다크 섹션 divider 글로우 */
              .divider-glow {
                height: 1px; border: 0;
                background: linear-gradient(90deg, transparent, rgba(0,102,255,0.5), rgba(124,92,255,0.5), rgba(0,208,132,0.5), transparent);
              }
              /* 미디어 쿼리 - 모션 줄임 */
              @media (prefers-reduced-motion: reduce) {
                .serp-card, .float, .beam, .marquee, .text-gradient-animated,
                .badge-glow, .floating-kw, .typing-cursor::after, .scroll-progress {
                  animation: none !important;
                }
              }
            `,
          }}
        />
        <link rel="stylesheet" href="/static/styles.css" />
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
