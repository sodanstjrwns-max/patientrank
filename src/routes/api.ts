// API 라우트
import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { extractDomain, getClientIp, hashIp } from '../lib/utils'
import { runScan, countRecentScansByIp, getScanById } from '../lib/scan-service'

const api = new Hono<{ Bindings: Bindings }>()

// 헬스체크
api.get('/health', (c) => c.json({ ok: true, service: 'patientrank', ts: new Date().toISOString() }))

/**
 * POST /api/scan
 * body: { url: string }
 * 비회원 진단 실행 (IP 해시 기반 월 3회 제한)
 */
api.post('/scan', async (c) => {
  const body = await c.req.json().catch(() => ({})) as { url?: string }
  const raw = (body?.url || '').trim()
  const domain = extractDomain(raw)
  if (!domain) {
    return c.json({ error: 'INVALID_URL', message: '올바른 URL 형식이 아닙니다' }, 400)
  }

  const ip = getClientIp(c.req.raw)
  const ipHash = await hashIp(ip)

  // Free 유저 월 3회 하드리밋
  const recentCount = await countRecentScansByIp(c.env, ipHash, 30)
  if (recentCount >= 3) {
    return c.json({
      error: 'RATE_LIMIT',
      message: '월 3회 무료 조회를 모두 사용했습니다. Basic 플랜으로 업그레이드해주세요',
      count: recentCount,
    }, 429)
  }

  try {
    const result = await runScan(c.env, domain, { ipHash })
    return c.json({ ok: true, scan: result })
  } catch (e: any) {
    console.error('scan error', e)
    return c.json({ error: 'SCAN_FAILED', message: e?.message || '진단 중 오류가 발생했습니다' }, 500)
  }
})

/**
 * GET /api/scan/:id
 * 결과 조회
 */
api.get('/scan/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'BAD_ID' }, 400)
  const scan = await getScanById(c.env, id)
  if (!scan) return c.json({ error: 'NOT_FOUND' }, 404)
  return c.json({ ok: true, scan })
})

/**
 * POST /api/leads
 * body: { scan_id, email, clinic_name?, specialty?, doctor_name?, kakao_opt_in? }
 * 이메일 게이팅: 리드 저장 + 전체 키워드 잠금 해제
 */
api.post('/leads', async (c) => {
  const body = await c.req.json().catch(() => ({})) as any
  const scanId = Number(body?.scan_id)
  const email = String(body?.email || '').trim().toLowerCase()
  const clinicName = body?.clinic_name ? String(body.clinic_name).trim() : null
  const specialty = body?.specialty ? String(body.specialty).trim() : null
  const doctorName = body?.doctor_name ? String(body.doctor_name).trim() : null
  const kakaoOptIn = body?.kakao_opt_in ? 1 : 0

  if (!scanId || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'INVALID_INPUT', message: '이메일과 스캔 ID가 필요합니다' }, 400)
  }

  const scan = await c.env.DB.prepare(`SELECT id FROM scans WHERE id = ?`).bind(scanId).first<any>()
  if (!scan) return c.json({ error: 'NOT_FOUND' }, 404)

  await c.env.DB.prepare(
    `INSERT INTO leads (scan_id, email, clinic_name, specialty, doctor_name, kakao_opt_in)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(scanId, email, clinicName, specialty, doctorName, kakaoOptIn).run()

  // Resend 이메일 발송 (키가 있을 때만)
  if (c.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Patient Rank <report@patientrank.co.kr>',
          to: [email],
          subject: 'Patient Rank 구글 SEO 진단 리포트',
          html: `
            <div style="font-family:Pretendard,sans-serif;max-width:560px;margin:0 auto;padding:24px">
              <h2 style="color:#0066FF">Patient Rank 진단 리포트</h2>
              <p>${clinicName ? clinicName + ' ' : ''}${doctorName ? doctorName + ' 원장님' : '원장님'}, 안녕하세요.</p>
              <p>요청하신 구글 SEO 진단 리포트가 준비되었습니다.</p>
              <p><a href="${c.env.APP_URL}/result/${scanId}" style="display:inline-block;padding:12px 24px;background:#0066FF;color:white;border-radius:8px;text-decoration:none">전체 리포트 확인</a></p>
              <hr style="margin:32px 0;border:none;border-top:1px solid #eee">
              <p style="font-size:12px;color:#999">Patient Rank · 국내 최초 의료기관 전용 구글 SEO 진단</p>
            </div>
          `,
        }),
      })
    } catch (e) {
      console.error('resend error', e)
    }
  }

  return c.json({ ok: true, message: '리포트가 발송되었습니다' })
})

export default api
