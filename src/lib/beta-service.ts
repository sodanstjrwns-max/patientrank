// ===================================================================
// 베타 신청 서비스
// - 신청 접수
// - 페이션트 퍼널 수료생 자동 검증
// - 어드민용 초대 발송
// ===================================================================

import type { Bindings, BetaSignup } from './types'

// 페이션트 퍼널 수료생 인증 코드 패턴 (예: PF2024-12345)
const PF_CODE_REGEX = /^PF\d{4}-\d{3,6}$/i

export function isValidPatientFunnelCode(code: string | null | undefined): boolean {
  if (!code) return false
  return PF_CODE_REGEX.test(code.trim())
}

export interface BetaSignupInput {
  email: string
  name: string
  clinic_name?: string
  clinic_url?: string
  phone?: string
  patient_funnel_code?: string
  source?: string
  message?: string
  user_agent?: string
  ip_hash?: string
}

// 베타 신청 접수
export async function submitBetaSignup(
  env: Bindings,
  input: BetaSignupInput,
): Promise<{ success: boolean; id?: number; is_pf_alumni: boolean; reason?: string }> {
  // 이메일 중복 체크
  const existing = await env.DB.prepare(
    `SELECT id, status FROM beta_signups WHERE email = ? LIMIT 1`,
  )
    .bind(input.email.toLowerCase())
    .first<{ id: number; status: string }>()

  if (existing) {
    return {
      success: false,
      is_pf_alumni: false,
      reason: existing.status === 'invited'
        ? '이미 초대장이 발송되었습니다. 메일을 확인해주세요.'
        : '이미 신청 접수되었습니다.',
    }
  }

  const isPfAlumni = isValidPatientFunnelCode(input.patient_funnel_code)

  const result = await env.DB.prepare(
    `INSERT INTO beta_signups
      (email, name, clinic_name, clinic_url, phone,
       patient_funnel_code, is_pf_alumni,
       status, source, message, user_agent, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
  )
    .bind(
      input.email.toLowerCase(),
      input.name,
      input.clinic_name || null,
      input.clinic_url || null,
      input.phone || null,
      input.patient_funnel_code || null,
      isPfAlumni ? 1 : 0,
      input.source || 'landing',
      input.message || null,
      input.user_agent || null,
      input.ip_hash || null,
    )
    .run()

  return {
    success: true,
    id: result.meta.last_row_id as number,
    is_pf_alumni: isPfAlumni,
  }
}

// 베타 신청 목록 조회 (어드민용)
export async function listBetaSignups(
  env: Bindings,
  status?: string,
  limit = 100,
): Promise<BetaSignup[]> {
  let query = `SELECT * FROM beta_signups`
  const params: any[] = []
  if (status) {
    query += ` WHERE status = ?`
    params.push(status)
  }
  query += ` ORDER BY is_pf_alumni DESC, created_at DESC LIMIT ?`
  params.push(limit)

  const result = await env.DB.prepare(query).bind(...params).all<BetaSignup>()
  return result.results || []
}

// 베타 통계
export async function getBetaStats(env: Bindings): Promise<{
  total: number
  pending: number
  invited: number
  signed_up: number
  pf_alumni: number
}> {
  const result = await env.DB.prepare(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status='invited' THEN 1 ELSE 0 END) as invited,
      SUM(CASE WHEN status='signed_up' THEN 1 ELSE 0 END) as signed_up,
      SUM(CASE WHEN is_pf_alumni=1 THEN 1 ELSE 0 END) as pf_alumni
     FROM beta_signups`,
  ).first<any>()

  return {
    total: result?.total || 0,
    pending: result?.pending || 0,
    invited: result?.invited || 0,
    signed_up: result?.signed_up || 0,
    pf_alumni: result?.pf_alumni || 0,
  }
}

// 베타 초대 상태 업데이트
export async function markBetaInvited(env: Bindings, id: number): Promise<void> {
  await env.DB.prepare(
    `UPDATE beta_signups SET status = 'invited', invited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  )
    .bind(id)
    .run()
}

// 베타 가입 완료 표시 (회원가입 후 호출)
export async function markBetaSignedUp(env: Bindings, email: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE beta_signups SET status = 'signed_up', signed_up_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE email = ?`,
  )
    .bind(email.toLowerCase())
    .run()
}
