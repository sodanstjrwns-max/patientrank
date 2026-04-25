// Sitemap 파서 — 옵션 B: sitemap.xml에서 URL 추출 → 키워드 역변환
// 지원: sitemap index (sitemap 모음), sitemap urlset (URL 모음)

import { slugToKeywordCandidates } from './korea-regions'

const UA = 'Mozilla/5.0 (compatible; PatientRankBot/1.0)'
const MAX_SITEMAP_SIZE = 5 * 1024 * 1024 // 5MB 제한
const FETCH_TIMEOUT_MS = 8000

/**
 * URL에서 sitemap.xml 경로 후보 생성
 */
function sitemapCandidates(domain: string): string[] {
  const base = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return [
    `https://${base}/sitemap.xml`,
    `https://${base}/sitemap_index.xml`,
    `https://${base}/sitemap-index.xml`,
    `http://${base}/sitemap.xml`,
  ]
}

async function fetchWithTimeout(url: string, ms = FETCH_TIMEOUT_MS): Promise<Response | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), ms)
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept': 'application/xml, text/xml, */*' },
      redirect: 'follow',
    })
    clearTimeout(timer)
    return res
  } catch {
    return null
  }
}

/**
 * robots.txt에서 Sitemap: 선언 파싱
 */
async function sitemapsFromRobots(domain: string): Promise<string[]> {
  const base = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const res = await fetchWithTimeout(`https://${base}/robots.txt`, 4000)
  if (!res || !res.ok) return []
  const txt = await res.text()
  const found: string[] = []
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*sitemap\s*:\s*(\S+)/i)
    if (m && m[1]) found.push(m[1].trim())
  }
  return found
}

/**
 * <loc> 태그 간단 추출 (XML DOM 없이 정규식으로 처리 - Workers 친화적)
 */
function extractLocs(xml: string): string[] {
  const locs: string[] = []
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].trim())
  }
  return locs
}

function isSitemapIndex(xml: string): boolean {
  return /<sitemapindex[\s>]/i.test(xml)
}

/**
 * Sitemap 하나를 파싱해 URL 목록 반환
 * - sitemap index면 재귀적으로 하위 sitemap까지 파싱
 * - 최대 depth 2, 최대 URL 2000개로 제한
 */
export async function fetchAllUrlsFromSitemap(
  sitemapUrl: string,
  depth = 0,
  maxUrls = 2000,
): Promise<string[]> {
  if (depth > 2) return []
  const res = await fetchWithTimeout(sitemapUrl)
  if (!res || !res.ok) return []
  const sizeHeader = Number(res.headers.get('content-length') ?? 0)
  if (sizeHeader > MAX_SITEMAP_SIZE) return []
  const xml = await res.text()
  if (xml.length > MAX_SITEMAP_SIZE) return []

  const locs = extractLocs(xml)
  if (!locs.length) return []

  if (isSitemapIndex(xml)) {
    // 하위 sitemap 재귀 파싱 (최대 10개까지만)
    const urls: string[] = []
    for (const sub of locs.slice(0, 10)) {
      if (urls.length >= maxUrls) break
      const subUrls = await fetchAllUrlsFromSitemap(sub, depth + 1, maxUrls - urls.length)
      urls.push(...subUrls)
    }
    return urls.slice(0, maxUrls)
  }

  return locs.slice(0, maxUrls)
}

/**
 * 도메인에서 sitemap URL 목록 자동 발견 + 전체 URL 수집
 */
export async function discoverAllUrls(domain: string, maxUrls = 2000): Promise<{
  sitemapUrl: string | null
  urls: string[]
}> {
  // 1) robots.txt에서 Sitemap 찾기
  const robotsSitemaps = await sitemapsFromRobots(domain)
  const candidates = [...robotsSitemaps, ...sitemapCandidates(domain)]

  for (const sm of candidates) {
    const urls = await fetchAllUrlsFromSitemap(sm, 0, maxUrls)
    if (urls.length) {
      return { sitemapUrl: sm, urls }
    }
  }
  return { sitemapUrl: null, urls: [] }
}

/**
 * URL 경로에서 슬러그 조각 추출 → 한글 키워드 후보 리스트 반환
 * 예:
 *   https://bdbddc.com/area/hongseong-laminate → ["홍성 라미네이트", "홍성라미네이트"]
 *   https://bdbddc.com/area/gangnam → ["강남 치과", "강남치과"]
 */
export function extractKeywordCandidatesFromUrl(url: string, baseSpecialty = '치과'): string[] {
  try {
    const u = new URL(url)
    const segments = u.pathname.split('/').filter(Boolean)
    const candidates = new Set<string>()

    for (const seg of segments) {
      // 슬러그에 하이픈이 있거나, 지역명 단독인 경우만 시도
      const decoded = decodeURIComponent(seg).toLowerCase()
      // 알파벳/숫자/하이픈만 있는 슬러그 (한글 URL 제외 — 직접 키워드)
      if (/^[a-z0-9-]+$/i.test(decoded)) {
        const kws = slugToKeywordCandidates(decoded, baseSpecialty)
        kws.forEach(k => candidates.add(k))
      } else if (/[가-힣]/.test(decoded)) {
        // 한글 경로면 그대로 키워드 후보로 (공백 정규화)
        const clean = decoded.replace(/[-_]+/g, ' ').trim()
        if (clean.length >= 2 && clean.length <= 25) {
          candidates.add(clean)
        }
      }
    }
    return [...candidates]
  } catch {
    return []
  }
}

/**
 * Sitemap에서 키워드 후보를 대량 추출
 * - 중복 제거
 * - 최대 keyword 수 제한 (SERP 스캔 비용 관리용)
 */
export async function extractKeywordsFromSitemap(
  domain: string,
  options: { maxKeywords?: number; baseSpecialty?: string } = {},
): Promise<{
  sitemapUrl: string | null
  totalUrls: number
  keywords: string[]
  keywordToUrl: Record<string, string>  // 키워드 → 원본 URL (검증용)
}> {
  const { maxKeywords = 200, baseSpecialty = '치과' } = options
  const { sitemapUrl, urls } = await discoverAllUrls(domain, 3000)

  const keywordSet = new Map<string, string>()
  for (const u of urls) {
    const kws = extractKeywordCandidatesFromUrl(u, baseSpecialty)
    for (const kw of kws) {
      if (!keywordSet.has(kw)) {
        keywordSet.set(kw, u)
        if (keywordSet.size >= maxKeywords) break
      }
    }
    if (keywordSet.size >= maxKeywords) break
  }

  return {
    sitemapUrl,
    totalUrls: urls.length,
    keywords: [...keywordSet.keys()],
    keywordToUrl: Object.fromEntries(keywordSet),
  }
}
