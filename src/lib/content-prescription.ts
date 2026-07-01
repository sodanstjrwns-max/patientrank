// ===================================================================
// 콘텐츠 처방전 엔진 (Content Prescription Engine)
// "그래서 이번 달에 무슨 콘텐츠를 만들어야 하나?"에 답하는 핵심 모듈
//
// 데이터 소스 (모두 기존 스캔 파이프라인에서 이미 수집됨):
//  1. keywords          — 현재 랭킹 키워드 (DataForSEO ranked_keywords)
//  2. longtail_keywords — 사이트맵/매트릭스 롱테일 발견 결과
//  3. keyword_gaps      — 경쟁사는 잡는데 우리는 못 잡는 키워드
//  4. gsc_keyword_snapshots — GSC 노출/클릭 (연동 유저만)
//
// 처방 유형 (opportunity type):
//  - quick_win   : 11~30위 → 콘텐츠 보강 1편이면 TOP10 진입 가능
//  - ctr_fix     : GSC 노출 많은데 클릭율 낮음 → 제목/메타만 고치면 회수
//  - gap_attack  : 경쟁사 상위 + 우리 부재 → 갭 공략 콘텐츠
//  - new_content : 랭킹 없는 지역 롱테일 → 신규 페이지/블로그
//  - defend      : 4~10위 흔들리는 키워드 → 보강해서 TOP3 방어/승격
// ===================================================================

import type { Bindings, ScanSummary, KeywordRow, LongTailKeyword, KeywordGap } from './types'

export type PrescriptionType = 'quick_win' | 'ctr_fix' | 'gap_attack' | 'new_content' | 'defend'

export interface Prescription {
  type: PrescriptionType
  keyword: string
  score: number                 // 우선순위 점수 (높을수록 먼저)
  search_volume: number | null
  current_rank: number | null
  competitor_domain?: string
  competitor_rank?: number
  impressions?: number          // GSC 전용
  ctr?: number                  // GSC 전용
  // 원장님 언어로 번역된 처방
  headline: string              // 한 줄 요약 (예: "블로그 1편이면 TOP10 가능")
  action: string                // 구체적 행동 지시
  expected: string              // 기대 효과
  content_idea: string          // 추천 콘텐츠 주제
}

export interface PrescriptionReport {
  generated_at: string
  domain: string
  total_opportunities: number
  prescriptions: Prescription[]     // 스코어 내림차순 TOP N
  summary: {
    quick_win: number
    ctr_fix: number
    gap_attack: number
    new_content: number
    defend: number
  }
}

// ─────────────────────────────────────────────────────────────────
// 스코어링 상수
// ─────────────────────────────────────────────────────────────────
const W = {
  // 기본: 검색량이 클수록 기회가 큼 (로그 스케일)
  volume: 10,
  // 11~20위는 21~30위보다 진입 확률 높음
  rankProximity: 30,
  // GSC 노출 실증 데이터는 추정치보다 신뢰도 높음 → 가산
  gscEvidence: 25,
  // 경쟁사가 실제 랭킹 중 = 수요 검증됨
  competitorProof: 15,
} as const

function volumeScore(v: number | null): number {
  if (!v || v <= 0) return 0
  return Math.min(Math.log10(v + 1) * W.volume, 40) // 최대 40점
}

function clean(kw: string): string {
  return kw.trim().toLowerCase()
}

// 진료과 추정 키워드 → 콘텐츠 주제 어미
function contentTopicFor(keyword: string): string {
  const kw = keyword
  if (/비용|가격|얼마/.test(kw)) return `"${kw} — 2026년 기준 총정리 (건강보험 적용 여부 포함)"`
  if (/후기|경험/.test(kw)) return `"${kw} — 실제 치료 과정과 회복 타임라인"`
  if (/통증|아픔|아파/.test(kw)) return `"${kw} — 원인 3가지와 응급 대처법"`
  if (/추천|잘하는|유명/.test(kw)) return `"${kw} — 병원 선택 시 반드시 확인할 5가지"`
  if (/기간|시간|오래/.test(kw)) return `"${kw} — 단계별 소요 기간과 단축 방법"`
  if (/부작용|위험/.test(kw)) return `"${kw} — 정확한 확률과 예방법 (전문의 설명)"`
  return `"${kw} — 환자가 가장 많이 묻는 질문 TOP 7"`
}

// ─────────────────────────────────────────────────────────────────
// 1) Quick Win — 11~30위 키워드 (2~3페이지 → 1페이지 승격 후보)
// ─────────────────────────────────────────────────────────────────
function quickWins(keywords: KeywordRow[]): Prescription[] {
  return keywords
    .filter((k) => k.rank >= 11 && k.rank <= 30)
    .map((k) => {
      const proximity = k.rank <= 20 ? W.rankProximity : W.rankProximity * 0.6
      return {
        type: 'quick_win' as const,
        keyword: k.keyword,
        score: Math.round(volumeScore(k.search_volume) + proximity),
        search_volume: k.search_volume,
        current_rank: k.rank,
        headline: `현재 ${k.rank}위 — 콘텐츠 보강 1편이면 1페이지 진입권`,
        action: `기존 랭킹 페이지에 FAQ 섹션 추가 + 내부링크 2~3개 연결, 또는 심화 블로그 1편 발행 후 상호 링크`,
        expected: k.search_volume
          ? `TOP10 진입 시 월 ${Math.round(k.search_volume * 0.15).toLocaleString()}회 내외 유입 기대`
          : `1페이지 진입 시 노출 5~10배 증가`,
        content_idea: contentTopicFor(k.keyword),
      }
    })
}

// ─────────────────────────────────────────────────────────────────
// 2) Defend/Promote — 4~10위 (TOP3 승격 또는 방어)
// ─────────────────────────────────────────────────────────────────
function defends(keywords: KeywordRow[]): Prescription[] {
  return keywords
    .filter((k) => k.rank >= 4 && k.rank <= 10 && (k.search_volume || 0) >= 50)
    .map((k) => ({
      type: 'defend' as const,
      keyword: k.keyword,
      score: Math.round(volumeScore(k.search_volume) + 20),
      search_volume: k.search_volume,
      current_rank: k.rank,
      headline: `현재 ${k.rank}위 — TOP3 승격 사정권`,
      action: `페이지 로딩속도 점검 + 최신 사진/치료 사례 1건 추가 + 제목에 지역명·연도 반영`,
      expected: `TOP3 진입 시 클릭율 2~3배 (1위 CTR ≈ 28%, ${k.rank}위 ≈ ${k.rank <= 5 ? '6~9' : '2~4'}%)`,
      content_idea: contentTopicFor(k.keyword),
    }))
}

// ─────────────────────────────────────────────────────────────────
// 3) Gap Attack — 경쟁사는 랭킹, 우리는 부재
// ─────────────────────────────────────────────────────────────────
function gapAttacks(gaps: KeywordGap[]): Prescription[] {
  return gaps
    .filter((g) => (g.our_rank == null || g.our_rank > 30) && g.competitor_rank <= 10)
    .map((g) => ({
      type: 'gap_attack' as const,
      keyword: g.keyword,
      score: Math.round(volumeScore(g.search_volume) + W.competitorProof + (g.competitor_rank <= 3 ? 5 : 0)),
      search_volume: g.search_volume,
      current_rank: g.our_rank ?? null,
      competitor_domain: g.competitor_domain,
      competitor_rank: g.competitor_rank,
      headline: `경쟁사(${g.competitor_domain})는 ${g.competitor_rank}위, 우리는 없음`,
      action: `경쟁사 랭킹 페이지보다 정보량 1.5배 + 실제 사례 사진 포함한 전용 페이지 제작`,
      expected: `수요 검증된 키워드 — 경쟁사가 이미 환자를 받고 있는 자리`,
      content_idea: contentTopicFor(g.keyword),
    }))
}

// ─────────────────────────────────────────────────────────────────
// 4) New Content — 랭킹 없는 지역 롱테일 (매트릭스 발견)
// ─────────────────────────────────────────────────────────────────
function newContents(longtails: LongTailKeyword[]): Prescription[] {
  return longtails
    .filter((k) => k.rank == null || k.rank > 50)
    .filter((k) => (k.search_volume || 0) > 0 || k.source === 'matrix')
    .slice(0, 30) // 후보 과다 방지
    .map((k) => ({
      type: 'new_content' as const,
      keyword: k.keyword,
      score: Math.round(volumeScore(k.search_volume) + (k.source === 'matrix' ? 8 : 4)),
      search_volume: k.search_volume,
      current_rank: k.rank,
      headline: k.rank
        ? `현재 ${k.rank}위 (사실상 미노출) — 전용 콘텐츠 없음`
        : `지역 수요 있는데 콘텐츠 자체가 없음`,
      action: `이 키워드를 제목에 그대로 넣은 블로그/랜딩 1편 신규 발행 (지역 롱테일은 경쟁 약해 1편으로 TOP10 가능)`,
      expected: `지역 롱테일 특성상 발행 2~4주 내 1페이지 진입 사례 다수 (검증: 홍성 라미네이트 #1)`,
      content_idea: contentTopicFor(k.keyword),
    }))
}

// ─────────────────────────────────────────────────────────────────
// 5) CTR Fix — GSC 노출 많은데 클릭 못 받는 키워드
// ─────────────────────────────────────────────────────────────────
interface GscRow {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  avg_position: number
}

function ctrFixes(gscRows: GscRow[]): Prescription[] {
  return gscRows
    .filter((r) => r.impressions >= 100)
    .filter((r) => {
      // 포지션 대비 기대 CTR에 크게 못 미치는 경우
      const expectedCtr = r.avg_position <= 3 ? 0.15 : r.avg_position <= 10 ? 0.03 : 0.01
      return r.ctr < expectedCtr
    })
    .map((r) => ({
      type: 'ctr_fix' as const,
      keyword: r.keyword,
      score: Math.round(Math.min(Math.log10(r.impressions + 1) * 12, 45) + W.gscEvidence - Math.min(r.avg_position, 20)),
      search_volume: null,
      current_rank: Math.round(r.avg_position),
      impressions: r.impressions,
      ctr: r.ctr,
      headline: `노출 ${r.impressions.toLocaleString()}회인데 클릭율 ${(r.ctr * 100).toFixed(1)}% — 제목만 고치면 회수`,
      action: `페이지 <title>과 메타설명 재작성: 숫자·지역명·혜택 포함 (예: "OO역 5분 | 당일 상담")`,
      expected: `CTR 1%p 개선 시 월 +${Math.round(r.impressions * 0.01).toLocaleString()} 클릭 — 콘텐츠 신규 제작 없이 회수`,
      content_idea: `기존 페이지 제목/메타 A/B 개선 (신규 제작 불필요)`,
    }))
}

// ─────────────────────────────────────────────────────────────────
// 메인: 처방전 생성
// ─────────────────────────────────────────────────────────────────
export async function generatePrescriptions(
  env: Bindings,
  scan: ScanSummary,
  opts?: { limit?: number; userId?: number },
): Promise<PrescriptionReport> {
  const limit = opts?.limit ?? 10

  // GSC 스냅샷 로드 (있으면)
  let gscRows: GscRow[] = []
  try {
    const res = await env.DB.prepare(
      `SELECT keyword, clicks, impressions, ctr, avg_position
       FROM gsc_keyword_snapshots
       WHERE scan_id = ?
       ORDER BY impressions DESC LIMIT 300`,
    ).bind(scan.scanId).all<any>()
    gscRows = (res.results || []).map((r: any) => ({
      keyword: String(r.keyword),
      clicks: Number(r.clicks || 0),
      impressions: Number(r.impressions || 0),
      ctr: Number(r.ctr || 0),
      avg_position: Number(r.avg_position || 0),
    }))
  } catch { /* GSC 미연동 or 테이블 없음 — 무시 */ }

  const all: Prescription[] = [
    ...quickWins(scan.keywords || []),
    ...defends(scan.keywords || []),
    ...gapAttacks(scan.keyword_gaps || []),
    ...newContents(scan.longtail_keywords || []),
    ...ctrFixes(gscRows),
  ]

  // 키워드 중복 제거 (스코어 높은 처방 우선)
  const seen = new Set<string>()
  const deduped = all
    .sort((a, b) => b.score - a.score)
    .filter((p) => {
      const key = clean(p.keyword)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  const top = deduped.slice(0, limit)
  const summary = { quick_win: 0, ctr_fix: 0, gap_attack: 0, new_content: 0, defend: 0 }
  for (const p of deduped) summary[p.type]++

  return {
    generated_at: new Date().toISOString(),
    domain: scan.domain,
    total_opportunities: deduped.length,
    prescriptions: top,
    summary,
  }
}
