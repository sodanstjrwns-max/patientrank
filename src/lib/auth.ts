// 인증 서비스: Google OAuth 전용, 세션 관리
// (매직링크 방식은 2026-04 제거됨 — 이메일 스팸 + UX 마찰 이슈)

import type { Context } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import type { Bindings } from './types'
import { signJwt, verifyJwt, uuidv4 } from './crypto'
import { hashIp, getClientIp } from './utils'

const SESSION_TTL_DAYS = 30
const COOKIE_NAME = 'pr_session'

/**
 * JWT 시크릿 필수화 — 미설정 시 공개된 폴백 문자열로 서명되는 보안 사고 방지
 * (로컬은 .dev.vars, 프로덕션은 wrangler pages secret으로 주입)
 */
function requireJwtSecret(env: Bindings): string {
  const secret = env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다 (.dev.vars 또는 pages secret 확인)')
  return secret
}

export interface AuthUser {
  id: number
  email: string
  name?: string | null
  clinic_name?: string | null
  specialty?: string | null
  plan: string
  is_admin: 0 | 1
  plan_ends_at?: string | null
}

/**
 * 세션 생성 + 쿠키 세팅
 */
export async function createSession(c: Context<{ Bindings: Bindings }>, user: AuthUser): Promise<string> {
  const secret = requireJwtSecret(c.env)
  const jti = uuidv4()
  const ipHash = await hashIp(getClientIp(c.req.raw))
  const ua = c.req.header('user-agent') || ''
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400000).toISOString()

  await c.env.DB.prepare(
    `INSERT INTO sessions (id, user_id, user_agent, ip_hash, expires_at) VALUES (?, ?, ?, ?, ?)`
  ).bind(jti, user.id, ua.slice(0, 200), ipHash, expiresAt).run()

  const token = await signJwt(
    { sub: user.id, email: user.email, is_admin: user.is_admin, plan: user.plan, jti },
    secret,
    SESSION_TTL_DAYS * 86400,
  )

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: (c.env.APP_URL || '').startsWith('https://'),
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 86400,
  })
  return token
}

/**
 * 쿠키에서 세션 읽기 → user 반환
 */
export async function getUserFromCookie(c: Context<{ Bindings: Bindings }>): Promise<AuthUser | null> {
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return null
  const secret = requireJwtSecret(c.env)
  const payload = await verifyJwt(token, secret)
  if (!payload) return null

  // 세션 revoke/만료 체크
  const sess = await c.env.DB.prepare(
    `SELECT s.id, s.revoked_at, s.expires_at,
            u.id as user_id, u.email, u.name, u.clinic_name, u.specialty, u.plan, u.is_admin, u.plan_ends_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? LIMIT 1`
  ).bind(payload.jti).first<any>()
  if (!sess) return null
  if (sess.revoked_at) return null
  if (new Date(sess.expires_at).getTime() < Date.now()) return null

  // last_seen 갱신 (블로킹하지 않기 위해 await는 하되 실패 무시)
  c.env.DB.prepare(`UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(payload.jti).run().catch(() => {})

  return {
    id: Number(sess.user_id),
    email: sess.email,
    name: sess.name,
    clinic_name: sess.clinic_name,
    specialty: sess.specialty,
    plan: sess.plan || 'free',
    is_admin: sess.is_admin ? 1 : 0,
    plan_ends_at: sess.plan_ends_at,
  }
}

/**
 * 로그아웃 (세션 revoke + 쿠키 삭제)
 */
export async function logout(c: Context<{ Bindings: Bindings }>): Promise<void> {
  const token = getCookie(c, COOKIE_NAME)
  if (token) {
    const secret = requireJwtSecret(c.env)
    const payload = await verifyJwt(token, secret)
    if (payload?.jti) {
      await c.env.DB.prepare(`UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(payload.jti).run().catch(() => {})
    }
  }
  deleteCookie(c, COOKIE_NAME, { path: '/' })
}

/**
 * 플랜별 월 조회 한도
 */
export function scanLimitForPlan(plan: string): number {
  switch (plan) {
    case 'basic': return 30
    case 'pro': return 50
    case 'agency': return 150
    default: return 3 // free
  }
}

/**
 * 플랜별 도메인 한도
 */
export function domainLimitForPlan(plan: string): number {
  switch (plan) {
    case 'basic': return 1
    case 'pro': return 3
    case 'agency': return 20
    default: return 1
  }
}
