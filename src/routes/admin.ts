// 어드민 API 라우트 (통계, 스캔/리드/유저 조회)
import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { getUserFromCookie } from '../lib/auth'

const admin = new Hono<{ Bindings: Bindings }>()

/**
 * 어드민 미들웨어: is_admin=1 아니면 403
 */
admin.use('*', async (c, next) => {
  const user = await getUserFromCookie(c)
  if (!user || user.is_admin !== 1) {
    return c.json({ error: 'FORBIDDEN', message: '어드민 권한이 필요합니다' }, 403)
  }
  c.set('user', user)
  await next()
})

/**
 * GET /api/admin/stats - 통계 요약
 */
admin.get('/stats', async (c) => {
  const db = c.env.DB
  const [users, scans, leads, revenue, today, week, paid] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as n FROM users`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM scans`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM leads`).first<any>(),
    db.prepare(`SELECT COALESCE(SUM(amount_krw),0) as n FROM payments WHERE status='paid'`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM scans WHERE created_at >= datetime('now','-1 day')`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM scans WHERE created_at >= datetime('now','-7 day')`).first<any>(),
    db.prepare(`SELECT COUNT(*) as n FROM users WHERE plan != 'free'`).first<any>(),
  ])

  return c.json({
    ok: true,
    stats: {
      total_users: Number(users?.n || 0),
      total_scans: Number(scans?.n || 0),
      total_leads: Number(leads?.n || 0),
      total_revenue: Number(revenue?.n || 0),
      scans_today: Number(today?.n || 0),
      scans_this_week: Number(week?.n || 0),
      paid_users: Number(paid?.n || 0),
    },
  })
})

export default admin
