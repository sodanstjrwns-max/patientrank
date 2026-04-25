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
  const errMap: Record<string, string> = {
    invalid_token: '유효하지 않은 로그인 링크입니다',
    expired_or_used: '링크가 만료됐거나 이미 사용된 링크입니다. 다시 요청해주세요',
    google_not_configured: 'Google 로그인이 아직 설정되지 않았습니다. 이메일 로그인을 이용해주세요',
    google_init_failed: 'Google 로그인 초기화에 실패했습니다. 다시 시도해주세요',
    missing_code: 'Google 로그인 응답이 올바르지 않습니다',
    invalid_state: '보안 검증에 실패했습니다. 다시 로그인해주세요',
    token_exchange_failed: 'Google 인증 교환에 실패했습니다',
    userinfo_failed: 'Google 계정 정보를 불러올 수 없습니다',
    email_not_verified: '이메일이 인증되지 않은 Google 계정입니다',
  }
  const errMsg = error ? (errMap[error] || (error.startsWith('google_') ? 'Google 로그인 중 오류가 발생했습니다' : null)) : null

  return (
    <Layout title="로그인 · Patient Rank">
      <NavBar />
      <main class="max-w-md mx-auto px-5 py-20">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900">로그인</h1>
          <p class="mt-2 text-slate-600">Google 계정으로 1초 만에 시작하세요</p>
        </div>

        {errMsg && (
          <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <i class="fas fa-circle-exclamation mr-2"></i>{errMsg}
          </div>
        )}

        {/* Google 로그인 (1순위) */}
        <a
          href="/auth/google"
          class="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-sm transition font-semibold text-slate-800">
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          <span>Google 계정으로 계속하기</span>
        </a>

        {/* 구분선 */}
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-slate-200"></div>
          <div class="text-xs text-slate-400 font-medium">또는 이메일로</div>
          <div class="flex-1 h-px bg-slate-200"></div>
        </div>

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
