import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'

// ===================================================================
// /checkout?plan=pro&coupon=PATIENTFUNNEL50
// 토스페이먼츠 결제창 호출 페이지
// ===================================================================
export const CheckoutPage: FC<{
  plan: 'basic' | 'pro' | 'agency'
  basePrice: number
  finalPrice: number
  discountRate: number
  couponCode?: string
  user: { id: number; email: string; name?: string }
  tossClientKey: string
}> = ({ plan, basePrice, finalPrice, discountRate, couponCode, user, tossClientKey }) => {
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'agency' ? 'Agency' : 'Basic'
  const planEmoji = plan === 'pro' ? '⭐' : plan === 'agency' ? '🏢' : '🌱'

  return (
    <Layout title={`${planLabel} 결제 — PatientRank`}>
      <NavBar />
      <main class="min-h-screen pt-24 pb-20 px-4 hero-dark">
        <div class="max-w-3xl mx-auto">
          <a href="/pricing" class="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
            <i class="fas fa-arrow-left"></i>
            <span>가격으로 돌아가기</span>
          </a>

          <h1 class="text-3xl md:text-4xl font-black text-white mb-2">
            <span>{planEmoji}</span> {planLabel} 플랜 결제
          </h1>
          <p class="text-white/50 mb-8">
            결제 즉시 모든 기능이 활성화됩니다.
          </p>

          <div class="grid lg:grid-cols-5 gap-6">
            {/* 좌측: 주문 요약 */}
            <div class="lg:col-span-3 bento-card rounded-3xl p-7">
              <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">ORDER SUMMARY</div>

              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/10">
                  <div>
                    <div class="font-extrabold text-white text-lg">PatientRank {planLabel}</div>
                    <div class="text-xs text-white/50 mt-0.5">월간 구독 (매월 자동결제)</div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-black font-mono text-white">{basePrice.toLocaleString()}<span class="text-sm text-white/50 ml-1">원</span></div>
                  </div>
                </div>

                {discountRate > 0 && (
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
                    <div>
                      <div class="font-extrabold text-emerald-300 text-sm">
                        <i class="fas fa-tag mr-1.5"></i>
                        쿠폰 적용 ({couponCode})
                      </div>
                      <div class="text-xs text-emerald-200/70 mt-0.5">-{discountRate}% 할인</div>
                    </div>
                    <div class="text-right">
                      <div class="text-xl font-black font-mono text-emerald-300">
                        -{(basePrice - finalPrice).toLocaleString()}<span class="text-sm ml-1">원</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 쿠폰 입력 폼 */}
                {!couponCode && (
                  <div class="p-4 rounded-2xl bg-slate-950/40 border border-white/10">
                    <label class="block text-xs font-extrabold uppercase tracking-widest text-white/60 mb-2">
                      <i class="fas fa-ticket-alt mr-1"></i>쿠폰 코드
                    </label>
                    <div class="flex gap-2">
                      <input
                        id="coupon-input"
                        type="text"
                        placeholder="PATIENTFUNNEL50"
                        class="flex-1 px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 text-white placeholder-white/30 text-sm font-mono uppercase focus:border-brand focus:outline-none"
                      />
                      <button
                        id="coupon-apply-btn"
                        type="button"
                        class="px-4 py-2 rounded-lg bg-brand/20 border border-brand/30 text-brand-200 font-bold text-sm hover:bg-brand/30 transition-colors"
                      >
                        적용
                      </button>
                    </div>
                    <div id="coupon-msg" class="text-[11px] mt-2"></div>
                  </div>
                )}
              </div>

              {/* 최종 금액 */}
              <div class="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <div class="text-sm text-white/60 font-bold">최종 결제 금액 (VAT 포함)</div>
                <div class="text-right">
                  <div class="text-4xl font-black font-mono text-gradient-brand">
                    {finalPrice.toLocaleString()}<span class="text-lg text-white/50 ml-1">원</span>
                  </div>
                  <div class="text-[10px] text-white/40 mt-1">/ 월</div>
                </div>
              </div>
            </div>

            {/* 우측: 결제 버튼 */}
            <div class="lg:col-span-2 space-y-4">
              <div class="bento-card rounded-3xl p-6">
                <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">결제 방법</div>
                <div class="space-y-2 mb-5">
                  <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-brand/30">
                    <i class="far fa-credit-card text-brand-300"></i>
                    <span class="text-sm font-bold text-white">신용/체크카드</span>
                    <span class="ml-auto text-[10px] text-brand-200 font-bold">자동결제</span>
                  </div>
                </div>

                <button
                  id="pay-btn"
                  type="button"
                  class="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-brand to-accent text-white font-extrabold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <i class="fas fa-lock"></i>
                  <span>{finalPrice.toLocaleString()}원 결제하기</span>
                </button>

                <div id="pay-error" class="hidden mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs"></div>

                <div class="mt-4 space-y-2 text-[11px] text-white/40 leading-relaxed">
                  <div><i class="fas fa-shield-alt mr-1.5"></i>토스페이먼츠 PG 보안 결제</div>
                  <div><i class="fas fa-undo mr-1.5"></i>언제든 해지 가능 (다음 결제일 전까지)</div>
                  <div><i class="fas fa-receipt mr-1.5"></i>전자세금계산서 자동 발행</div>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-white/50 leading-relaxed">
                <i class="fas fa-info-circle text-brand-300 mr-1"></i>
                결제 후 30일 이내 환불 보장. <a href="/terms" class="underline hover:text-white">이용약관 §6 환불 정책</a> 참조.
              </div>
            </div>
          </div>
        </div>

        {/* 토스페이먼츠 v2 SDK */}
        <script src="https://js.tosspayments.com/v2/standard"></script>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            const userId = ${user.id};
            const userEmail = ${JSON.stringify(user.email)};
            const userName = ${JSON.stringify(user.name || user.email.split('@')[0])};
            const plan = ${JSON.stringify(plan)};
            let finalPrice = ${finalPrice};
            let appliedCoupon = ${JSON.stringify(couponCode || '')};
            const tossClientKey = ${JSON.stringify(tossClientKey)};

            // 쿠폰 적용
            const couponBtn = document.getElementById('coupon-apply-btn');
            if (couponBtn) {
              couponBtn.addEventListener('click', async () => {
                const code = (document.getElementById('coupon-input')).value.trim().toUpperCase();
                const msg = document.getElementById('coupon-msg');
                if (!code) return;
                msg.innerHTML = '<span class="text-white/50"><i class="fas fa-spinner fa-spin mr-1"></i>확인 중...</span>';
                try {
                  const res = await fetch('/api/coupon/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, plan })
                  });
                  const data = await res.json();
                  if (data.valid) {
                    msg.innerHTML = '<span class="text-emerald-300 font-bold"><i class="fas fa-check mr-1"></i>' + data.discount_rate + '% 할인 적용됨! 페이지 새로고침 중...</span>';
                    setTimeout(() => {
                      window.location.href = '/checkout?plan=' + plan + '&coupon=' + code;
                    }, 700);
                  } else {
                    msg.innerHTML = '<span class="text-rose-300"><i class="fas fa-times-circle mr-1"></i>' + (data.reason || '유효하지 않은 쿠폰') + '</span>';
                  }
                } catch (e) {
                  msg.innerHTML = '<span class="text-rose-300">오류가 발생했습니다.</span>';
                }
              });
            }

            // 결제 버튼
            const payBtn = document.getElementById('pay-btn');
            const errBox = document.getElementById('pay-error');
            payBtn.addEventListener('click', async () => {
              errBox.classList.add('hidden');
              payBtn.disabled = true;
              payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 결제창 준비 중...';

              try {
                // 1) 서버에 주문 생성 요청
                const orderRes = await fetch('/api/payment/init', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ plan: plan, coupon: appliedCoupon })
                });
                const orderData = await orderRes.json();
                if (!orderRes.ok || !orderData.order_id) {
                  throw new Error(orderData.error || '주문 생성 실패');
                }

                // 2) 토스페이먼츠 v2 SDK 호출
                const tossPayments = TossPayments(tossClientKey);
                const payment = tossPayments.payment({ customerKey: 'customer-' + userId });

                await payment.requestBillingAuth({
                  method: 'CARD',
                  successUrl: window.location.origin + '/payment/success?order_id=' + orderData.order_id + '&plan=' + plan + '&coupon=' + encodeURIComponent(appliedCoupon),
                  failUrl: window.location.origin + '/payment/fail',
                  customerEmail: userEmail,
                  customerName: userName,
                });
              } catch (e) {
                errBox.textContent = e.message || '결제 진행 중 오류가 발생했습니다.';
                errBox.classList.remove('hidden');
                payBtn.disabled = false;
                payBtn.innerHTML = '<i class="fas fa-lock"></i> ' + finalPrice.toLocaleString() + '원 결제하기';
              }
            });
          })();
        `}}></script>
      </main>
      <Footer />
    </Layout>
  )
}

// ===================================================================
// /payment/success — 결제 완료 페이지
// ===================================================================
export const PaymentSuccessPage: FC<{ orderId: string; plan: string; amount: number }> = ({ orderId, plan, amount }) => {
  return (
    <Layout title="결제 완료 — PatientRank">
      <NavBar />
      <main class="min-h-screen pt-24 pb-20 px-4 hero-dark">
        <div class="max-w-2xl mx-auto">
          <div class="bento-card rounded-3xl p-10 text-center">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-accent mx-auto mb-6 flex items-center justify-center">
              <i class="fas fa-check text-white text-3xl"></i>
            </div>
            <h1 class="text-3xl md:text-4xl font-black text-white mb-3">결제 완료 🎉</h1>
            <p class="text-white/60 mb-8 leading-relaxed">
              <span class="text-gradient-brand font-extrabold">{plan.toUpperCase()}</span> 플랜이 활성화되었습니다.<br/>
              지금 바로 모든 기능을 사용하실 수 있어요.
            </p>

            <div class="p-5 rounded-2xl bg-slate-950/40 border border-white/10 mb-6 text-left">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="text-white/50">주문번호</div>
                <div class="text-white font-mono text-right">{orderId.slice(0, 24)}...</div>
                <div class="text-white/50">플랜</div>
                <div class="text-white font-bold text-right">{plan.toUpperCase()}</div>
                <div class="text-white/50">결제금액</div>
                <div class="text-white font-bold text-right">{amount.toLocaleString()}원</div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <a href="/dashboard" class="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand to-accent text-white font-extrabold text-center hover:opacity-90 transition-opacity">
                <i class="fas fa-arrow-right mr-2"></i>대시보드로 가기
              </a>
              <a href="/#diagnose" class="flex-1 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-center hover:bg-white/10 transition-colors">
                <i class="fas fa-search mr-2"></i>새 진단 시작
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </Layout>
  )
}

// ===================================================================
// /payment/fail — 결제 실패 페이지
// ===================================================================
export const PaymentFailPage: FC<{ code?: string; message?: string }> = ({ code, message }) => {
  return (
    <Layout title="결제 실패 — PatientRank">
      <NavBar />
      <main class="min-h-screen pt-24 pb-20 px-4 hero-dark">
        <div class="max-w-xl mx-auto">
          <div class="bento-card rounded-3xl p-10 text-center">
            <div class="w-20 h-20 rounded-full bg-rose-500/15 border border-rose-400/30 mx-auto mb-6 flex items-center justify-center">
              <i class="fas fa-times text-rose-300 text-3xl"></i>
            </div>
            <h1 class="text-2xl md:text-3xl font-black text-white mb-3">결제 실패</h1>
            <p class="text-white/60 mb-6 leading-relaxed">
              결제가 정상적으로 완료되지 않았습니다.
            </p>
            {(code || message) && (
              <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-400/30 text-left mb-6">
                {code && <div class="text-xs text-rose-300 font-mono mb-1">오류 코드: {code}</div>}
                {message && <div class="text-sm text-rose-200">{message}</div>}
              </div>
            )}
            <a href="/pricing" class="inline-block px-6 py-3 rounded-2xl bg-brand text-white font-bold hover:bg-brand-700 transition-colors">
              <i class="fas fa-arrow-left mr-2"></i>다시 시도하기
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </Layout>
  )
}
