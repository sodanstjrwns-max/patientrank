// 슈퍼 어드민 대시보드
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'
import type { AuthUser } from '../lib/auth'

interface AdminStats {
  total_users: number
  total_scans: number
  total_leads: number
  total_revenue: number
  scans_today: number
  scans_this_week: number
  paid_users: number
}

interface AdminScanRow {
  id: number
  url: string
  keyword_count: number
  top10_count: number
  estimated_traffic: number
  ip_hash: string | null
  user_email: string | null
  created_at: string
}

interface AdminLeadRow {
  id: number
  email: string
  clinic_name: string | null
  specialty: string | null
  doctor_name: string | null
  scan_id: number
  created_at: string
}

interface AdminUserRow {
  id: number
  email: string
  name: string | null
  clinic_name: string | null
  plan: string
  is_admin: number
  created_at: string
}

interface AdminDashboardProps {
  user: AuthUser
  stats: AdminStats
  recentScans: AdminScanRow[]
  recentLeads: AdminLeadRow[]
  users: AdminUserRow[]
}

export const AdminDashboardPage: FC<AdminDashboardProps> = ({
  user,
  stats,
  recentScans,
  recentLeads,
  users,
}) => {
  return (
    <Layout title="어드민 · Patient Rank">
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
              <i class="fas fa-shield-halved text-accent mr-2"></i>Patient Rank 운영 대시보드
            </h1>
          </div>
          <div class="flex gap-2 flex-wrap">
            <a href="/admin/beta" class="px-4 py-2 rounded-lg bg-brand text-white font-bold hover:bg-brand-700 text-sm">
              <i class="fas fa-paper-plane mr-1"></i>베타 인비테이션
            </a>
            <a href="/dashboard" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm">
              <i class="fas fa-user mr-1"></i>일반 대시보드
            </a>
            <button id="logoutBtn" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm">
              <i class="fas fa-right-from-bracket mr-1"></i>로그아웃
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon="users" label="전체 유저" value={stats.total_users} sub={`유료 ${stats.paid_users}`} color="brand" />
          <StatCard icon="magnifying-glass-chart" label="총 스캔 수" value={stats.total_scans} sub={`오늘 ${stats.scans_today} · 이번주 ${stats.scans_this_week}`} color="accent" />
          <StatCard icon="envelope-open-text" label="리드 수집" value={stats.total_leads} sub="비회원 이메일 제출" color="amber" />
          <StatCard icon="won-sign" label="누적 매출" value={stats.total_revenue} suffix="원" sub={`유료 유저 ${stats.paid_users}명`} color="slate" />
        </section>

        {/* 최근 스캔 */}
        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            <i class="fas fa-clock-rotate-left text-slate-500 mr-2"></i>최근 스캔 (최대 30)
          </h2>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600 text-left">
                <tr>
                  <th class="px-4 py-3 font-semibold">#</th>
                  <th class="px-4 py-3 font-semibold">URL</th>
                  <th class="px-4 py-3 font-semibold">유저/IP</th>
                  <th class="px-4 py-3 font-semibold text-right">키워드</th>
                  <th class="px-4 py-3 font-semibold text-right">TOP10</th>
                  <th class="px-4 py-3 font-semibold text-right">유입</th>
                  <th class="px-4 py-3 font-semibold">일시</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentScans.length === 0 ? (
                  <tr>
                    <td colspan={8} class="px-4 py-10 text-center text-slate-500">스캔 이력이 없습니다</td>
                  </tr>
                ) : (
                  recentScans.map((s) => (
                    <tr class="border-t border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3 text-slate-500">{s.id}</td>
                      <td class="px-4 py-3 text-slate-700 truncate max-w-xs">{s.url}</td>
                      <td class="px-4 py-3 text-slate-600 text-xs">
                        {s.user_email ? <span class="text-brand font-medium">{s.user_email}</span> : <span class="text-slate-400">IP: {(s.ip_hash || '').slice(0, 8)}…</span>}
                      </td>
                      <td class="px-4 py-3 text-right font-semibold">{s.keyword_count}</td>
                      <td class="px-4 py-3 text-right text-brand font-semibold">{s.top10_count}</td>
                      <td class="px-4 py-3 text-right">{s.estimated_traffic.toLocaleString()}</td>
                      <td class="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{new Date(s.created_at).toLocaleString('ko-KR')}</td>
                      <td class="px-4 py-3 text-right">
                        <a href={`/result/${s.id}`} class="text-brand font-semibold hover:underline text-xs">보기 →</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 최근 리드 */}
        <section class="mb-10">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            <i class="fas fa-envelope-open-text text-amber-500 mr-2"></i>최근 리드 수집 (최대 20)
          </h2>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600 text-left">
                <tr>
                  <th class="px-4 py-3 font-semibold">이메일</th>
                  <th class="px-4 py-3 font-semibold">병원</th>
                  <th class="px-4 py-3 font-semibold">진료과</th>
                  <th class="px-4 py-3 font-semibold">원장</th>
                  <th class="px-4 py-3 font-semibold">스캔</th>
                  <th class="px-4 py-3 font-semibold">일시</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colspan={6} class="px-4 py-10 text-center text-slate-500">아직 수집된 리드가 없습니다</td>
                  </tr>
                ) : (
                  recentLeads.map((l) => (
                    <tr class="border-t border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3 font-medium text-slate-900">{l.email}</td>
                      <td class="px-4 py-3 text-slate-700">{l.clinic_name || '-'}</td>
                      <td class="px-4 py-3 text-slate-600">{l.specialty || '-'}</td>
                      <td class="px-4 py-3 text-slate-600">{l.doctor_name || '-'}</td>
                      <td class="px-4 py-3">
                        <a href={`/result/${l.scan_id}`} class="text-brand hover:underline text-xs">#{l.scan_id}</a>
                      </td>
                      <td class="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString('ko-KR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 유저 목록 */}
        <section>
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            <i class="fas fa-users text-brand mr-2"></i>유저 목록 (최대 50)
          </h2>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600 text-left">
                <tr>
                  <th class="px-4 py-3 font-semibold">#</th>
                  <th class="px-4 py-3 font-semibold">이메일</th>
                  <th class="px-4 py-3 font-semibold">이름</th>
                  <th class="px-4 py-3 font-semibold">병원</th>
                  <th class="px-4 py-3 font-semibold">플랜</th>
                  <th class="px-4 py-3 font-semibold">가입일</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr class="border-t border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-3 text-slate-500">{u.id}</td>
                    <td class="px-4 py-3 font-medium text-slate-900">
                      {u.email}
                      {u.is_admin === 1 && <span class="ml-2 px-1.5 py-0.5 rounded bg-accent text-white text-[10px] font-bold">ADMIN</span>}
                    </td>
                    <td class="px-4 py-3 text-slate-700">{u.name || '-'}</td>
                    <td class="px-4 py-3 text-slate-700">{u.clinic_name || '-'}</td>
                    <td class="px-4 py-3">
                      <PlanBadge plan={u.plan} />
                    </td>
                    <td class="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(u.created_at).toLocaleString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('logoutBtn').addEventListener('click', async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              location.href = '/';
            });
          `,
        }}
      />
    </Layout>
  )
}

const StatCard: FC<{
  icon: string
  label: string
  value: number
  sub?: string
  color: string
  suffix?: string
}> = ({ icon, label, value, sub, color, suffix }) => {
  const colorMap: Record<string, string> = {
    brand: 'text-brand bg-brand-50',
    accent: 'text-accent bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    slate: 'text-slate-700 bg-slate-100',
  }
  return (
    <div class="p-5 rounded-2xl border border-slate-200 bg-white">
      <div class={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[color] || colorMap.brand}`}>
        <i class={`fas fa-${icon}`}></i>
      </div>
      <div class="text-xs text-slate-500 mb-1">{label}</div>
      <div class="text-2xl font-bold text-slate-900">
        {value.toLocaleString()}{suffix || ''}
      </div>
      {sub && <div class="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

const PlanBadge: FC<{ plan: string }> = ({ plan }) => {
  const styles: Record<string, string> = {
    free: 'bg-slate-100 text-slate-700',
    basic: 'bg-blue-100 text-blue-700',
    pro: 'bg-brand text-white',
    agency: 'bg-accent text-white',
  }
  return (
    <span class={`px-2 py-0.5 rounded text-xs font-semibold ${styles[plan] || styles.free}`}>
      {plan.toUpperCase()}
    </span>
  )
}
