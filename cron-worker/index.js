// patientrank-cron — Cloudflare Pages는 Cron Trigger를 지원하지 않으므로
// 이 초경량 Worker가 스케줄에 맞춰 메인 앱의 /api/cron/run을 호출한다.
//   "0 21 * * 0" → weekly (주간 리스캔 + 카카오 리포트, 월 06:00 KST)
//   "0 21 * * *" → daily  (정기결제 자동 청구, 매일 06:00 KST)
export default {
  async scheduled(event, env, ctx) {
    const job = event.cron.endsWith('SUN') ? 'weekly' : 'daily'
    const url = `${env.APP_URL}/api/cron/run?job=${job}`
    ctx.waitUntil(
      fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
      })
        .then(async (r) => console.log(`[cron] ${job} → ${r.status} ${await r.text()}`))
        .catch((e) => console.error(`[cron] ${job} failed:`, e)),
    )
  },
  // 수동 트리거/헬스체크용
  async fetch(req, env) {
    return new Response(JSON.stringify({ ok: true, service: 'patientrank-cron' }), {
      headers: { 'content-type': 'application/json' },
    })
  },
}
