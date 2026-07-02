import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'

// ===================================================================
// /beta — 베타 신청 페이지 (페이션트 퍼널 수료생 50% 평생 할인 강조)
// ===================================================================
export const BetaPage: FC<{ alreadySignedUp?: boolean }> = ({ alreadySignedUp }) => {
  return (
    <Layout title="PatientRank 베타 신청 — 페이션트 퍼널 수료생 50% 평생 할인" description="페이션트 퍼널 수료생 50명 한정 베타. 평생 50% 할인.">
      <NavBar />
      <main class="min-h-screen pt-24 pb-20 px-4 hero-dark">
        <div class="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div class="text-center mb-10">
            <span class="inline-block px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-4">
              <i class="fas fa-crown mr-1.5"></i>EARLY ACCESS · 50명 한정
            </span>
            <h1 class="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              페이션트 퍼널 수료생<br/>
              <span class="text-gradient-brand">평생 50% 할인 베타</span>
            </h1>
            <p class="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
              매월 <span class="text-white font-bold">149,000원 → 74,500원</span><br/>
              평생 할인은 베타 50명 한정입니다.
            </p>
          </div>

          {/* 혜택 카드 3개 */}
          <div class="grid md:grid-cols-3 gap-3 mb-10">
            {[
              { icon: 'fa-percent', label: '평생 50% 할인', desc: '월 74,500원 (Pro 기준)' },
              { icon: 'fa-rocket', label: '신기능 우선 사용', desc: 'AI 액션 가이드, 주간 카톡' },
              { icon: 'fa-headset', label: '1:1 슬랙 채널', desc: '문석준 원장 직접 지원' },
            ].map((b) => (
              <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <i class={`fas ${b.icon} text-2xl text-brand-300 mb-2`}></i>
                <div class="font-extrabold text-white text-sm mb-1">{b.label}</div>
                <div class="text-xs text-white/50">{b.desc}</div>
              </div>
            ))}
          </div>

          {alreadySignedUp ? (
            <div class="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-400/30 text-center">
              <i class="fas fa-check-circle text-emerald-300 text-5xl mb-4"></i>
              <h2 class="text-2xl font-extrabold text-white mb-2">신청이 접수되었습니다 🎉</h2>
              <p class="text-white/70 leading-relaxed">
                72시간 이내에 카카오톡으로 초대 링크를 보내드릴게요.<br/>
                <span class="text-amber-300 font-bold">페이션트 퍼널 수료생</span>이라면 우선 처리됩니다.
              </p>
              <a href="/" class="inline-block mt-6 px-6 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-700 transition-colors">
                홈으로 돌아가기
              </a>
            </div>
          ) : (
            <form id="beta-form" class="bento-card rounded-3xl p-8 space-y-5">
              <div>
                <label class="block text-xs font-extrabold uppercase tracking-widest text-white/60 mb-2">
                  이름 *
                </label>
                <input
                  name="name"
                  required
                  placeholder="문석준"
                  class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-extrabold uppercase tracking-widest text-white/60 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="doctor@clinic.com"
                  class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition-colors"
                />
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-extrabold uppercase tracking-widest text-white/60 mb-2">
                    병원 이름
                  </label>
                  <input
                    name="clinic_name"
                    placeholder="서울비디치과"
                    class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-xs font-extrabold uppercase tracking-widest text-white/60 mb-2">
                    카카오톡 연락처
                  </label>
                  <input
                    name="phone"
                    placeholder="010-0000-0000"
                    class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-extrabold uppercase tracking-widest text-white/60 mb-2">
                  병원 홈페이지 URL
                </label>
                <input
                  name="clinic_url"
                  placeholder="https://bdbddc.com"
                  class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition-colors"
                />
              </div>

              {/* 페이션트 퍼널 수료생 인증 */}
              <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30">
                <label class="block text-xs font-extrabold uppercase tracking-widest text-amber-300 mb-2">
                  <i class="fas fa-crown mr-1"></i> 페이션트 퍼널 수료증 번호 (선택)
                </label>
                <input
                  name="patient_funnel_code"
                  placeholder="PF2024-12345"
                  class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-amber-400/30 text-white placeholder-amber-300/30 focus:border-amber-300 focus:outline-none transition-colors font-mono"
                />
                <p class="text-[11px] text-amber-200/70 mt-2 leading-relaxed">
                  수료증 번호 입력 시 <span class="font-bold">우선 초대 + 평생 50% 할인 쿠폰</span>이 자동 적용됩니다.<br/>
                  형식: PF2024-12345 (수료증 우상단에 기재)
                </p>
              </div>

              <div>
                <label class="block text-xs font-extrabold uppercase tracking-widest text-white/60 mb-2">
                  바라는 점 (선택)
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="SEO에서 가장 답답한 점, PatientRank에 바라는 기능 등 자유롭게 적어주세요."
                  class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                id="beta-submit-btn"
                class="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-brand to-accent text-white font-extrabold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <i class="fas fa-paper-plane"></i>
                <span>베타 신청하기</span>
              </button>

              <div id="beta-error" class="hidden p-3 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-300 text-sm"></div>

              <p class="text-[11px] text-white/40 text-center leading-relaxed">
                신청 시 <a href="/privacy" class="underline">개인정보처리방침</a> 및 <a href="/terms" class="underline">이용약관</a>에 동의한 것으로 간주합니다.
              </p>
            </form>
          )}

          {/* 사회적 증거 */}
          <div class="mt-12 grid grid-cols-3 gap-3 text-center">
            {[
              { n: '6,000+', l: '페이션트 퍼널 수료생' },
              { n: '2.1x', l: '평균 매출 성장' },
              { n: '40%', l: '광고비 절감' },
            ].map((s) => (
              <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div class="text-2xl md:text-3xl font-black text-gradient-brand mb-1">{s.n}</div>
                <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 폼 제출 스크립트 */}
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            const form = document.getElementById('beta-form');
            if (!form) return;
            const btn = document.getElementById('beta-submit-btn');
            const errBox = document.getElementById('beta-error');
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              errBox.classList.add('hidden');
              btn.disabled = true;
              btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...';
              const data = Object.fromEntries(new FormData(form));
              try {
                const res = await fetch('/api/beta/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                const json = await res.json();
                if (res.ok && json.success) {
                  window.location.href = '/beta?signed_up=1';
                } else {
                  errBox.textContent = json.reason || '신청 중 오류가 발생했습니다.';
                  errBox.classList.remove('hidden');
                  btn.disabled = false;
                  btn.innerHTML = '<i class="fas fa-paper-plane"></i> 베타 신청하기';
                }
              } catch (err) {
                errBox.textContent = '네트워크 오류. 잠시 후 다시 시도해주세요.';
                errBox.classList.remove('hidden');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> 베타 신청하기';
              }
            });
          })();
        `}}></script>
      </main>
      <Footer />
    </Layout>
  )
}
