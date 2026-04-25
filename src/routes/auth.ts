// 인증 라우트: 매직링크 발급·검증, Google OAuth, 로그아웃
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
import {
  buildGoogleAuthUrl,
  consumeOAuthState,
  exchangeCodeForToken,
  fetchGoogleUserInfo,
  upsertGoogleUser,
} from '../lib/google-oauth'

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
 * GET /auth/google
 * Google OAuth 시작 → Google 인증 페이지로 리다이렉트
 */
auth.get('/google', async (c) => {
  if (!c.env.GOOGLE_CLIENT_ID) {
    return c.redirect('/login?error=google_not_configured')
  }
  const redirectTo = c.req.query('next') || undefined
  try {
    const url = await buildGoogleAuthUrl(c, redirectTo)
    return c.redirect(url)
  } catch (e) {
    console.error('Google auth URL build failed:', e)
    return c.redirect('/login?error=google_init_failed')
  }
})

/**
 * GET /auth/google/callback
 * Google이 code와 state를 붙여 돌려보내는 콜백
 */
auth.get('/google/callback', async (c) => {
  const code = c.req.query('code') || ''
  const state = c.req.query('state') || ''
  const error = c.req.query('error')

  if (error) return c.redirect(`/login?error=google_${error}`)
  if (!code || !state) return c.redirect('/login?error=missing_code')

  // state 검증 (CSRF 방지)
  const stateInfo = await consumeOAuthState(c, state)
  if (!stateInfo) return c.redirect('/login?error=invalid_state')

  // code → token 교환
  const tokens = await exchangeCodeForToken(c, code)
  if (!tokens?.access_token) return c.redirect('/login?error=token_exchange_failed')

  // 유저 정보 조회
  const info = await fetchGoogleUserInfo(tokens.access_token)
  if (!info?.email) return c.redirect('/login?error=userinfo_failed')
  if (!info.email_verified) return c.redirect('/login?error=email_not_verified')

  // DB upsert
  const user = await upsertGoogleUser(c, info)

  // 세션 생성
  await createSession(c, user)

  // redirect_to가 있으면 우선, 없으면 admin/dashboard
  if (stateInfo.redirect_to && stateInfo.redirect_to.startsWith('/')) {
    return c.redirect(stateInfo.redirect_to)
  }
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
