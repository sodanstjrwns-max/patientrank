// 일반 유저 대시보드 + 로그인 페이지
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'
import type { AuthUser } from '../lib/auth'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  agency: 'Agency',
}

export const LoginPage: FC<{ error?: string }> = ({ error }) => {
  const errMsg =
    error === 'invalid_token'
      ? '유효하지 않은 로그인 링크입니다'
      : error === 'expired_or_used'
      ? '링크가 만료됐거나 이미 사용된 링크입니다. 다시 요청해주세요'
      : null

  return (
    <Layout title="로그인 · Patient Rank">
      <NavBar />
      <main class="max-w-md mx-auto px-5 py-20">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900">로그인</h1>
          <p class="mt-2 text-slate-600">비밀번호 없이 이메일 매직링크로 바로 로그인</p>
        </div>

        {errMsg && (
          <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <i class="fas fa-circle-exclamation mr-2"></i>{errMsg}
          </div>
        )}

        <form id="magicForm" class="space-y-4 p-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div>
            <label class="text-sm font-medium text-slate-700">이메일</label>
            <input
              id="emailInput"
              type="email"
              required
              placeholder="doctor@clinic.co.kr"
              class="mt-1 w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-50 outline-none"
            />
          </div>
          <button
            type="submit"
            id="submitBtn"
            class="w-full py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600 transition">
            <i class="fas fa-envelope mr-2"></i>매직링크 받기
          </button>
          <p class="text-xs text-slate-500 text-center leading-relaxed">
            회원가입이 필요 없습니다. 이메일로 받은 링크를 클릭하면 바로 로그인됩니다.<br />
            링크는 15분간 유효합니다.
          </p>
        </form>

        <div id="resultBox" class="hidden mt-6 p-5 rounded-xl bg-brand-50 border border-brand-100 text-sm">
          <div id="resultMsg" class="font-medium text-slate-900"></div>
          <a id="devLink" href="#" class="hidden mt-3 inline-block text-brand font-semibold underline">
            ➜ 개발 모드: 여기를 클릭해 로그인
          </a>
        </div>
      </main>
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('magicForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const email = document.getElementById('emailInput').value.trim();
              const btn = document.getElementById('submitBtn');
              const box = document.getElementById('resultBox');
              const msg = document.getElementById('resultMsg');
              const dl = document.getElementById('devLink');
              btn.disabled = true;
              btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>발송 중...';
              try {
                const res = await fetch('/api/auth/magic-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                });
                const data = await res.json();
                box.classList.remove('hidden');
                msg.textContent = data.message || '링크를 발송했습니다';
                if (data.devLink) {
                  dl.href = data.devLink;
                  dl.classList.remove('hidden');
                }
                btn.innerHTML = '<i class="fas fa-check mr-2"></i>발송 완료';
              } catch (err) {
                msg.textContent = '발송 실패. 다시 시도해주세요.';
                box.classList.remove('hidden');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-envelope mr-2"></i>매직링크 받기';
              }
            });
          `,
        }}
      />
    </Layout>
  )
}

interface DashboardProps {
  user: AuthUser
  scans: Array<{
    id: number
    url: string
    keyword_count: number
    top10_count: number
    estimated_traffic: number
    created_at: string
  }>
}

export const DashboardPage: FC<DashboardProps> = ({ user, scans }) => {
  const planLabel = PLAN_LABELS[user.plan] || 'Free'
  const isPaid = user.plan !== 'free'

  return (
    <Layout title="대시보드 · Patient Rank">
      <NavBar loggedIn />
      <main class="max-w-6xl mx-auto px-5 py-10">
        {/* 헤더 */}
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900">
              {user.clinic_name || user.email} 대시보드
            </h1>
            <p class="mt-1 text-slate-600">
              {user.name ? `${user.name} 원장님, ` : ''}환영합니다. 현재 플랜: <span class={`font-semibold ${isPaid ? 'text-brand' : 'text-slate-700'}`}>{planLabel}</span>
              {user.is_admin === 1 && <span class="ml-2 px-2 py-0.5 rounded bg-accent text-white text-xs font-bold">ADMIN</span>}
            </p>
          </div>
          <div class="flex gap-2">
            {user.is_admin === 1 && (
              <a href="/admin" class="px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent hover:text-white font-semibold text-sm transition">
                <i class="fas fa-shield-halved mr-1"></i>어드민
              </a>
            )}
            <button
              id="logoutBtn"
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm">
              <i class="fas fa-right-from-bracket mr-1"></i>로그아웃
            </button>
          </div>
        </div>

        {/* 빠른 스캔 */}
        <section class="mb-8 p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white">
          <h2 class="text-lg font-bold text-slate-900 mb-3">
            <i class="fas fa-bolt text-brand mr-2"></i>새 진단 실행
          </h2>
          <form id="scanForm" class="flex flex-col md:flex-row gap-3">
            <input
              id="scanUrl"
              type="text"
              required
              placeholder="https://yourclinic.co.kr"
              class="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand-50 outline-none"
            />
            <button
              type="submit"
              id="scanBtn"
              class="px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:bg-brand-600 whitespace-nowrap">
              <i class="fas fa-magnifying-glass-chart mr-2"></i>진단 시작
            </button>
          </form>
          <div id="scanStatus" class="hidden mt-3 text-sm text-slate-700"></div>
        </section>

        {/* 내 스캔 이력 */}
        <section class="mb-8">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            <i class="fas fa-clock-rotate-left text-slate-500 mr-2"></i>내 스캔 이력
          </h2>
          {scans.length === 0 ? (
            <div class="p-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div class="text-3xl mb-2">📊</div>
              <p class="text-slate-600">아직 진단 이력이 없습니다. 위에서 첫 URL을 입력해보세요.</p>
            </div>
          ) : (
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 text-slate-600 text-left">
                  <tr>
                    <th class="px-4 py-3 font-semibold">URL</th>
                    <th class="px-4 py-3 font-semibold text-right">키워드</th>
                    <th class="px-4 py-3 font-semibold text-right">TOP 10</th>
                    <th class="px-4 py-3 font-semibold text-right">추정 유입</th>
                    <th class="px-4 py-3 font-semibold">일시</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((s) => (
                    <tr class="border-t border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3 text-slate-700 truncate max-w-xs">{s.url}</td>
                      <td class="px-4 py-3 text-right font-semibold">{s.keyword_count.toLocaleString()}</td>
                      <td class="px-4 py-3 text-right text-brand font-semibold">{s.top10_count}</td>
                      <td class="px-4 py-3 text-right">{s.estimated_traffic.toLocaleString()}</td>
                      <td class="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(s.created_at).toLocaleString('ko-KR')}</td>
                      <td class="px-4 py-3 text-right">
                        <a href={`/result/${s.id}`} class="text-brand font-semibold hover:underline">보기 →</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 플랜 안내 */}
        {!isPaid && (
          <section class="p-6 rounded-2xl border-2 border-brand-100 bg-brand-50">
            <h3 class="font-bold text-slate-900 mb-2">
              <i class="fas fa-crown text-amber-500 mr-2"></i>Free 플랜 이용 중
            </h3>
            <p class="text-sm text-slate-700 mb-3">
              월 3회 조회 · TOP 20 키워드만 공개. Basic으로 업그레이드하면 전체 키워드 + 주간 알림이 제공됩니다.
            </p>
            <a href="/pricing" class="inline-block px-5 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-600">
              플랜 업그레이드 →
            </a>
          </section>
        )}
      </main>
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('logoutBtn').addEventListener('click', async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              location.href = '/';
            });
            document.getElementById('scanForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const url = document.getElementById('scanUrl').value.trim();
              const btn = document.getElementById('scanBtn');
              const st = document.getElementById('scanStatus');
              btn.disabled = true;
              btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>진단 중... (10~15초)';
              st.classList.remove('hidden');
              st.textContent = 'DataForSEO API 호출 중...';
              try {
                const res = await fetch('/api/scan', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                });
                const data = await res.json();
                if (data.ok && data.scan) {
                  location.href = '/result/' + data.scan.scanId;
                } else {
                  st.textContent = data.message || '진단 실패';
                  btn.disabled = false;
                  btn.innerHTML = '<i class="fas fa-magnifying-glass-chart mr-2"></i>진단 시작';
                }
              } catch (err) {
                st.textContent = '오류가 발생했습니다. 다시 시도해주세요.';
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-magnifying-glass-chart mr-2"></i>진단 시작';
              }
            });
          `,
        }}
      />
    </Layout>
  )
}
