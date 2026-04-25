// 인증 서비스: 매직링크 발급·검증, 세션 관리

import type { Context } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import type { Bindings } from './types'
import { randomToken, signJwt, verifyJwt, uuidv4 } from './crypto'
import { hashIp, getClientIp } from './utils'

const MAGIC_LINK_TTL_MIN = 15
const SESSION_TTL_DAYS = 30
const COOKIE_NAME = 'pr_session'

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
 * 매직링크 토큰 생성 + DB 저장 + 이메일 발송 URL 반환
 */
export async function issueMagicLink(env: Bindings, email: string): Promise<{ url: string; token: string }> {
  const token = randomToken(32)
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MIN * 60 * 1000).toISOString()
  await env.DB.prepare(
    `INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)`
  ).bind(email.toLowerCase(), token, expiresAt).run()
  const url = `${env.APP_URL}/auth/verify?token=${encodeURIComponent(token)}`
  return { url, token }
}

/**
 * Resend로 매직링크 이메일 발송
 */
export async function sendMagicLinkEmail(env: Bindings, email: string, url: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.log('[DEV] magic link URL:', url)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Patient Rank <login@patientrank.kr>',
        to: [email],
        subject: '[Patient Rank] 로그인 링크',
        html: `
          <div style="font-family:Pretendard,sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#0066FF;margin:0 0 16px">Patient Rank 로그인</h2>
            <p>아래 버튼을 클릭하면 바로 로그인됩니다. 링크는 ${MAGIC_LINK_TTL_MIN}분간 유효합니다.</p>
            <p style="margin:24px 0">
              <a href="${url}" style="display:inline-block;padding:14px 28px;background:#0066FF;color:white;border-radius:8px;text-decoration:none;font-weight:600">로그인하기</a>
            </p>
            <p style="font-size:12px;color:#999;word-break:break-all">
              버튼이 안 보이면 이 링크를 복사해 붙여넣으세요:<br>${url}
            </p>
            <hr style="margin:32px 0;border:none;border-top:1px solid #eee">
            <p style="font-size:12px;color:#999">
              Patient Rank · 국내 최초 의료기관 전용 구글 SEO 진단<br>
              이 메일을 요청한 적이 없다면 무시하셔도 됩니다.
            </p>
          </div>
        `,
      }),
    })
    if (!res.ok) {
      console.error('Resend failed:', res.status, await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error('Resend error:', e)
    return false
  }
}

/**
 * 매직링크 토큰 검증 → user 반환 (없으면 신규 생성)
 */
export async function consumeMagicLink(env: Bindings, token: string): Promise<AuthUser | null> {
  const row = await env.DB.prepare(
    `SELECT id, email, expires_at, used_at FROM magic_links WHERE token = ? LIMIT 1`
  ).bind(token).first<any>()
  if (!row) return null
  if (row.used_at) return null
  if (new Date(row.expires_at).getTime() < Date.now()) return null

  // 사용 처리
  await env.DB.prepare(
    `UPDATE magic_links SET used_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(row.id).run()

  // 유저 조회·생성
  const email = String(row.email).toLowerCase()
  let user = await env.DB.prepare(
    `SELECT id, email, name, clinic_name, specialty, plan, is_admin, plan_ends_at FROM users WHERE email = ?`
  ).bind(email).first<any>()

  if (!user) {
    const ins = await env.DB.prepare(
      `INSERT INTO users (email, plan, plan_started_at) VALUES (?, 'free', CURRENT_TIMESTAMP)`
    ).bind(email).run()
    const newId = Number(ins.meta.last_row_id)
    user = { id: newId, email, name: null, clinic_name: null, specialty: null, plan: 'free', is_admin: 0, plan_ends_at: null }
  }

  return {
    id: Number(user.id),
    email: user.email,
    name: user.name,
    clinic_name: user.clinic_name,
    specialty: user.specialty,
    plan: user.plan || 'free',
    is_admin: user.is_admin ? 1 : 0,
    plan_ends_at: user.plan_ends_at,
  }
}

/**
 * 세션 생성 + 쿠키 세팅
 */
export async function createSession(c: Context<{ Bindings: Bindings }>, user: AuthUser): Promise<string> {
  const secret = c.env.JWT_SECRET || 'dev-only-change-in-production'
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
  const secret = c.env.JWT_SECRET || 'dev-only-change-in-production'
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
    const secret = c.env.JWT_SECRET || 'dev-only-change-in-production'
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
