// Day 7: 경쟁사 관리 페이지
import { Layout, NavBar, Footer } from './layout'
import type { Competitor } from '../lib/types'

interface Props {
  user: { id: number; email: string; name: string; plan: string }
  competitors: Competitor[]
  myDomain: string | null
}

export const CompetitorsPage = ({ user, competitors, myDomain }: Props) => (
  <Layout title="경쟁사 추적 — PatientRank">
    <NavBar loggedIn={!!user} />
    <main class="max-w-5xl mx-auto px-6 py-10">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          <i class="fas fa-crosshairs text-rose-600 mr-2"></i>
          경쟁사 추적
        </h1>
        <p class="text-gray-600 mt-2">
          우리 병원과 같은 지역·진료과목 경쟁 병원을 등록하면, 매주 자동으로 키워드 갭과 순위 변동을
          알려드립니다. <span class="text-gray-500">(최대 5개)</span>
        </p>
      </header>

      {!myDomain && (
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p class="text-sm text-amber-900">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            먼저 메인에서 우리 병원 도메인을 진단해 주세요. (등록한 도메인이 기준이 됩니다)
          </p>
        </div>
      )}

      {myDomain && (
        <section class="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-plus-circle text-emerald-600 mr-1"></i>
            경쟁사 추가
          </h2>
          <p class="text-sm text-gray-500 mb-3">
            내 도메인: <span class="font-mono text-gray-800">{myDomain}</span>
          </p>
          <form id="competitor-form" class="grid md:grid-cols-3 gap-3">
            <input
              type="text"
              id="comp-domain"
              required
              placeholder="competitor.com 또는 https://..."
              class="md:col-span-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
            />
            <input
              type="text"
              id="comp-alias"
              placeholder="표시 이름 (예: 강남임플란트치과)"
              class="md:col-span-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
            />
            <button
              type="submit"
              class="md:col-span-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg px-4 py-2 text-sm"
            >
              <i class="fas fa-plus mr-1"></i> 추가
            </button>
          </form>
          <div id="comp-msg" class="text-sm mt-3"></div>
        </section>
      )}

      <section class="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">
            <i class="fas fa-list text-gray-500 mr-1"></i>
            등록된 경쟁사{' '}
            <span class="text-sm text-gray-500 font-normal">({competitors.length}/5)</span>
          </h2>
        </div>
        {competitors.length === 0 ? (
          <div class="px-6 py-12 text-center text-gray-500">
            <i class="fas fa-users-slash text-3xl mb-3 text-gray-300"></i>
            <p>아직 등록된 경쟁사가 없습니다.</p>
          </div>
        ) : (
          <ul class="divide-y divide-gray-100">
            {competitors.map((c) => (
              <li class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p class="font-semibold text-gray-900">
                    {c.alias || c.competitor_domain}
                  </p>
                  <p class="text-sm text-gray-500 font-mono">{c.competitor_domain}</p>
                </div>
                <button
                  data-id={c.id}
                  class="competitor-remove text-rose-600 hover:text-rose-800 text-sm font-medium"
                >
                  <i class="fas fa-times mr-1"></i> 삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const form = document.getElementById('competitor-form');
            const msg = document.getElementById('comp-msg');
            if (form) {
              form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const domain = document.getElementById('comp-domain').value.trim();
                const alias = document.getElementById('comp-alias').value.trim();
                msg.textContent = '추가 중...';
                msg.className = 'text-sm mt-3 text-gray-500';
                try {
                  const res = await fetch('/api/competitors/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ competitor_domain: domain, alias }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    msg.textContent = '❌ ' + (data.error || '오류가 발생했습니다');
                    msg.className = 'text-sm mt-3 text-rose-600';
                    return;
                  }
                  msg.textContent = '✅ 등록되었습니다';
                  msg.className = 'text-sm mt-3 text-emerald-600';
                  setTimeout(() => location.reload(), 500);
                } catch (err) {
                  msg.textContent = '❌ 네트워크 오류';
                  msg.className = 'text-sm mt-3 text-rose-600';
                }
              });
            }
            document.querySelectorAll('.competitor-remove').forEach((btn) => {
              btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (!confirm('정말 삭제하시겠습니까?')) return;
                const res = await fetch('/api/competitors/' + id, { method: 'DELETE' });
                if (res.ok) location.reload();
                else alert('삭제 실패');
              });
            });
          `,
        }}
      ></script>
    </main>
    <Footer />
  </Layout>
)
