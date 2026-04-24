// Web Crypto API 기반 JWT + 랜덤 토큰 유틸
// Cloudflare Workers 런타임에서 작동 (Node crypto 미사용)

function b64urlEncode(data: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array
  if (typeof data === 'string') bytes = new TextEncoder().encode(data)
  else if (data instanceof ArrayBuffer) bytes = new Uint8Array(data)
  else bytes = data
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export interface JwtPayload {
  sub: number       // user_id
  email: string
  is_admin: 0 | 1
  plan: string
  jti: string       // session id
  iat: number
  exp: number
}

/**
 * HS256 JWT 발급
 */
export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, ttlSeconds = 60 * 60 * 24 * 30): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const body: JwtPayload = { ...payload, iat: now, exp: now + ttlSeconds }
  const header = { alg: 'HS256', typ: 'JWT' }
  const h = b64urlEncode(JSON.stringify(header))
  const p = b64urlEncode(JSON.stringify(body))
  const unsigned = `${h}.${p}`
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned))
  return `${unsigned}.${b64urlEncode(sig)}`
}

/**
 * JWT 검증 + payload 반환. 실패하면 null
 */
export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const [h, p, s] = token.split('.')
    if (!h || !p || !s) return null
    const unsigned = `${h}.${p}`
    const key = await hmacKey(secret)
    const valid = await crypto.subtle.verify('HMAC', key, b64urlDecode(s), new TextEncoder().encode(unsigned))
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(p))) as JwtPayload
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

/**
 * 랜덤 토큰 (URL-safe). 기본 32바이트 = 256bit
 */
export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return b64urlEncode(buf)
}

/**
 * UUID v4
 */
export function uuidv4(): string {
  // crypto.randomUUID는 Workers에서 지원됨
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const hex = [...b].map(x => x.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}

/**
 * 상수시간 비교
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
