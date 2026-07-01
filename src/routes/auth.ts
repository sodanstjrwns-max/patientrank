// 인증 라우트: Google OAuth + GSC 연동, 로그아웃
// (매직링크는 2026-04 제거됨 — 이메일 스팸 이슈)
import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import {
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
import {
  buildGscAuthUrl,
  consumeGscState,
  exchangeGscCode,
  saveGscTokens,
} from '../lib/gsc'

const auth = new Hono<{ Bindings: Bindings }>()

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

  try {
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
    let user
    try {
      user = await upsertGoogleUser(c, info)
    } catch (e: any) {
      console.error('[google/callback] upsertGoogleUser failed:', e?.message, e?.stack)
      return c.redirect(`/login?error=user_upsert_failed&detail=${encodeURIComponent(e?.message || 'unknown')}`)
    }

    // 세션 생성
    try {
      await createSession(c, user)
    } catch (e: any) {
      console.error('[google/callback] createSession failed:', e?.message, e?.stack)
      return c.redirect(`/login?error=session_create_failed&detail=${encodeURIComponent(e?.message || 'unknown')}`)
    }

    // redirect_to가 있으면 우선, 없으면 admin/dashboard
    if (stateInfo.redirect_to && stateInfo.redirect_to.startsWith('/')) {
      return c.redirect(stateInfo.redirect_to)
    }
    return c.redirect(user.is_admin ? '/admin' : '/dashboard')
  } catch (e: any) {
    console.error('[google/callback] unexpected error:', e?.message, e?.stack)
    return c.redirect(`/login?error=callback_failed&detail=${encodeURIComponent(e?.message || 'unknown')}`)
  }
})

/**
 * GET /auth/gsc/connect
 * 로그인된 유저가 자기 GSC를 SaaS에 연결 (프리미엄 전용)
 */
auth.get('/gsc/connect', async (c) => {
  const user = await getUserFromCookie(c)
  if (!user) return c.redirect('/login?error=login_required&next=/dashboard')

  // 프리미엄 게이팅: pro/agency/admin만
  const allowed = user.is_admin || user.plan === 'pro' || user.plan === 'agency'
  if (!allowed) return c.redirect('/pricing?error=gsc_premium_only')

  if (!c.env.GOOGLE_CLIENT_ID) {
    return c.redirect('/dashboard?error=google_not_configured')
  }

  const redirectTo = c.req.query('next') || '/dashboard'
  try {
    const url = await buildGscAuthUrl(c, user.id, redirectTo)
    return c.redirect(url)
  } catch (e) {
    console.error('[gsc] auth URL build failed:', e)
    return c.redirect('/dashboard?error=gsc_init_failed')
  }
})

/**
 * GET /auth/gsc/callback
 * Google → 콜백 → refresh_token DB 저장
 */
auth.get('/gsc/callback', async (c) => {
  const code = c.req.query('code') || ''
  const state = c.req.query('state') || ''
  const error = c.req.query('error')

  if (error) return c.redirect(`/dashboard?error=gsc_${error}`)
  if (!code || !state) return c.redirect('/dashboard?error=gsc_missing_code')

  const stateInfo = await consumeGscState(c, state)
  if (!stateInfo) return c.redirect('/dashboard?error=gsc_invalid_state')

  // 콜백 수신 시점의 로그인 세션과 state의 user_id가 일치하는지 검증
  const sessionUser = await getUserFromCookie(c)
  if (!sessionUser || sessionUser.id !== stateInfo.user_id) {
    return c.redirect('/login?error=gsc_session_mismatch')
  }

  const tokens = await exchangeGscCode(c, code)
  if (!tokens?.access_token) return c.redirect('/dashboard?error=gsc_token_exchange_failed')

  try {
    await saveGscTokens(c, sessionUser.id, tokens)
  } catch (e) {
    console.error('[gsc] saveTokens failed:', e)
    return c.redirect('/dashboard?error=gsc_save_failed&hint=consent_needed')
  }

  const back = stateInfo.redirect_to && stateInfo.redirect_to.startsWith('/')
    ? `${stateInfo.redirect_to}${stateInfo.redirect_to.includes('?') ? '&' : '?'}gsc_connected=1`
    : '/dashboard?gsc_connected=1'
  return c.redirect(back)
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
