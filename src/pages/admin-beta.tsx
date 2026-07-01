// 어드민 베타 인비테이션 관리 페이지
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'
import type { AuthUser } from '../lib/auth'
import type { BetaSignup } from '../lib/types'

interface BetaStats {
  total: number
  pending: number
  invited: number
  signed_up: number
  pf_alumni: number
}

interface AdminBetaPageProps {
  user: AuthUser
  signups: BetaSignup[]
  stats: BetaStats
}

export const AdminBetaPage: FC<AdminBetaPageProps> = ({ user, signups, stats }) => {
  return (
    <Layout title="베타 인비테이션 관리 · Patient Rank">
      <NavBar loggedIn />
      <main class="max-w-7xl mx-auto px-5 py-10">
        {/* 헤더 */}
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded bg-accent text-white text-xs font-bold">SUPER ADMIN</span>
              <span class="text-sm text-slate-500">{user.email}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900">
              <i class="fas fa-paper-plane text-brand mr-2"></i>베타 인비테이션 관리
            </h1>
            <p class="text-sm text-slate-500 mt-1">신청자 검토 + 초대 발송 (페이션트 퍼널 수료생 우선)</p>
          </div>
          <div class="flex gap-2">
            <a href="/admin" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm">
              <i class="fas fa-arrow-left mr-1"></i>어드민 메인
            </a>
            <button id="bulk-invite-btn" class="px-4 py-2 rounded-lg bg-brand text-white font-bold hover:bg-brand-700 text-sm">
              <i class="fas fa-bullhorn mr-1"></i>대기자 일괄 초대
            </button>
          </div>
        </div>

        {/* 통계 카드 5종 */}
        <section class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="전체 신청" value={stats.total} icon="fa-users" color="slate" />
          <StatCard label="대기중" value={stats.pending} icon="fa-clock" color="amber" />
          <StatCard label="초대 발송" value={stats.invited} icon="fa-paper-plane" color="brand" />
          <StatCard label="가입 완료" value={stats.signed_up} icon="fa-check-circle" color="accent" />
          <StatCard label="페이션트 퍼널" value={stats.pf_alumni} icon="fa-crown" color="amber" highlight />
        </section>

        {/* 신청자 목록 */}
        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            <i class="fas fa-list text-slate-500 mr-2"></i>신청자 목록 ({signups.length})
            <span class="ml-2 text-xs font-normal text-slate-500">— 페이션트 퍼널 수료생 ↑ 우선 정렬</span>
          </h2>
          <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600 text-left">
                <tr>
                  <th class="px-3 py-3 font-semibold">#</th>
                  <th class="px-3 py-3 font-semibold">PF</th>
                  <th class="px-3 py-3 font-semibold">이름</th>
                  <th class="px-3 py-3 font-semibold">이메일</th>
                  <th class="px-3 py-3 font-semibold">병원</th>
                  <th class="px-3 py-3 font-semibold">연락처</th>
                  <th class="px-3 py-3 font-semibold">수료증</th>
                  <th class="px-3 py-3 font-semibold">상태</th>
                  <th class="px-3 py-3 font-semibold">신청일</th>
                  <th class="px-3 py-3 font-semibold">액션</th>
                </tr>
              </thead>
              <tbody>
                {signups.length === 0 ? (
                  <tr>
                    <td colspan={10} class="px-4 py-16 text-center text-slate-500">
                      <i class="fas fa-inbox text-4xl text-slate-300 mb-3 block"></i>
                      아직 베타 신청이 없습니다
                    </td>
                  </tr>
                ) : (
                  signups.map((s) => (
                    <tr class={`border-t border-slate-100 hover:bg-slate-50 ${s.is_pf_alumni ? 'bg-amber-50/40' : ''}`}>
                      <td class="px-3 py-3 text-slate-500">{s.id}</td>
                      <td class="px-3 py-3">
                        {s.is_pf_alumni ? (
                          <span class="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold" title="페이션트 퍼널 수료생">
                            <i class="fas fa-crown"></i>
                          </span>
                        ) : (
                          <span class="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                      <td class="px-3 py-3 font-semibold text-slate-900">{s.name}</td>
                      <td class="px-3 py-3 text-slate-700 text-xs">{s.email}</td>
                      <td class="px-3 py-3 text-slate-700 text-xs">{s.clinic_name || '-'}</td>
                      <td class="px-3 py-3 text-slate-600 font-mono text-xs">{s.phone || '-'}</td>
                      <td class="px-3 py-3 text-slate-500 font-mono text-[11px]">{s.patient_funnel_code || '-'}</td>
                      <td class="px-3 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td class="px-3 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td class="px-3 py-3">
                        {s.status === 'pending' ? (
                          <button
                            class="invite-btn px-2.5 py-1 rounded bg-brand text-white text-xs font-bold hover:bg-brand-700"
                            data-id={s.id}
                            data-name={s.name}
                            data-phone={s.phone || ''}
                          >
                            <i class="fas fa-paper-plane mr-1"></i>초대
                          </button>
                        ) : (
                          <span class="text-slate-400 text-xs">완료</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 결과 알림 영역 */}
        <div id="result-box" class="hidden p-4 rounded-2xl"></div>
      </main>
      <Footer />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const resultBox = document.getElementById('result-box');

            function showResult(success, message) {
              resultBox.className = 'p-4 rounded-2xl ' + (success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800');
              resultBox.innerHTML = '<i class="fas fa-' + (success ? 'check-circle' : 'exclamation-triangle') + ' mr-2"></i>' + message;
              setTimeout(() => resultBox.classList.add('hidden'), 5000);
            }

            // 개별 초대
            document.querySelectorAll('.invite-btn').forEach(btn => {
              btn.addEventListener('click', async () => {
                if (!confirm(btn.dataset.name + '님에게 초대장을 발송하시겠어요?')) return;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                try {
                  const res = await fetch('/api/admin/beta/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: parseInt(btn.dataset.id, 10) })
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    showResult(true, btn.dataset.name + '님에게 초대장 발송 완료 (' + (data.kakao_sent ? '카카오톡' : '로그만 기록') + ')');
                    setTimeout(() => location.reload(), 1500);
                  } else {
                    showResult(false, '초대 실패: ' + (data.reason || data.error || 'unknown'));
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-paper-plane mr-1"></i>초대';
                  }
                } catch (e) {
                  showResult(false, '네트워크 오류: ' + e.message);
                  btn.disabled = false;
                  btn.innerHTML = '<i class="fas fa-paper-plane mr-1"></i>초대';
                }
              });
            });

            // 대기자 일괄 초대
            document.getElementById('bulk-invite-btn').addEventListener('click', async () => {
              if (!confirm('대기 중인 모든 신청자에게 초대장을 발송할까요?\\n(페이션트 퍼널 수료생 우선)')) return;
              const btn = document.getElementById('bulk-invite-btn');
              btn.disabled = true;
              btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>발송 중...';
              try {
                const res = await fetch('/api/admin/beta/invite-all', { method: 'POST' });
                const data = await res.json();
                if (res.ok) {
                  showResult(true, '총 ' + data.invited + '명 초대 완료 (실패 ' + (data.failed || 0) + '명)');
                  setTimeout(() => location.reload(), 1800);
                } else {
                  showResult(false, '일괄 초대 실패: ' + (data.error || 'unknown'));
                }
              } catch (e) {
                showResult(false, '오류: ' + e.message);
              } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-bullhorn mr-1"></i>대기자 일괄 초대';
              }
            });
          `,
        }}
      />
    </Layout>
  )
}

const StatCard: FC<{ label: string; value: number; icon: string; color: string; highlight?: boolean }> = ({
  label, value, icon, color, highlight,
}) => {
  const colorMap: Record<string, string> = {
    slate: 'text-slate-700 bg-slate-100',
    amber: 'text-amber-600 bg-amber-50',
    brand: 'text-brand bg-brand-50',
    accent: 'text-accent bg-emerald-50',
  }
  return (
    <div class={`p-5 rounded-2xl border bg-white ${highlight ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'}`}>
      <div class={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[color] || colorMap.slate}`}>
        <i class={`fas ${icon}`}></i>
      </div>
      <div class="text-xs text-slate-500 mb-1">{label}</div>
      <div class="text-2xl font-bold text-slate-900">{value.toLocaleString()}</div>
    </div>
  )
}

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: '대기', cls: 'bg-amber-100 text-amber-700' },
    invited: { label: '초대됨', cls: 'bg-brand-50 text-brand-700' },
    signed_up: { label: '가입완료', cls: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: '거절', cls: 'bg-rose-100 text-rose-700' },
  }
  const s = map[status] || map.pending
  return <span class={`px-2 py-0.5 rounded text-xs font-semibold ${s.cls}`}>{s.label}</span>
}
