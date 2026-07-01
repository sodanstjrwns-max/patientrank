// Day 1-F: OpenAI API 클라이언트
// GPT-5.5 우선 사용, 4o 폴백 (personal memory 정책)
// API 키는 D1 settings 테이블에서 조회

import type { Bindings } from './types'

const OPENAI_BASE_URL = 'https://api.openai.com/v1'
const PRIMARY_MODEL = 'gpt-5.5'
const FALLBACK_MODEL = 'gpt-4o'

export async function getOpenAiKey(env: Bindings): Promise<string | null> {
  try {
    const row = await env.DB
      .prepare(`SELECT value FROM settings WHERE key = 'openai_api_key'`)
      .first<{ value: string }>()
    return row?.value || null
  } catch (e) {
    console.error('Failed to get OpenAI key from settings:', e)
    return null
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionResult {
  content: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  cost_usd: number
}

// GPT-5.5 → 4o 자동 폴백
export async function chatCompletion(
  env: Bindings,
  messages: ChatMessage[],
  opts: {
    json?: boolean
    temperature?: number
    max_tokens?: number
  } = {},
): Promise<ChatCompletionResult> {
  const apiKey = await getOpenAiKey(env)
  if (!apiKey) throw new Error('OpenAI API key not configured')

  const tryModel = async (model: string): Promise<ChatCompletionResult> => {
    const body: any = {
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
    }
    if (opts.max_tokens) body.max_tokens = opts.max_tokens
    if (opts.json) body.response_format = { type: 'json_object' }

    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`OpenAI ${model} failed: ${res.status} ${errText.slice(0, 200)}`)
    }

    const data: any = await res.json()
    const usage = data.usage || {}
    const content = data.choices?.[0]?.message?.content || ''

    // 토큰 단가 (mini는 $0.15/M in, $0.60/M out / 4o는 $2.50/M in, $10/M out)
    const isMini = model.includes('mini') || model.includes('5.5')
    const inputRate = isMini ? 0.15 / 1_000_000 : 2.50 / 1_000_000
    const outputRate = isMini ? 0.60 / 1_000_000 : 10.00 / 1_000_000
    const cost = (usage.prompt_tokens || 0) * inputRate + (usage.completion_tokens || 0) * outputRate

    return {
      content,
      model,
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      cost_usd: cost,
    }
  }

  // GPT-5.5 시도 → 실패 시 4o로 폴백
  try {
    return await tryModel(PRIMARY_MODEL)
  } catch (e: any) {
    console.warn(`Primary model ${PRIMARY_MODEL} failed, falling back to ${FALLBACK_MODEL}:`, e.message)
    return await tryModel(FALLBACK_MODEL)
  }
}
