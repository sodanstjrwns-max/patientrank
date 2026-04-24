// 인증 라우트: 매직링크 발급·검증, 로그아웃
import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import {
  issueMagicLink,
  sendMagicLinkEmail,
  consumeMagicLink,
  createSession,
  logout,
  getUserFromCookie,
} from '../lib/auth'

const auth = new Hono<{ Bindings: Bindings }>()

/**
 * POST /api/auth/magic-link
 * body: { email: string, next?: string }
 * 매직링크 발급 + 이메일 발송 (or DEV에서는 URL 직접 반환)
 */
auth.post('/magic-link', async (c) => {
  const body = await c.req.json().catch(() => ({})) as { email?: string; next?: string }
  const email = String(body?.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'INVALID_EMAIL', message: '올바른 이메일 주소를 입력해주세요' }, 400)
  }

  const { url } = await issueMagicLink(c.env, email)
  const sent = await sendMagicLinkEmail(c.env, email, url)

  // 개발 환경: RESEND 키가 없으면 링크를 응답에 포함해 바로 클릭 가능하게
  const isDev = !c.env.RESEND_API_KEY
  return c.json({
    ok: true,
    message: sent
      ? `${email} 으로 로그인 링크를 보냈습니다. 메일함을 확인해주세요.`
      : '개발 모드: 아래 링크를 클릭해 로그인하세요',
    devLink: isDev ? url : undefined,
  })
})

/**
 * GET /auth/verify?token=xxx
 * 매직링크 클릭 → 세션 발급 → 대시보드 리다이렉트
 */
auth.get('/verify', async (c) => {
  const token = c.req.query('token') || ''
  if (!token) return c.redirect('/login?error=invalid_token')

  const user = await consumeMagicLink(c.env, token)
  if (!user) return c.redirect('/login?error=expired_or_used')

  await createSession(c, user)
  // 어드민이면 /admin, 일반 유저는 /dashboard
  return c.redirect(user.is_admin ? '/admin' : '/dashboard')
})

/**
 * POST /api/auth/logout
 */
auth.post('/logout', async (c) => {
  await logout(c)
  return c.json({ ok: true })
})

/**
 * GET /api/auth/me
 * 현재 로그인 유저 정보
 */
auth.get('/me', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.json({ ok: false, user: null }, 401)
  return c.json({ ok: true, user })
})

export default auth
