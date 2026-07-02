/** Tailwind v3 빌드타임 설정 — 기존 CDN tw-config.js 테마를 그대로 포팅 */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    './public/static/*.js', // 프론트 JS가 동적으로 붙이는 클래스도 스캔
  ],
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
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
        'inset-glow': 'inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
        premium: '0 50px 100px -20px rgba(15, 23, 42, 0.25), 0 30px 60px -30px rgba(0, 102, 255, 0.3)',
      },
      backgroundImage: {
        'mesh-hero':
          'radial-gradient(at 27% 37%, hsla(215,98%,61%,0.18) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(160,98%,40%,0.14) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(217,97%,72%,0.12) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256,96%,67%,0.10) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 20% 30%, hsla(215,98%,61%,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(160,98%,40%,0.20) 0px, transparent 50%), radial-gradient(at 50% 100%, hsla(280,96%,67%,0.15) 0px, transparent 50%)',
        'grid-light':
          'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
        aurora:
          'conic-gradient(from 180deg at 50% 50%, #0066FF 0deg, #7C5CFF 90deg, #00D084 180deg, #7AA6FF 270deg, #0066FF 360deg)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        tick: 'tick 0.6s ease-out',
        float: 'float 6s ease-in-out infinite',
        'aurora-spin': 'auroraSpin 8s linear infinite',
        breathe: 'breathe 4s ease-in-out infinite',
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
    },
  },
  plugins: [],
}
