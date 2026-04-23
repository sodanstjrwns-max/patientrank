// Patient Rank 공통 유틸

/**
 * URL에서 호스트(도메인)만 깔끔히 추출
 * - http(s):// 프로토콜 보정
 * - www. 제거
 * - 경로/쿼리/해시 제거
 * - 소문자 정규화
 */
export function extractDomain(input: string): string | null {
  if (!input || typeof input !== 'string') return null
  let raw = input.trim().toLowerCase()
  if (!raw) return null
  if (!/^https?:\/\//.test(raw)) raw = 'https://' + raw
  try {
    const u = new URL(raw)
    let host = u.hostname
    if (host.startsWith('www.')) host = host.slice(4)
    if (!host.includes('.')) return null
    return host
  } catch {
    return null
  }
}

/**
 * IP 주소를 SHA-256으로 해시 (개인정보 보호)
 */
export async function hashIp(ip: string, salt = 'patientrank'): Promise<string> {
  const data = new TextEncoder().encode(ip + ':' + salt)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 요청에서 클라이언트 IP 추출 (Cloudflare 헤더 우선)
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  )
}

/**
 * 숫자 포맷 (콤마 + 축약)
 */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return Math.round(n).toLocaleString('ko-KR')
}

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try { return JSON.parse(s) as T } catch { return fallback }
}

/**
 * 키워드 배열로 랭킹 카운터 계산
 */
export function computeCounters(keywords: Array<{ rank: number; etv?: number }>) {
  let top3 = 0, top10 = 0, top30 = 0, top100 = 0, etv = 0
  for (const k of keywords) {
    if (k.rank <= 3) top3++
    if (k.rank <= 10) top10++
    if (k.rank <= 30) top30++
    if (k.rank <= 100) top100++
    etv += Number(k.etv || 0)
  }
  return {
    total: keywords.length,
    top3, top10, top30, top100,
    estimated_traffic: Math.round(etv),
  }
}

/**
 * HTML 이스케이프
 */
export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
