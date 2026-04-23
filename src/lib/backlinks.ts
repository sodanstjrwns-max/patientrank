// 백링크 분석 서비스
// 1) 살아있는 백링크 리스트
// 2) 도메인 권위 지표 (Summary)
// 3) 경쟁사 링크 갭 (우리가 못 받은 링크 기회)

import type { BacklinkRow, BacklinkSummary, CompetitorLinkGap, Bindings } from './types'
import { fetchBacklinks } from './dataforseo'

/**
 * DataForSEO 백링크 응답을 우리 포맷으로 정규화
 */
export function normalizeBacklinks(items: any[]): BacklinkRow[] {
  return items.map((it: any) => ({
    source_url: String(it?.url_from ?? ''),
    source_domain: String(it?.domain_from ?? ''),
    anchor: String(it?.anchor ?? ''),
    domain_rank: Number(it?.rank ?? it?.domain_from_rank ?? 0),
    is_dofollow: it?.dofollow === true,
    is_lost: it?.is_lost === true,
    first_seen: it?.first_seen,
    last_seen: it?.last_seen,
  })).filter(b => b.source_domain)
}

/**
 * 백링크 리스트로 Summary 계산
 */
export function summarizeBacklinks(target: string, links: BacklinkRow[]): BacklinkSummary {
  const uniqueDomains = new Set(links.map(l => l.source_domain))
  const alive = links.filter(l => !l.is_lost)
  const dofollow = alive.filter(l => l.is_dofollow)
  // 도메인 권위: 백링크 도메인 랭크의 가중 평균을 0-100으로 추정
  const avgRank = alive.length > 0
    ? alive.reduce((s, l) => s + (l.domain_rank || 0), 0) / alive.length
    : 0
  // 리퍼링 도메인 수 보너스 (로그 스케일)
  const refBoost = Math.min(20, Math.log10(Math.max(1, uniqueDomains.size)) * 8)
  const domainRank = Math.min(100, Math.round(avgRank * 0.7 + refBoost))

  return {
    target,
    domain_rank: domainRank,
    referring_domains: uniqueDomains.size,
    backlinks_total: links.length,
    dofollow_ratio: alive.length > 0 ? Math.round((dofollow.length / alive.length) * 100) / 100 : 0,
    alive_count: alive.length,
    lost_count: links.length - alive.length,
  }
}

/**
 * 데모 모드 백링크 (도메인에 따라 결과가 약간 바뀌도록 시드 사용)
 */
export function demoBacklinks(target: string): BacklinkRow[] {
  // target 해시로 약간의 분산을 줌
  const seed = [...target].reduce((s, c) => s + c.charCodeAt(0), 0)
  const rand = (i: number) => ((seed * 9301 + i * 49297) % 233280) / 233280

  const sources: Array<[string, string, number, boolean]> = [
    ['naver.com', '네이버 지식인', 88, true],
    ['blog.naver.com', '치과 추천 블로그', 72, false],
    ['cafe.naver.com', '강남맘 카페', 68, false],
    ['tistory.com', '임플란트 후기', 55, true],
    ['brunch.co.kr', '원장 칼럼', 62, true],
    ['yna.co.kr', '연합뉴스 보도자료', 83, true],
    ['mk.co.kr', '매일경제 인터뷰', 81, true],
    ['health.chosun.com', '헬스조선 기사', 76, true],
    ['dailymedi.com', '데일리메디 보도', 64, true],
    ['dentalnews.or.kr', '치의신보 기고', 58, true],
    ['dentalarirang.com', '치과아리랑', 53, true],
    ['youtube.com', '원장 유튜브 채널', 92, false],
    ['instagram.com', '인스타그램 프로필', 94, false],
    ['kakaocorp.com', '카카오맵 등록', 90, false],
    ['mapy.kakao.com', '카카오맵 상세', 86, false],
    ['place.naver.com', '네이버 플레이스', 89, false],
    ['clinic-review.co.kr', '병원 리뷰 사이트', 48, true],
    ['medicityhub.com', '메디시티허브', 42, true],
    ['healthkorea.net', '헬스코리아뉴스', 51, true],
    ['dental-implant-info.co.kr', '임플란트 정보', 35, true],
    ['g4doctor.com', 'G포닥터', 39, true],
    ['old-dental-forum.net', '구(舊) 치과 포럼', 28, true],
    ['broken-reviews.co.kr', '폐쇄된 리뷰 사이트', 22, true],
  ]
  const anchors = ['서울비디치과', '임플란트', '강남 치과', '강남역 치과', '치과 추천', '문석준 원장', '비디치과', '치아교정', target, '더 보기']

  return sources.map(([domain, label, rank, dofollow], i) => {
    const isLost = rand(i + 100) < 0.13 // 약 13%는 lost
    const anchor = anchors[Math.floor(rand(i + 200) * anchors.length)]
    const path = ['', '/review', '/post/' + (1000 + Math.floor(rand(i) * 9000)), '/blog', '/news/article'][i % 5]
    return {
      source_url: `https://${domain}${path}`,
      source_domain: domain,
      anchor,
      domain_rank: rank,
      is_dofollow: dofollow,
      is_lost: isLost,
      first_seen: new Date(Date.now() - (180 + i * 20) * 86400000).toISOString().slice(0, 10),
      last_seen: isLost ? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10) : undefined,
    }
  })
}

/**
 * 데모 경쟁사 링크 갭
 */
export function demoCompetitorGap(target: string): CompetitorLinkGap[] {
  const competitors = [
    { domain: 'gangnam-top-dental.co.kr', rank: 62 },
    { domain: 'yonsei-uplant.com', rank: 58 },
    { domain: 'apgujeong-dental.kr', rank: 54 },
  ]
  const sources: Array<[string, number, string]> = [
    ['hankyung.com', 87, '강남 임플란트 잘하는 곳'],
    ['mt.co.kr', 84, '치과 선택 가이드'],
    ['newsis.com', 82, '임플란트 인터뷰'],
    ['segye.com', 79, '치과 원장 칼럼'],
    ['medigatenews.com', 71, '디지털 치과 도입'],
    ['bosa.co.kr', 69, '치과 개원가 동향'],
    ['dailydental.co.kr', 66, '치과 보도자료'],
    ['medical-tribune.co.kr', 63, '치과 학술 발표'],
    ['newmed.co.kr', 58, '원장 인터뷰'],
    ['medipana.com', 54, '치과 이슈 보도'],
    ['kormedi.com', 72, '건강 섹션 기고'],
    ['healthinnews.co.kr', 49, '치과 칼럼'],
  ]

  const gaps: CompetitorLinkGap[] = []
  sources.forEach((s, i) => {
    const comp = competitors[i % competitors.length]
    gaps.push({
      competitor_domain: comp.domain,
      competitor_rank: comp.rank,
      source_url: `https://${s[0]}/article/${10000 + i * 137}`,
      source_domain: s[0],
      source_rank: s[1],
      anchor: s[2],
    })
  })
  return gaps.sort((a, b) => b.source_rank - a.source_rank)
}

/**
 * 백링크 전체 분석 (링크 + Summary) - KV 캐시
 */
export async function analyzeBacklinks(
  env: Bindings,
  target: string
): Promise<{ summary: BacklinkSummary; links: BacklinkRow[]; gap: CompetitorLinkGap[]; isDemo: boolean }> {
  const cacheKey = `backlinks:${target}`
  const cached = await env.CACHE.get(cacheKey, { type: 'json' }) as {
    summary: BacklinkSummary; links: BacklinkRow[]; gap: CompetitorLinkGap[]; isDemo: boolean
  } | null
  if (cached) return cached

  let links: BacklinkRow[]
  let isDemo = false
  const login = env.DATAFORSEO_LOGIN
  const password = env.DATAFORSEO_PASSWORD

  if (login && password) {
    try {
      const res = await fetchBacklinks({ login, password }, target, 100)
      links = normalizeBacklinks(res.items)
    } catch (e) {
      console.error('backlinks fetch failed, fallback to demo:', e)
      links = demoBacklinks(target)
      isDemo = true
    }
  } else {
    links = demoBacklinks(target)
    isDemo = true
  }

  const summary = summarizeBacklinks(target, links)
  const gap = demoCompetitorGap(target) // M4에서 실제 DataForSEO Competitors API로 대체

  const result = { summary, links, gap, isDemo }
  await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 60 * 60 * 24 })
  return result
}
