// ===================================================================
// 카카오 알림톡 발송 라이브러리
// - 솔라피(Solapi) API 사용 (가장 보편적인 한국 알림톡 게이트웨이)
// - 템플릿: WEEKLY_REPORT, COMPETITOR_ALERT, BETA_INVITE, PAYMENT_SUCCESS, PAYMENT_FAILED
//
// 환경 변수:
//   KAKAO_API_KEY = Solapi API Key
//   KAKAO_API_SECRET = Solapi API Secret
//   KAKAO_PFID = 발신 프로필 ID (카카오 비즈니스 채널)
//   KAKAO_TEMPLATE_ID_WEEKLY = 주간 리포트 템플릿 ID
//   KAKAO_TEMPLATE_ID_COMPETITOR = 경쟁사 변화 템플릿 ID
//   KAKAO_TEMPLATE_ID_BETA = 베타 초대 템플릿 ID
//   KAKAO_TEMPLATE_ID_PAYMENT_OK = 결제 성공 템플릿 ID
//   KAKAO_TEMPLATE_ID_PAYMENT_FAIL = 결제 실패 템플릿 ID
//
// Docs: https://docs.solapi.com/api-reference/messages/send
// ===================================================================

import type { Bindings } from './types'

const SOLAPI_BASE = 'https://api.solapi.com'

// HMAC-SHA256 서명 생성 (Solapi 인증)
async function generateAuthHeader(apiKey: string, apiSecret: string): Promise<string> {
  const date = new Date().toISOString()
  const salt = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const data = date + salt

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${sigHex}`
}

// 알림톡 발송 (Solapi)
export interface KakaoSendRequest {
  to: string // 수신자 전화번호 (010-1234-5678 또는 01012345678)
  templateId: string
  variables: Record<string, string>
  pfId: string // 발신 프로필 ID
}

export interface KakaoSendResult {
  success: boolean
  messageId?: string
  errorCode?: string
  errorMessage?: string
}

export async function sendKakaoMessage(
  env: Bindings,
  req: KakaoSendRequest,
): Promise<KakaoSendResult> {
  const apiKey = (env as any).KAKAO_API_KEY
  const apiSecret = (env as any).KAKAO_API_SECRET

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      errorCode: 'MISSING_SECRETS',
      errorMessage: 'KAKAO_API_KEY 또는 KAKAO_API_SECRET 미설정',
    }
  }

  const auth = await generateAuthHeader(apiKey, apiSecret)
  const payload = {
    message: {
      to: req.to.replace(/-/g, ''),
      kakaoOptions: {
        pfId: req.pfId,
        templateId: req.templateId,
        variables: req.variables,
      },
    },
  }

  try {
    const res = await fetch(`${SOLAPI_BASE}/messages/v4/send`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data: any = await res.json()
    if (!res.ok || data.errorCode) {
      return {
        success: false,
        errorCode: data.errorCode || `HTTP_${res.status}`,
        errorMessage: data.errorMessage || data.message || 'Unknown error',
      }
    }
    return {
      success: true,
      messageId: data.messageId || data.groupId,
    }
  } catch (err: any) {
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
      errorMessage: err.message,
    }
  }
}

// 알림톡 로그 저장
export async function logKakaoMessage(
  env: Bindings,
  userId: number | null,
  phone: string,
  templateCode: string,
  title: string,
  body: string,
  buttonUrl: string | null,
  result: KakaoSendResult,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO kakao_logs
      (user_id, phone, template_code, message_title, message_body, button_url,
       status, kakao_message_id, failure_reason, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      userId,
      phone,
      templateCode,
      title,
      body,
      buttonUrl,
      result.success ? 'sent' : 'failed',
      result.messageId || null,
      result.errorMessage || null,
      result.success ? new Date().toISOString() : null,
    )
    .run()
}

// ─────────────────────────────────────────────────────────────────
// 템플릿별 발송 헬퍼
// ─────────────────────────────────────────────────────────────────

// 1. 주간 리포트
export async function sendWeeklyReport(
  env: Bindings,
  userId: number,
  phone: string,
  variables: {
    name: string
    domain: string
    score_change: string // "+5점" 또는 "-3점"
    top10_change: string // "TOP10 +2개"
    result_url: string
  },
): Promise<KakaoSendResult> {
  const templateId = (env as any).KAKAO_TEMPLATE_ID_WEEKLY
  const pfId = (env as any).KAKAO_PFID
  if (!templateId || !pfId) {
    return { success: false, errorCode: 'MISSING_TEMPLATE', errorMessage: 'WEEKLY 템플릿 미설정' }
  }

  const result = await sendKakaoMessage(env, {
    to: phone,
    templateId,
    pfId,
    variables: {
      '#{name}': variables.name,
      '#{domain}': variables.domain,
      '#{score_change}': variables.score_change,
      '#{top10_change}': variables.top10_change,
    },
  })

  const body = `[${variables.name}님] ${variables.domain}\n이번 주: ${variables.score_change}, ${variables.top10_change}`
  await logKakaoMessage(env, userId, phone, 'WEEKLY_REPORT', '주간 리포트', body, variables.result_url, result)
  return result
}

// 2. 경쟁사 변화 알림
export async function sendCompetitorAlert(
  env: Bindings,
  userId: number,
  phone: string,
  variables: {
    name: string
    competitor: string
    change: string // "신규 키워드 12개 진입"
    result_url: string
  },
): Promise<KakaoSendResult> {
  const templateId = (env as any).KAKAO_TEMPLATE_ID_COMPETITOR
  const pfId = (env as any).KAKAO_PFID
  if (!templateId || !pfId) {
    return { success: false, errorCode: 'MISSING_TEMPLATE', errorMessage: 'COMPETITOR 템플릿 미설정' }
  }

  const result = await sendKakaoMessage(env, {
    to: phone,
    templateId,
    pfId,
    variables: {
      '#{name}': variables.name,
      '#{competitor}': variables.competitor,
      '#{change}': variables.change,
    },
  })

  const body = `[${variables.name}님] 경쟁사 ${variables.competitor}: ${variables.change}`
  await logKakaoMessage(env, userId, phone, 'COMPETITOR_ALERT', '경쟁사 알림', body, variables.result_url, result)
  return result
}

// 3. 베타 초대장
export async function sendBetaInvite(
  env: Bindings,
  phone: string,
  variables: {
    name: string
    invite_url: string
    coupon_code: string
  },
): Promise<KakaoSendResult> {
  const templateId = (env as any).KAKAO_TEMPLATE_ID_BETA
  const pfId = (env as any).KAKAO_PFID
  if (!templateId || !pfId) {
    return { success: false, errorCode: 'MISSING_TEMPLATE', errorMessage: 'BETA 템플릿 미설정' }
  }

  const result = await sendKakaoMessage(env, {
    to: phone,
    templateId,
    pfId,
    variables: {
      '#{name}': variables.name,
      '#{coupon_code}': variables.coupon_code,
    },
  })

  const body = `[${variables.name}님] PatientRank 베타에 초대드립니다. 쿠폰: ${variables.coupon_code}`
  await logKakaoMessage(env, null, phone, 'BETA_INVITE', '베타 초대', body, variables.invite_url, result)
  return result
}

// 4. 결제 성공 알림
export async function sendPaymentSuccess(
  env: Bindings,
  userId: number,
  phone: string,
  variables: {
    name: string
    plan: string
    amount: string // "149,000원"
    next_billing: string // "2026-06-15"
    receipt_url?: string
  },
): Promise<KakaoSendResult> {
  const templateId = (env as any).KAKAO_TEMPLATE_ID_PAYMENT_OK
  const pfId = (env as any).KAKAO_PFID
  if (!templateId || !pfId) {
    // 템플릿 미설정 시도 DB 로그는 남김
    await logKakaoMessage(env, userId, phone, 'PAYMENT_SUCCESS', '결제 완료',
      `[${variables.name}님] ${variables.plan} 결제 ${variables.amount} 완료`,
      variables.receipt_url || null,
      { success: false, errorCode: 'MISSING_TEMPLATE', errorMessage: '템플릿 미설정 (로그만 기록)' })
    return { success: false, errorCode: 'MISSING_TEMPLATE', errorMessage: '템플릿 미설정' }
  }

  const result = await sendKakaoMessage(env, {
    to: phone,
    templateId,
    pfId,
    variables: {
      '#{name}': variables.name,
      '#{plan}': variables.plan,
      '#{amount}': variables.amount,
      '#{next_billing}': variables.next_billing,
    },
  })

  await logKakaoMessage(env, userId, phone, 'PAYMENT_SUCCESS', '결제 완료',
    `[${variables.name}님] ${variables.plan} 결제 ${variables.amount} 완료`,
    variables.receipt_url || null, result)
  return result
}
