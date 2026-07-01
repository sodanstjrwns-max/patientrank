// Day 1-G: AI 액션 가이드 — 페이션트 퍼널 컨셉 기반 의료 SEO 컨설팅
// 입력: ScanSummary → 출력: AiActionGuide (이번 주 할 일 3가지 + 4주 로드맵)

import type { Bindings, ScanSummary, AiActionGuide, AiAction } from './types'
import { chatCompletion } from './openai-client'
import { getWeekOfMonday } from './snapshot-service'

const SYSTEM_PROMPT = `당신은 한국 의료기관(치과/한의원/성형외과 등) 전문 SEO 컨설턴트입니다.
서울비디치과 대표원장 문석준이 만든 페이션트 퍼널(Patient Funnel) 방법론을 기반으로 합니다.

페이션트 퍼널 10단계 (환자 여정):
1. 인지 (Awareness) - 광고/콘텐츠/검색으로 병원 존재 인지
2. 관심 (Interest) - 진료 정보 검색, 블로그/유튜브 시청
3. 검색 (Search) - 구글/네이버 능동 검색 시작
4. 비교 (Comparison) - 후기/리뷰/타 병원과 비교
5. 상담 (Consultation) - 전화/온라인 상담 신청
6. 예약 (Booking) - 방문 예약 확정
7. 방문 (Visit) - 첫 방문 및 진료
8. 결정 (Decision) - 치료 계획 동의
9. 치료 (Treatment) - 치료 진행 중
10. 추천 (Advocacy) - 지인에게 소개, 후기 작성

SEO 데이터 → 페이션트 퍼널 단계 매핑:
- 메인 키워드 순위 → 3단계 검색
- 백링크/DR → 1단계 인지 (권위 신호)
- 롱테일/지역 키워드 → 3단계 검색 + 4단계 비교
- GSC 노출 → 1~3단계 전반
- 콘텐츠 깊이 → 2단계 관심

원칙:
- 데이터 기반: 추측 X, 실측 수치 기반 액션만 제안
- 실행 가능성: 원장이 다음 주 월요일 아침에 바로 시작할 수 있는 구체적 행동
- 비용/시간 명시: 예상 소요 시간과 비용을 반드시 포함
- 의료광고법 준수: 과장 광고, 환자 후기 동의 없는 노출, 비교 광고 금지
- 페이션트 퍼널 연결: 각 액션이 환자 여정 어느 단계를 강화하는지 명시

출력은 반드시 JSON 형식이며, 한국어로 작성합니다.`

interface ScanContext {
  domain: string
  specialty?: string
  keyword_count: number
  top3_count: number
  top10_count: number
  top30_count: number
  top100_count: number
  estimated_traffic: number
  domain_rating: number
  backlinks_total: number
  referring_domains: number
  dofollow_ratio: number
  longtail_count: number
  top_keywords: Array<{ keyword: string; rank: number; volume: number }>
  weak_keywords: Array<{ keyword: string; rank: number; volume: number }>
  top_competitor_anchors: Array<{ anchor: string; competitor: string; dr: number }>
  top_longtails: Array<{ keyword: string; rank: number | null }>
  previous_score?: number
}

function buildContext(scan: ScanSummary): ScanContext {
  const keywords = scan.keywords || []
  // 상위 5개 (순위 좋은)
  const top_keywords = [...keywords]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)
    .map((k) => ({ keyword: k.keyword, rank: k.rank, volume: k.search_volume }))
  // 약점 5개 (검색량 큰데 순위 낮은)
  const weak_keywords = [...keywords]
    .filter((k) => k.rank > 30 && k.search_volume >= 500)
    .sort((a, b) => b.search_volume - a.search_volume)
    .slice(0, 5)
    .map((k) => ({ keyword: k.keyword, rank: k.rank, volume: k.search_volume }))
  // 경쟁사 강한 anchor 5개
  const top_competitor_anchors = (scan.competitor_gap || [])
    .slice(0, 5)
    .map((g) => ({
      anchor: g.anchor || '(no anchor)',
      competitor: g.competitor_domain,
      dr: g.source_rank,
    }))
  // 상위 롱테일 5개
  const top_longtails = (scan.longtail_keywords || [])
    .filter((k) => k.rank !== null && k.rank <= 10)
    .slice(0, 5)
    .map((k) => ({ keyword: k.keyword, rank: k.rank }))

  const bs = scan.backlink_summary
  return {
    domain: scan.domain,
    keyword_count: scan.keyword_count || 0,
    top3_count: scan.top3_count || 0,
    top10_count: scan.top10_count || 0,
    top30_count: scan.top30_count || 0,
    top100_count: scan.top100_count || 0,
    estimated_traffic: scan.estimated_traffic || 0,
    domain_rating: bs?.domain_rank || 0,
    backlinks_total: bs?.backlinks_total || 0,
    referring_domains: bs?.referring_domains || 0,
    dofollow_ratio: bs?.dofollow_ratio || 0,
    longtail_count: (scan.longtail_keywords || []).length,
    top_keywords,
    weak_keywords,
    top_competitor_anchors,
    top_longtails,
  }
}

function buildUserPrompt(ctx: ScanContext): string {
  return `다음 의료기관 도메인의 SEO 데이터를 분석하고 이번 주 액션 가이드를 제공해주세요.

## 도메인 정보
- 도메인: ${ctx.domain}
- 진료과: ${ctx.specialty || '미상'}

## 현재 SEO 지표
- TOP 100 키워드 수: ${ctx.keyword_count}개 (TOP 3: ${ctx.top3_count}, TOP 10: ${ctx.top10_count}, TOP 30: ${ctx.top30_count})
- 추정 월 트래픽: ${ctx.estimated_traffic}
- Domain Rating (DR): ${ctx.domain_rating} / 100
- 백링크 총합: ${ctx.backlinks_total}개 (${ctx.referring_domains}개 도메인에서)
- Dofollow 비율: ${(ctx.dofollow_ratio * 100).toFixed(1)}%
- 발견된 롱테일: ${ctx.longtail_count}개

## 강한 키워드 (TOP 5)
${ctx.top_keywords.map((k, i) => `${i + 1}. ${k.keyword} - ${k.rank}위 (월 검색량 ${k.volume.toLocaleString()})`).join('\n') || '없음'}

## 약점 키워드 (검색량 크지만 30위 밖)
${ctx.weak_keywords.map((k, i) => `${i + 1}. ${k.keyword} - ${k.rank}위 (월 검색량 ${k.volume.toLocaleString()})`).join('\n') || '없음'}

## 경쟁사 강한 백링크 anchor (우리 도메인에 없음)
${ctx.top_competitor_anchors.map((a, i) => `${i + 1}. "${a.anchor}" (출처 DR ${a.dr}, 경쟁사: ${a.competitor})`).join('\n') || '데이터 부족'}

## 발견된 롱테일 (지역+진료, TOP 10 안에 든 것)
${ctx.top_longtails.map((k, i) => `${i + 1}. ${k.keyword} - ${k.rank}위`).join('\n') || '없음'}

## 요청
다음 JSON 형식으로 응답하세요. 모든 텍스트는 한국어로 작성:

\`\`\`json
{
  "weekly_score": <0-100 점수>,
  "score_change": <지난 주 대비 변화량 (없으면 0)>,
  "top_strength": "<가장 강한 부분 한 문장>",
  "top_weakness": "<가장 약한 부분 한 문장>",
  "this_week_actions": [
    {
      "priority": 1,
      "title": "<액션 제목 (15자 이내)>",
      "why": "<왜 이걸 해야 하는지 데이터 근거 (50자 이내)>",
      "how": "<구체적 실행 방법 (100자 이내)>",
      "expected_impact": "<예상 결과 (예: DR 0→8, 4주 이내)>",
      "estimated_time": "<예상 소요 시간 (예: 2시간)>",
      "estimated_cost": "<예상 비용 (예: 30만원 / 무료)>",
      "patient_funnel_stage": "<페이션트 퍼널 단계 (예: '1. 인지')>",
      "category": "<backlink|content|technical|local|gsc 중 하나>"
    },
    { "priority": 2, ... },
    { "priority": 3, ... }
  ],
  "next_4_weeks_roadmap": [
    { "week": 1, "theme": "<이번 주 핵심 테마>", "focus": "<핵심 작업 한 줄>" },
    { "week": 2, "theme": "...", "focus": "..." },
    { "week": 3, "theme": "...", "focus": "..." },
    { "week": 4, "theme": "...", "focus": "..." }
  ]
}
\`\`\`

응답은 위 JSON 객체만 (다른 텍스트 없이) 반환하세요. 액션은 정확히 3개입니다.`
}

// AI 액션 가이드 생성 (1회 약 1.4원)
export async function generateActionGuide(
  env: Bindings,
  scan: ScanSummary,
  opts: { previous_score?: number } = {},
): Promise<{ guide: AiActionGuide; cost_usd: number; tokens: { in: number; out: number } }> {
  const ctx = buildContext(scan)
  ctx.previous_score = opts.previous_score

  const result = await chatCompletion(
    env,
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(ctx) },
    ],
    {
      json: true,
      temperature: 0.6,
      max_tokens: 2000,
    },
  )

  let parsed: any
  try {
    parsed = JSON.parse(result.content)
  } catch {
    // JSON 파싱 실패 시 폴백 가이드
    parsed = fallbackGuide(ctx)
  }

  // 필수 필드 검증 + 보정
  const actions: AiAction[] = Array.isArray(parsed.this_week_actions)
    ? parsed.this_week_actions.slice(0, 3).map((a: any, i: number) => ({
        priority: (i + 1) as 1 | 2 | 3,
        title: String(a.title || `액션 ${i + 1}`).slice(0, 30),
        why: String(a.why || ''),
        how: String(a.how || ''),
        expected_impact: String(a.expected_impact || ''),
        estimated_time: String(a.estimated_time || '1~2시간'),
        estimated_cost: String(a.estimated_cost || '무료'),
        patient_funnel_stage: String(a.patient_funnel_stage || '1. 인지') as any,
        category: (a.category || 'content') as any,
      }))
    : fallbackGuide(ctx).this_week_actions

  // 빈 경우 폴백
  while (actions.length < 3) {
    const fb = fallbackGuide(ctx).this_week_actions[actions.length]
    actions.push(fb)
  }

  const guide: AiActionGuide = {
    weekly_score: Math.max(0, Math.min(100, Number(parsed.weekly_score) || computeFallbackScore(ctx))),
    score_change: Number(parsed.score_change) || 0,
    top_strength: String(parsed.top_strength || ctx.top_keywords[0]?.keyword || '데이터 부족'),
    top_weakness: String(parsed.top_weakness || (ctx.domain_rating === 0 ? 'DR 0 — 외부 신뢰 신호 부재' : '약점 분석 필요')),
    this_week_actions: actions,
    next_4_weeks_roadmap: Array.isArray(parsed.next_4_weeks_roadmap)
      ? parsed.next_4_weeks_roadmap.slice(0, 4).map((r: any, i: number) => ({
          week: i + 1,
          theme: String(r.theme || `Week ${i + 1}`),
          focus: String(r.focus || ''),
        }))
      : [
          { week: 1, theme: '백링크 시작', focus: '권위 신호 1건 확보' },
          { week: 2, theme: '콘텐츠 보강', focus: '약점 키워드 1개 글 작성' },
          { week: 3, theme: '지역 강화', focus: '지역+진료 롱테일 5건' },
          { week: 4, theme: '측정', focus: 'GSC 데이터로 효과 검증' },
        ],
    generated_at: new Date().toISOString(),
    model_used: result.model,
  }

  return {
    guide,
    cost_usd: result.cost_usd,
    tokens: { in: result.prompt_tokens, out: result.completion_tokens },
  }
}

// 점수 폴백 계산 (LLM 응답 누락 시)
function computeFallbackScore(ctx: ScanContext): number {
  let score = 0
  score += Math.min(20, ctx.top3_count * 2)
  score += Math.min(15, ctx.top10_count)
  score += Math.min(15, ctx.top30_count / 2)
  score += Math.min(20, ctx.domain_rating)
  score += Math.min(15, ctx.referring_domains / 2)
  score += Math.min(15, ctx.longtail_count / 3)
  return Math.round(Math.max(0, Math.min(100, score)))
}

// LLM 완전 실패 시 데이터 기반 폴백 가이드
function fallbackGuide(ctx: ScanContext): AiActionGuide {
  const actions: AiAction[] = []

  // 액션 1: DR이 낮으면 백링크
  if (ctx.domain_rating < 10) {
    actions.push({
      priority: 1,
      title: '의료 매체 1곳에 보도자료 게재',
      why: `현재 DR ${ctx.domain_rating}으로 외부 신뢰 신호가 부족합니다. 경쟁사는 평균 DR 50+ 매체에서 백링크를 받고 있습니다.`,
      how: '한국경제 의료섹션, 매일경제 헬스, 메디게이트 중 1곳에 진료 인사이트 보도자료 1건 발행',
      expected_impact: `DR ${ctx.domain_rating} → ${ctx.domain_rating + 8} (4주 이내)`,
      estimated_time: '2시간 (원고 검토)',
      estimated_cost: '약 30~50만원',
      patient_funnel_stage: '1. 인지',
      category: 'backlink',
    })
  }

  // 액션 2: 약점 키워드 콘텐츠
  if (ctx.weak_keywords[0]) {
    const w = ctx.weak_keywords[0]
    actions.push({
      priority: (actions.length + 1) as 1 | 2 | 3,
      title: `"${w.keyword}" 전문 글 작성`,
      why: `월 ${w.volume.toLocaleString()}회 검색되는데 현재 ${w.rank}위로 트래픽 손실. 상위 진입 시 월 ${Math.round(w.volume * 0.05)} 방문 증가 예상.`,
      how: '경쟁사 TOP 5 글을 분석 후, 1,500자 이상 + 이미지 3장 + FAQ 5개 포함 글 작성',
      expected_impact: `${w.rank}위 → 10위권 (8주 이내)`,
      estimated_time: '3시간 (글쓰기)',
      estimated_cost: '무료 (내부 작성) / 외주 시 약 15만원',
      patient_funnel_stage: '2. 관심',
      category: 'content',
    })
  }

  // 액션 3: GSC 연동 (Pro+) 또는 지역 키워드
  actions.push({
    priority: (actions.length + 1) as 1 | 2 | 3,
    title: 'GSC 연동으로 누락 키워드 발굴',
    why: `DataForSEO는 ${ctx.keyword_count}개만 잡았지만 실제 GSC에는 수천 개 노출 키워드가 있을 가능성이 높습니다.`,
    how: '결과 페이지 → GSC 카드 → "GSC 계정 연결" → sodanstjrwns@gmail.com으로 로그인',
    expected_impact: '실측 노출 키워드 최대 25,000개 확보',
    estimated_time: '30초',
    estimated_cost: '무료',
    patient_funnel_stage: '3. 검색',
    category: 'gsc',
  })

  while (actions.length < 3) {
    actions.push({
      priority: (actions.length + 1) as 1 | 2 | 3,
      title: '진료과별 지역 페이지 1개 신설',
      why: '지역+진료 롱테일은 경쟁이 낮고 전환율이 높습니다 (실제 방문 의향 환자).',
      how: '예: "강남 임플란트 잘하는 곳" 페이지 1개 신설 + Google My Business 연동',
      expected_impact: '4주 내 지역 롱테일 5~10개 TOP 10 진입',
      estimated_time: '2시간',
      estimated_cost: '무료',
      patient_funnel_stage: '3. 검색',
      category: 'local',
    })
  }

  return {
    weekly_score: computeFallbackScore(ctx),
    score_change: 0,
    top_strength: ctx.top_keywords[0]
      ? `"${ctx.top_keywords[0].keyword}" ${ctx.top_keywords[0].rank}위 보유`
      : '데이터 축적 초기',
    top_weakness: ctx.domain_rating === 0
      ? 'DR 0 — 외부 신뢰 신호 부재 (최우선)'
      : '백링크 부족',
    this_week_actions: actions.slice(0, 3),
    next_4_weeks_roadmap: [
      { week: 1, theme: '권위 신호 구축', focus: '의료 매체 백링크 1건' },
      { week: 2, theme: '콘텐츠 보강', focus: '약점 키워드 1개 전문 글 작성' },
      { week: 3, theme: '지역 SEO', focus: '지역+진료 페이지 3개 신설' },
      { week: 4, theme: '효과 측정', focus: 'GSC로 노출 변화 확인 후 다음 사이클' },
    ],
    generated_at: new Date().toISOString(),
    model_used: 'fallback',
  }
}

// AI 가이드를 DB에 저장
export async function saveActionGuide(
  env: Bindings,
  args: {
    user_id: number | null
    scan_id: number
    domain: string
    guide: AiActionGuide
    cost_usd: number
    tokens: { in: number; out: number }
  },
): Promise<void> {
  await env.DB.prepare(`
    INSERT INTO ai_action_guides (
      user_id, scan_id, domain, week_of,
      weekly_score, score_change, top_strength, top_weakness,
      actions_json, roadmap_json,
      model_used, prompt_tokens, completion_tokens, cost_usd
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    args.user_id,
    args.scan_id,
    args.domain,
    getWeekOfMonday(),
    args.guide.weekly_score,
    args.guide.score_change,
    args.guide.top_strength,
    args.guide.top_weakness,
    JSON.stringify(args.guide.this_week_actions),
    JSON.stringify(args.guide.next_4_weeks_roadmap),
    args.guide.model_used,
    args.tokens.in,
    args.tokens.out,
    args.cost_usd,
  ).run()
}

// 캐시된 AI 가이드 조회 (스캔 ID 기준 - 같은 스캔은 1주일 캐시)
export async function getCachedActionGuide(
  env: Bindings,
  scan_id: number,
): Promise<AiActionGuide | null> {
  const row = await env.DB.prepare(`
    SELECT * FROM ai_action_guides
    WHERE scan_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(scan_id).first<any>()

  if (!row) return null

  try {
    return {
      weekly_score: Number(row.weekly_score),
      score_change: Number(row.score_change || 0),
      top_strength: String(row.top_strength || ''),
      top_weakness: String(row.top_weakness || ''),
      this_week_actions: JSON.parse(row.actions_json || '[]'),
      next_4_weeks_roadmap: JSON.parse(row.roadmap_json || '[]'),
      generated_at: String(row.created_at),
      model_used: String(row.model_used || 'gpt-5.5'),
    }
  } catch {
    return null
  }
}
