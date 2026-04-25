// Google OAuth 2.0 (Authorization Code Flow)
// Cloudflare Workers 호환 (Web Crypto API 사용, Node.js crypto 사용 안 함)

import type { Context } from 'hono'
import type { Bindings } from './types'
import { randomToken } from './crypto'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

const STATE_TTL_MIN = 10

export interface GoogleUserInfo {
  sub: string           // Google 고유 ID
  email: string
  email_verified: boolean
  name?: string
  given_name?: string
  family_name?: string
  picture?: string
  locale?: string
}

/**
 * Google OAuth 인증 URL 생성 + state를 DB에 저장 (CSRF 방지)
 */
export async function buildGoogleAuthUrl(
  c: Context<{ Bindings: Bindings }>,
  redirectTo?: string,
): Promise<string> {
  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured')

  const appUrl = c.env.APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/auth/google/callback`

  // CSRF 방지용 state 생성 및 DB 저장
  const state = randomToken(32)
  const expiresAt = new Date(Date.now() + STATE_TTL_MIN * 60000).toISOString()

  await c.env.DB.prepare(
    `INSERT INTO oauth_states (state, provider, redirect_to, expires_at) VALUES (?, 'google', ?, ?)`
  ).bind(state, redirectTo || null, expiresAt).run()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/**
 * state 검증 + 소비 (재사용 방지)
 */
export async function consumeOAuthState(
  c: Context<{ Bindings: Bindings }>,
  state: string,
): Promise<{ redirect_to: string | null } | null> {
  if (!state) return null

  const row = await c.env.DB.prepare(
    `SELECT state, redirect_to, expires_at FROM oauth_states WHERE state = ?`
  ).bind(state).first<{ state: string; redirect_to: string | null; expires_at: string }>()

  if (!row) return null
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await c.env.DB.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()
    return null
  }

  // 소비 (삭제)
  await c.env.DB.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()
  return { redirect_to: row.redirect_to }
}

/**
 * Authorization code → access token 교환
 */
export async function exchangeCodeForToken(
  c: Context<{ Bindings: Bindings }>,
  code: string,
): Promise<{ access_token: string; id_token?: string } | null> {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials missing')
    return null
  }

  const appUrl = c.env.APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/auth/google/callback`

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Google token exchange failed:', res.status, text)
    return null
  }

  return await res.json() as any
}

/**
 * Access token → 사용자 정보
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    console.error('Google userinfo fetch failed:', res.status)
    return null
  }
  return await res.json() as GoogleUserInfo
}

/**
 * Google 유저 정보 → DB 유저 조회·생성·연결
 * - google_id 매치되면 즉시 반환
 * - email 매치되면 기존 계정에 google_id 연결 (auth_provider='both')
 * - 없으면 신규 생성
 */
export async function upsertGoogleUser(
  c: Context<{ Bindings: Bindings }>,
  info: GoogleUserInfo,
) {
  const email = info.email.toLowerCase()
  const googleId = info.sub
  const name = info.name || info.given_name || null
  const avatar = info.picture || null

  // 1) google_id로 조회
  let user = await c.env.DB.prepare(
    `SELECT id, email, name, clinic_name, specialty, plan, is_admin, plan_ends_at, google_id, auth_provider
     FROM users WHERE google_id = ?`
  ).bind(googleId).first<any>()

  if (user) {
    // avatar/name 최신화
    await c.env.DB.prepare(
      `UPDATE users SET avatar_url = COALESCE(?, avatar_url), name = COALESCE(name, ?) WHERE id = ?`
    ).bind(avatar, name, user.id).run()
    return normalizeUser(user)
  }

  // 2) email로 조회 (기존 매직링크 유저 → Google 연결)
  user = await c.env.DB.prepare(
    `SELECT id, email, name, clinic_name, specialty, plan, is_admin, plan_ends_at, google_id, auth_provider
     FROM users WHERE email = ?`
  ).bind(email).first<any>()

  if (user) {
    await c.env.DB.prepare(
      `UPDATE users SET google_id = ?, avatar_url = COALESCE(?, avatar_url),
         name = COALESCE(name, ?), auth_provider = 'both' WHERE id = ?`
    ).bind(googleId, avatar, name, user.id).run()
    return normalizeUser({ ...user, google_id: googleId })
  }

  // 3) 신규 생성
  const ins = await c.env.DB.prepare(
    `INSERT INTO users (email, name, google_id, avatar_url, auth_provider, plan, plan_started_at)
     VALUES (?, ?, ?, ?, 'google', 'free', CURRENT_TIMESTAMP)`
  ).bind(email, name, googleId, avatar).run()

  const newId = Number(ins.meta.last_row_id)
  return {
    id: newId,
    email,
    name,
    clinic_name: null,
    specialty: null,
    plan: 'free' as const,
    is_admin: 0,
    plan_ends_at: null,
  }
}

function normalizeUser(row: any) {
  return {
    id: Number(row.id),
    email: row.email,
    name: row.name,
    clinic_name: row.clinic_name,
    specialty: row.specialty,
    plan: row.plan || 'free',
    is_admin: row.is_admin ? 1 : 0,
    plan_ends_at: row.plan_ends_at,
  }
}
