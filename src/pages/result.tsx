// 진단 결과 페이지
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'
import type { ScanSummary } from '../lib/types'
import { formatNumber } from '../lib/utils'
import { topSpecialties } from '../lib/medical-keywords'

const FREE_VISIBLE_ROWS = 20
const FREE_BACKLINK_ROWS = 5
const FREE_GAP_ROWS = 3

export const ResultPage: FC<{ scan: ScanSummary }> = ({ scan }) => {
  const visibleKeywords = scan.keywords.slice(0, FREE_VISIBLE_ROWS)
  const hiddenKeywords = scan.keywords.slice(FREE_VISIBLE_ROWS)
  const hiddenCount = hiddenKeywords.length
  const specs = topSpecialties(scan.keywords)

  const bls = scan.backlink_summary
  const bl = scan.backlinks || []
  const gap = scan.competitor_gap || []
  const visibleBacklinks = bl.slice(0, FREE_BACKLINK_ROWS)
  const hiddenBacklinks = bl.slice(FREE_BACKLINK_ROWS)
  const visibleGap = gap.slice(0, FREE_GAP_ROWS)
  const hiddenGap = gap.slice(FREE_GAP_ROWS)

  // 도넛 비율 계산
  const total = scan.keyword_count || 1
  const pct = (n: number) => Math.round((n / total) * 100)

  return (
    <Layout
      title={`${scan.domain} 구글 SEO 진단 · Patient Rank`}
      description={`${scan.domain}의 구글 한국 랭크 키워드 ${scan.keyword_count}개, TOP 3 ${scan.top3_count}개, TOP 10 ${scan.top10_count}개`}
    >
      <NavBar />
      <main class="max-w-6xl mx-auto px-5 py-8 md:py-10">
        {/* 헤더 */}
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div class="text-sm text-slate-500 mb-1">진단 결과</div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900 break-all">
              <i class="fas fa-globe text-brand mr-2"></i>
              {scan.domain}
            </h1>
            <div class="text-xs text-slate-500 mt-1">
              {new Date(scan.created_at).toLocaleString('ko-KR')} · 구글 한국
            </div>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              onclick="navigator.clipboard.writeText(location.href); this.innerHTML='<i class=&quot;fas fa-check mr-2&quot;></i>복사됨'"
              class="px-4 py-2 rounded-lg border border-slate-200 hover:border-brand hover:text-brand text-sm font-medium"
            >
              <i class="fas fa-link mr-2"></i>결과 공유
            </button>
            <a href="/#diagnose" class="px-4 py-2 rounded-lg bg-brand hover:bg-brand-600 text-white text-sm font-semibold">
              <i class="fas fa-rotate mr-2"></i>다른 URL 진단
            </a>
          </div>
        </div>

        {/* 스코어카드 */}
        <div class="grid md:grid-cols-3 gap-5 mb-8">
          <div class="md:col-span-1 p-7 rounded-2xl bg-gradient-to-br from-brand to-brand-700 text-white shadow-lg">
            <div class="text-sm text-brand-100 mb-2">총 랭크 키워드</div>
            <div class="text-5xl md:text-6xl font-extrabold tracking-tight">{formatNumber(scan.keyword_count)}</div>
            <div class="mt-3 text-sm text-brand-100">
              <i class="fas fa-globe mr-1"></i>구글 한국 TOP 100 기준
            </div>
          </div>

          <div class="md:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white">
            <div class="flex items-center justify-between mb-4">
              <div class="font-semibold text-slate-900">랭킹 분포</div>
              <div class="text-xs text-slate-500">월 추정 유입 <b class="text-slate-900">{formatNumber(scan.estimated_traffic)}</b></div>
            </div>
            <div class="grid grid-cols-4 gap-3">
              <div class="p-4 rounded-xl bg-emerald-50 text-center">
                <div class="text-xs text-accent-600 font-semibold">TOP 3</div>
                <div class="text-2xl font-extrabold text-accent-600 mt-1">{scan.top3_count}</div>
                <div class="text-xs text-slate-500 mt-1">{pct(scan.top3_count)}%</div>
              </div>
              <div class="p-4 rounded-xl bg-brand-50 text-center">
                <div class="text-xs text-brand font-semibold">TOP 10</div>
                <div class="text-2xl font-extrabold text-brand mt-1">{scan.top10_count}</div>
                <div class="text-xs text-slate-500 mt-1">{pct(scan.top10_count)}%</div>
              </div>
              <div class="p-4 rounded-xl bg-amber-50 text-center">
                <div class="text-xs text-amber-600 font-semibold">TOP 30</div>
                <div class="text-2xl font-extrabold text-amber-600 mt-1">{scan.top30_count}</div>
                <div class="text-xs text-slate-500 mt-1">{pct(scan.top30_count)}%</div>
              </div>
              <div class="p-4 rounded-xl bg-slate-100 text-center">
                <div class="text-xs text-slate-600 font-semibold">TOP 100</div>
                <div class="text-2xl font-extrabold text-slate-700 mt-1">{scan.top100_count}</div>
                <div class="text-xs text-slate-500 mt-1">{pct(scan.top100_count)}%</div>
              </div>
            </div>

            {/* 도넛 차트 */}
            <div class="mt-5 flex items-center gap-5">
              <canvas id="rank-donut" width="120" height="120" class="w-[120px] h-[120px]"></canvas>
              <div class="flex-1 space-y-1.5 text-xs">
                <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-accent"></span><span class="text-slate-600">TOP 1-3 (상단 노출)</span></div>
                <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-brand"></span><span class="text-slate-600">TOP 4-10 (1페이지)</span></div>
                <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-amber-500"></span><span class="text-slate-600">TOP 11-30 (2-3페이지)</span></div>
                <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-slate-400"></span><span class="text-slate-600">TOP 31-100 (잠재)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 진료과 분석 */}
        {specs.length > 0 && (
          <div class="mb-8 p-6 rounded-2xl border border-slate-200 bg-white">
            <div class="font-semibold text-slate-900 mb-4">
              <i class="fas fa-stethoscope text-brand mr-2"></i>
              주요 진료과 키워드 분포
            </div>
            <div class="grid md:grid-cols-3 gap-3">
              {specs.map((s) => (
                <div class="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div class="text-sm font-semibold text-slate-900">{s.specialty}</div>
                  <div class="mt-1 text-xs text-slate-500">{s.count}개 키워드 · 월 검색량 {formatNumber(s.volume)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 키워드 테이블 */}
        <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div class="p-5 flex items-center justify-between border-b border-slate-200">
            <div>
              <div class="font-semibold text-slate-900">랭크 키워드 전체 리스트</div>
              <div class="text-xs text-slate-500 mt-0.5">검색량 내림차순 정렬</div>
            </div>
            <input
              id="kw-search"
              type="search"
              placeholder="키워드 검색"
              class="hidden md:block px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-50 outline-none"
            />
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th class="text-left px-5 py-3 w-14">#</th>
                  <th class="text-left px-5 py-3">키워드</th>
                  <th class="text-center px-5 py-3 w-24">구글 순위</th>
                  <th class="text-right px-5 py-3 w-28">월 검색량</th>
                  <th class="text-left px-5 py-3 hidden md:table-cell">랭크 URL</th>
                </tr>
              </thead>
              <tbody id="kw-tbody" class="divide-y divide-slate-100">
                {visibleKeywords.map((k, i) => {
                  const badge =
                    k.rank <= 3 ? 'bg-accent text-white'
                    : k.rank <= 10 ? 'bg-brand text-white'
                    : k.rank <= 30 ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                  return (
                    <tr class="hover:bg-slate-50 kw-row">
                      <td class="px-5 py-3 text-slate-400 tabular-nums">{i + 1}</td>
                      <td class="px-5 py-3 font-medium text-slate-900">{k.keyword}</td>
                      <td class="px-5 py-3 text-center">
                        <span class={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md text-xs font-bold ${badge}`}>{k.rank}위</span>
                      </td>
                      <td class="px-5 py-3 text-right tabular-nums text-slate-700">{formatNumber(k.search_volume)}</td>
                      <td class="px-5 py-3 hidden md:table-cell">
                        <a href={k.ranked_url} target="_blank" rel="noopener" class="text-brand hover:underline text-xs break-all">
                          {k.ranked_url.length > 60 ? k.ranked_url.slice(0, 60) + '...' : k.ranked_url}
                        </a>
                      </td>
                    </tr>
                  )
                })}
                {/* 블러 처리된 잠금 행 (비회원이고 추가 키워드가 있을 때만) */}
                {scan.is_gated && hiddenCount > 0 && hiddenKeywords.slice(0, 5).map((k, i) => (
                  <tr class="relative select-none blur-row">
                    <td class="px-5 py-3 text-slate-400 tabular-nums">{FREE_VISIBLE_ROWS + i + 1}</td>
                    <td class="px-5 py-3 font-medium text-slate-400 blur-sm">{k.keyword}</td>
                    <td class="px-5 py-3 text-center blur-sm">
                      <span class="inline-block min-w-[2.5rem] px-2 py-0.5 rounded-md text-xs font-bold bg-slate-200 text-slate-700">{k.rank}위</span>
                    </td>
                    <td class="px-5 py-3 text-right tabular-nums text-slate-400 blur-sm">{formatNumber(k.search_volume)}</td>
                    <td class="px-5 py-3 hidden md:table-cell text-slate-300 blur-sm">••••••</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== 백링크 분석 섹션 (Pro 티저) ========== */}
        {bls && (
          <section class="mt-10">
            <div class="flex items-center justify-between mb-5">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-xl md:text-2xl font-bold text-slate-900">
                    <i class="fas fa-link text-brand mr-2"></i>
                    백링크 · 도메인 권위 분석
                  </h2>
                  <span class="px-2 py-0.5 rounded-md bg-brand text-white text-xs font-bold">Pro</span>
                </div>
                <div class="text-sm text-slate-500 mt-1">
                  어떤 사이트가 <b class="text-slate-700">{scan.domain}</b>으로 권위를 흘려보내는지, 경쟁 치과는 어디서 링크 받는지
                </div>
              </div>
            </div>

            {/* 1) 도메인 권위 지표 카드 4개 */}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div class="p-5 rounded-2xl bg-gradient-to-br from-brand to-brand-700 text-white">
                <div class="text-xs text-brand-100">도메인 권위 (DR)</div>
                <div class="mt-2 flex items-end gap-1">
                  <span class="text-4xl font-extrabold tracking-tight">{bls.domain_rank}</span>
                  <span class="text-sm text-brand-100 pb-1">/ 100</span>
                </div>
                <div class="mt-3 h-1.5 rounded-full bg-brand-700/50 overflow-hidden">
                  <div class="h-full bg-white rounded-full" style={`width:${bls.domain_rank}%`}></div>
                </div>
                <div class="mt-2 text-xs text-brand-100">구글이 평가하는 신뢰도</div>
              </div>

              <div class="p-5 rounded-2xl bg-white border border-slate-200">
                <div class="text-xs text-slate-500">리퍼링 도메인</div>
                <div class="mt-2 text-3xl font-extrabold text-slate-900">{formatNumber(bls.referring_domains)}</div>
                <div class="mt-3 text-xs text-slate-500">
                  <i class="fas fa-globe mr-1 text-brand"></i>
                  링크 걸어주는 사이트 수
                </div>
              </div>

              <div class="p-5 rounded-2xl bg-white border border-slate-200">
                <div class="text-xs text-slate-500">살아있는 백링크</div>
                <div class="mt-2 flex items-end gap-2">
                  <span class="text-3xl font-extrabold text-accent-600">{formatNumber(bls.alive_count)}</span>
                  {bls.lost_count > 0 && (
                    <span class="pb-1 text-xs text-warn">
                      <i class="fas fa-arrow-down"></i> 유실 {bls.lost_count}
                    </span>
                  )}
                </div>
                <div class="mt-3 text-xs text-slate-500">
                  <i class="fas fa-heart-pulse mr-1 text-accent"></i>
                  현재 유효한 링크만 집계
                </div>
              </div>

              <div class="p-5 rounded-2xl bg-white border border-slate-200">
                <div class="text-xs text-slate-500">Dofollow 비율</div>
                <div class="mt-2 text-3xl font-extrabold text-slate-900">
                  {Math.round((bls.dofollow_ratio || 0) * 100)}<span class="text-base text-slate-500">%</span>
                </div>
                <div class="mt-3 text-xs text-slate-500">
                  <i class="fas fa-seedling mr-1 text-accent-600"></i>
                  권위가 실제로 흘러오는 비율
                </div>
              </div>
            </div>

            {/* 2) 살아있는 백링크 리스트 */}
            <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden mb-5">
              <div class="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div class="font-semibold text-slate-900">
                    <i class="fas fa-signal text-accent mr-2"></i>
                    살아있는 백링크 TOP {Math.min(bl.length, 20)}
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">도메인 권위 내림차순 · dofollow/nofollow · lost 표시</div>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th class="text-left px-5 py-3">출처 도메인</th>
                      <th class="text-left px-5 py-3 hidden md:table-cell">앵커 텍스트</th>
                      <th class="text-center px-5 py-3 w-24">도메인 랭크</th>
                      <th class="text-center px-5 py-3 w-24">유형</th>
                      <th class="text-center px-5 py-3 w-20">상태</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    {visibleBacklinks.map((b) => (
                      <tr class="hover:bg-slate-50">
                        <td class="px-5 py-3">
                          <a href={b.source_url} target="_blank" rel="noopener" class="text-brand hover:underline font-medium">
                            {b.source_domain}
                          </a>
                          <div class="text-xs text-slate-400 truncate max-w-[280px]">{b.source_url}</div>
                        </td>
                        <td class="px-5 py-3 hidden md:table-cell text-slate-700 truncate max-w-[200px]" title={b.anchor}>
                          {b.anchor || <span class="text-slate-400">(없음)</span>}
                        </td>
                        <td class="px-5 py-3 text-center">
                          <span class={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md text-xs font-bold ${
                            b.domain_rank >= 70 ? 'bg-accent text-white'
                            : b.domain_rank >= 50 ? 'bg-brand text-white'
                            : b.domain_rank >= 30 ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                          }`}>{b.domain_rank}</span>
                        </td>
                        <td class="px-5 py-3 text-center">
                          {b.is_dofollow ? (
                            <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-accent-600 text-xs font-semibold">dofollow</span>
                          ) : (
                            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs">nofollow</span>
                          )}
                        </td>
                        <td class="px-5 py-3 text-center">
                          {b.is_lost ? (
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warn/10 text-warn text-xs font-semibold">
                              <i class="fas fa-link-slash"></i> lost
                            </span>
                          ) : (
                            <span class="inline-flex items-center gap-1 text-accent-600 text-xs font-semibold">
                              <i class="fas fa-heart-pulse"></i> alive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Pro 잠금 블러 행 */}
                    {hiddenBacklinks.slice(0, 5).map((b) => (
                      <tr class="relative select-none">
                        <td class="px-5 py-3 blur-sm">
                          <div class="font-medium text-slate-400">{b.source_domain}</div>
                          <div class="text-xs text-slate-300">{b.source_url}</div>
                        </td>
                        <td class="px-5 py-3 hidden md:table-cell text-slate-400 blur-sm">{b.anchor}</td>
                        <td class="px-5 py-3 text-center blur-sm">
                          <span class="inline-block min-w-[2.5rem] px-2 py-0.5 rounded-md bg-slate-200 text-xs font-bold text-slate-600">{b.domain_rank}</span>
                        </td>
                        <td class="px-5 py-3 text-center blur-sm text-slate-400 text-xs">••••</td>
                        <td class="px-5 py-3 text-center blur-sm text-slate-400 text-xs">••••</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hiddenBacklinks.length > 0 && (
                <div class="p-4 text-center text-sm text-slate-500 border-t border-slate-100 bg-slate-50">
                  <i class="fas fa-lock mr-1"></i>
                  <b class="text-slate-900">{hiddenBacklinks.length}개</b> 백링크가 더 있습니다 ·
                  <a href="/pricing" class="text-brand font-semibold hover:underline ml-1">Pro로 전체 보기</a>
                </div>
              )}
            </div>

            {/* 3) 경쟁사 링크 갭 */}
            {gap.length > 0 && (
              <div class="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white overflow-hidden">
                <div class="p-5 border-b border-amber-100">
                  <div class="flex items-center gap-2">
                    <div class="font-semibold text-slate-900">
                      <i class="fas fa-flag-checkered text-amber-600 mr-2"></i>
                      경쟁 치과 링크 소스 · 우리 병원이 못 받은 기회
                    </div>
                    <span class="px-2 py-0.5 rounded-md bg-amber-500 text-white text-xs font-bold">Pro</span>
                  </div>
                  <div class="text-xs text-slate-600 mt-1.5">
                    경쟁 치과가 받고 있는 링크 중 <b>우리 병원은 아직 못 받은</b> 출처입니다. 제보·기고·보도자료로 공략 가능.
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-white/60 text-slate-600 text-xs uppercase tracking-wider">
                      <tr>
                        <th class="text-left px-5 py-3">링크 출처</th>
                        <th class="text-left px-5 py-3 hidden md:table-cell">링크 받은 경쟁사</th>
                        <th class="text-left px-5 py-3 hidden md:table-cell">맥락 (앵커)</th>
                        <th class="text-center px-5 py-3 w-24">출처 권위</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-amber-100">
                      {visibleGap.map((g) => (
                        <tr class="hover:bg-amber-50/60">
                          <td class="px-5 py-3">
                            <a href={g.source_url} target="_blank" rel="noopener" class="text-brand font-medium hover:underline">
                              {g.source_domain}
                            </a>
                            <div class="text-xs text-slate-400 truncate max-w-[260px]">{g.source_url}</div>
                          </td>
                          <td class="px-5 py-3 hidden md:table-cell">
                            <div class="text-slate-700 font-medium">{g.competitor_domain}</div>
                            <div class="text-xs text-slate-500">DR {g.competitor_rank}</div>
                          </td>
                          <td class="px-5 py-3 hidden md:table-cell text-slate-600 truncate max-w-[200px]" title={g.anchor}>
                            {g.anchor}
                          </td>
                          <td class="px-5 py-3 text-center">
                            <span class={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md text-xs font-bold ${
                              g.source_rank >= 70 ? 'bg-accent text-white'
                              : g.source_rank >= 50 ? 'bg-brand text-white'
                              : 'bg-amber-500 text-white'
                            }`}>{g.source_rank}</span>
                          </td>
                        </tr>
                      ))}
                      {hiddenGap.slice(0, 3).map((g) => (
                        <tr class="relative select-none">
                          <td class="px-5 py-3 blur-sm">
                            <div class="font-medium text-slate-400">{g.source_domain}</div>
                          </td>
                          <td class="px-5 py-3 hidden md:table-cell text-slate-400 blur-sm">{g.competitor_domain}</td>
                          <td class="px-5 py-3 hidden md:table-cell text-slate-400 blur-sm">{g.anchor}</td>
                          <td class="px-5 py-3 text-center blur-sm">
                            <span class="inline-block min-w-[2.5rem] px-2 py-0.5 rounded-md bg-slate-200 text-xs font-bold text-slate-600">{g.source_rank}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hiddenGap.length > 0 && (
                  <div class="p-4 text-center text-sm text-slate-600 bg-amber-50 border-t border-amber-100">
                    <i class="fas fa-lock mr-1"></i>
                    <b class="text-slate-900">{hiddenGap.length}개</b>의 경쟁사 링크 기회가 더 있습니다 ·
                    <a href="/pricing" class="text-brand font-semibold hover:underline ml-1">Pro로 전체 보기</a>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 게이팅 CTA (비회원 + 추가 키워드 존재) */}
        {scan.is_gated && hiddenCount > 0 && (
          <div class="mt-6 p-8 rounded-2xl bg-gradient-to-br from-brand-50 via-white to-emerald-50 border-2 border-brand-100">
            <div class="max-w-xl mx-auto text-center">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warn/10 text-warn text-xs font-semibold mb-4">
                <i class="fas fa-lock"></i> {hiddenCount}개 키워드 잠김
              </div>
              <h3 class="text-2xl font-bold text-slate-900">
                전체 키워드 + PDF 리포트<br class="md:hidden" /> <span class="text-brand">무료</span>로 받기
              </h3>
              <p class="mt-3 text-slate-600">
                이메일 입력하면 전체 {scan.keyword_count}개 키워드와 PDF 리포트를 즉시 발송합니다.<br />
                <span class="text-xs">스팸 없음 · 언제든 수신 거부 가능</span>
              </p>

              <form id="lead-form" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <input type="hidden" name="scan_id" value={scan.scanId} />
                <div class="md:col-span-2">
                  <label class="text-xs text-slate-500">이메일 <span class="text-warn">*</span></label>
                  <input name="email" type="email" required placeholder="doctor@clinic.co.kr"
                    class="mt-1 w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-50 outline-none" />
                </div>
                <div>
                  <label class="text-xs text-slate-500">병원명</label>
                  <input name="clinic_name" type="text" placeholder="서울비디치과"
                    class="mt-1 w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-50 outline-none" />
                </div>
                <div>
                  <label class="text-xs text-slate-500">진료과</label>
                  <select name="specialty" class="mt-1 w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-50 outline-none">
                    <option value="">선택</option>
                    <option>치과</option><option>한의원</option><option>피부과</option><option>성형외과</option>
                    <option>안과</option><option>정형외과</option><option>이비인후과</option><option>산부인과</option>
                    <option>내과</option><option>기타</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="text-xs text-slate-500">원장명</label>
                  <input name="doctor_name" type="text" placeholder="문석준"
                    class="mt-1 w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-50 outline-none" />
                </div>
                <label class="md:col-span-2 flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="kakao_opt_in" value="1" class="w-4 h-4 rounded border-slate-300" />
                  Patient Rank 카카오 채널 추가하고 주간 순위 알림 받기
                </label>
                <button type="submit" class="md:col-span-2 py-4 rounded-xl bg-brand hover:bg-brand-600 text-white font-semibold text-lg shadow-md transition">
                  <i class="fas fa-unlock mr-2"></i>전체 리포트 잠금 해제
                </button>
                <div id="lead-status" class="md:col-span-2 text-sm text-center"></div>
              </form>
            </div>
          </div>
        )}

        {/* 로그인 안내 (추가 가치 제안) */}
        <div class="mt-10 p-6 rounded-2xl border border-slate-200 bg-white">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div class="font-semibold text-slate-900">
                <i class="fas fa-bell text-brand mr-2"></i>
                매주 자동으로 순위 변동 받기
              </div>
              <div class="text-sm text-slate-600 mt-1">
                Basic 플랜 가입 시 주간 변동 카톡 알림 · 경쟁사 갭 분석 · 백링크까지 (Pro)
              </div>
            </div>
            <a href="/pricing" class="px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold whitespace-nowrap">
              플랜 보기
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <script
        id="scan-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          top3: scan.top3_count,
          top10: scan.top10_count - scan.top3_count,
          top30: scan.top30_count - scan.top10_count,
          top100: scan.top100_count - scan.top30_count,
        }) }}
      />
      <script src="/static/result.js"></script>
    </Layout>
  )
}
