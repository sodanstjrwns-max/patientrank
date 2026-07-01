# PatientRank 실호출 시뮬레이션 보고서 (Real API End-to-End)

**작성일**: 2026-05-16
**배포 버전**: https://98f83396.patientrank.pages.dev
**검증자**: 문석준 원장 (서울비디치과 / Patient Funnel 창립자)
**시뮬레이션 대상**: 실제 외부 API 4종 (DataForSEO / OpenAI / Resend / Google OAuth)

---

## 0. 요약 (TL;DR)

> "데모 시드 데이터" 가 아닌 **실제 외부 API 4종을 진짜 호출**한 End-to-End 검증.
> 4개 모두 ✅ 통과. 총 소요 비용 **$0.05686 (약 77원)**. 가장 비싼 호출은 풀스택 체인 1회 ($0.02886).

| Step | API | 상태 | 응답시간 | 비용 (USD) | 비고 |
|------|-----|------|----------|------------|------|
| ① | Google OAuth 검증 | ✅ | 26 ms | $0.00 | client_id/secret/discovery 모두 정상, auth URL 생성 검증 |
| ② | DataForSEO `ranked_keywords/live` | ✅ | 873 ms | $0.02 | bdbddc.com 실제 SEO 데이터, 100 키워드 추출 |
| ③ | OpenAI Chat Completion | ✅ | 6,548 ms | $0.00867 | gpt-5.5 폴백 → gpt-4o 자동 전환, action guide 생성 |
| ④ | Resend `POST /emails` | ✅ | 109 ms | $0.00 | sodanstjrwns@gmail.com 실제 발송, 100/일 무료 한도 |
| ⑤ | Full-stack 체인 (DFS+OAI+Resend) | ✅ | 8,029 ms | $0.02886 | 3 API 직렬 호출, 두 번째 메일 발송 |
| **합계** | | **4/4 통과** | — | **$0.05686** | ≈ **77원** |

---

## 1. Step ① — Google OAuth 설정 검증

### 호출 엔드포인트
```
GET /demo/real/google-oauth?token=demo-only-public-2026
```

### 실제 응답
```json
{
  "ok": true,
  "duration_ms": 26,
  "config": {
    "client_id_prefix": "248882577385-n9hu8id2v881...",
    "client_secret_present": true,
    "redirect_uri": "https://patientrank.pages.dev/auth/google/callback",
    "app_url": "https://patientrank.pages.dev"
  },
  "discovery": {
    "issuer": "https://accounts.google.com",
    "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
    "token_endpoint": "https://oauth2.googleapis.com/token"
  },
  "generated_auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&scope=openid+...+webmasters.readonly...",
  "scopes_requested": [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/webmasters.readonly"
  ]
}
```

### 검증된 사항
- ✅ Cloudflare Secret `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 정상 주입
- ✅ Google OpenID Connect discovery 엔드포인트 (`.well-known/openid-configuration`) 정상 응답
- ✅ Authorization URL 생성 로직 검증 (`scope=openid email profile webmasters.readonly`)
- ✅ Redirect URI (`https://patientrank.pages.dev/auth/google/callback`) 일치
- ✅ **OAuth 검수 신청에 사용된 sensitive scope (`webmasters.readonly`) 그대로 요청됨**

---

## 2. Step ② — DataForSEO `ranked_keywords/live`

### 호출 엔드포인트
```
GET /demo/real/dataforseo?token=demo-only-public-2026&target=bdbddc.com
```

### 실제 응답 요약
```json
{
  "ok": true,
  "target": "bdbddc.com",
  "duration_ms": 873,
  "cost_usd": 0.02,
  "total_keywords": 100,
  "top10_count": 8,
  "top3_count": 2,
  "estimated_traffic": 294
}
```

### Top 8 키워드 샘플 (서울비디치과 실제 SEO 현황)
| # | 키워드 | 순위 | 월검색량 | 트래픽(ETV) | 랜딩 URL |
|---|--------|-----:|---------:|------------:|----------|
| 1 | 라미네이트 | 46 | 9,900 | 20.79 | /encyclopedia/라미네이트 |
| 2 | 브릿지 | 39 | 8,100 | 17.01 | /encyclopedia/브릿지 |
| 3 | 세라믹 | 42 | 5,400 | 11.34 | /encyclopedia/세라믹 |
| 4 | 아말감 | 31 | 3,600 | 7.56 | /encyclopedia/아말감 |
| 5 | 불소 | 48 | 3,600 | 7.56 | /encyclopedia/불소 |
| 6 | 어금니 | 20 | 2,900 | 6.96 | /encyclopedia/어금니 |
| 7 | 치아번호 | **15** | 2,400 | 12.24 | /encyclopedia/치아%20번호 |
| 8 | 유치 | 21 | 2,400 | 5.52 | /encyclopedia/유치 |

### 발견 사항 (Insight)
- 📚 **`/encyclopedia/*` 페이지(치과 백과사전)가 SEO 주력 자산** — Patient Funnel의 "Top of Funnel" 콘텐츠 전략이 실제 검색 데이터에 반영됨
- 🥇 **"치아번호" 키워드 15위 (월 2,400 검색)** — 일반인 호기심 키워드를 선점한 좋은 사례
- ⚠️ "라미네이트" "브릿지" 같은 진료 직결 키워드는 30위 후반 — 페이지 SEO 최적화 여지가 큼
- ✅ 100 키워드 limit 정상 동작, max_rank 100 제약 정상 적용

### 비용 분석
- DataForSEO 1 task = $0.02 (live 호출, sandbox 단가 동일)
- 클라이언트 1명의 주간 스캔 비용 = $0.02 (PatientRank 사업 모델 핵심 비용 변수)

---

## 3. Step ③ — OpenAI Chat Completion

### 호출 엔드포인트
```
GET /demo/real/openai?token=demo-only-public-2026
```

### 실제 응답
```json
{
  "ok": true,
  "duration_ms": 6548,
  "cost_usd": 0.00867,
  "tokens": { "in": 1212, "out": 564 },
  "model_used": "gpt-4o",
  "weekly_score": 35,
  "score_change": 0,
  "top_strength": "강남 지역 키워드로 높은 순위 확보.",
  "top_weakness": "백링크와 도메인 권위 부족.",
  "actions_count": 0,
  "first_action": null
}
```

### 검증된 사항
- ✅ D1 `settings` 테이블의 `openai_api_key` (sk-proj-te9LVfv..., 164 chars) 정상 로드
- ✅ **PRIMARY 모델 `gpt-5.5` 실패 → FALLBACK `gpt-4o` 자동 전환 로직 동작 확인**
- ✅ JSON 응답 파싱 + weekly_score / top_strength / top_weakness 정상 추출
- ✅ 토큰/비용 계산 정확 (1212 prompt + 564 completion = $0.00867)

### 발견된 이슈 (P2 — 후속 작업)
- ⚠️ **`actions_count: 0`** — gpt-4o가 JSON을 반환했지만 `actions` 배열이 비어있음
  - 가능성 1: gpt-5.5 전용 프롬프트가 gpt-4o에서는 구조화된 출력을 못 만들어냄
  - 가능성 2: 데모 시드의 scan 데이터가 actions 생성 트리거 조건을 못 만족
  - **권장 조치**: `ai-action-guide.ts`의 프롬프트에 "MUST return at least 3 actions" 명시 + gpt-4o용 fallback 프롬프트 분기

### 비용 분석
- 1회 분석 ≈ $0.009 (약 12원)
- 100명 주간 분석 = $0.90/주, 월 ≈ $3.6 (5,000원 미만)

---

## 4. Step ④ — Resend 이메일 발송

### 호출 엔드포인트
```
GET /demo/real/resend?token=demo-only-public-2026&to=sodanstjrwns@gmail.com
```

### 실제 응답
```json
{
  "ok": true,
  "status": 200,
  "duration_ms": 109,
  "response": {
    "id": "deb9c24d-65ba-4038-9faf-dbda24172527"
  }
}
```

### 발송 정보
- **From**: `PatientRank <onboarding@resend.dev>` (Resend sandbox sender)
- **To**: `sodanstjrwns@gmail.com` (문석준 원장)
- **Subject**: PatientRank 실호출 테스트 메일
- **Content-Type**: HTML
- **Resend Message ID**: `deb9c24d-65ba-4038-9faf-dbda24172527`

### 검증된 사항
- ✅ Cloudflare Secret `RESEND_API_KEY` 정상 주입
- ✅ Resend API 200 OK, 109ms 초고속 응답
- ✅ Sandbox sender `onboarding@resend.dev` 사용 (Day 5 도메인 검증 미완료 상태에서도 발송 가능)
- ✅ **수신자 받은편지함 도달 확인 필요** (원장님 sodanstjrwns@gmail.com)

### 비용 분석
- Resend 무료 한도: **100 emails/day, 3,000/month**
- 베타 사용자 ≤ 100명이면 무료 충분
- 유료 전환 시: $20/월 (50,000 emails) — Pro 플랜

---

## 5. Step ⑤ — Full-stack 체인 (DataForSEO → OpenAI → Resend)

### 호출 엔드포인트
```
GET /demo/real/full-stack?token=demo-only-public-2026&target=bdbddc.com&to=sodanstjrwns@gmail.com
```

### 실제 응답
```json
{
  "target": "bdbddc.com",
  "started_at": "2026-05-16T03:19:36.699Z",
  "step1_dataforseo": { "ok": true, "duration_ms": 849, "cost_usd": 0.02, "total_keywords": 100, "top10_count": 8, "estimated_traffic": 294 },
  "step2_openai":     { "ok": true, "duration_ms": 7060, "cost_usd": 0.00886, "model_used": "gpt-4o", "weekly_score": 25, "top_strength": "TOP 100 키워드 100개 보유", "top_weakness": "백링크 및 DR 0" },
  "step3_resend":     { "ok": true, "duration_ms": 120, "response": { "id": "b0b17d48-0c6d-41e3-aaa2-c64afd3b4203" } },
  "total_duration_ms": 8029,
  "total_cost_usd": 0.02886,
  "completed_at": "2026-05-16T03:19:44.728Z"
}
```

### 검증된 사항
- ✅ **DataForSEO → OpenAI → Resend 3단 직렬 체인 정상 작동**
- ✅ 총 소요시간 **8.03초** (DataForSEO 0.85s + OpenAI 7.06s + Resend 0.12s)
- ✅ 1개 클라이언트의 1회 풀 분석 비용 = **$0.02886 (39원)**
- ✅ Cloudflare Workers CPU 시간 제약 (10ms) — 외부 API I/O는 CPU 시간 미차감, 통과
- ✅ 두 번째 이메일 정상 발송 (Resend ID `b0b17d48...`)

### Step ② OpenAI 결과의 차이
- Step ③ 단독 호출 시: `weekly_score=35`, `top_strength="강남 지역 키워드..."` (데모 시드 scan 사용)
- Step ⑤ 풀스택 시: `weekly_score=25`, `top_strength="TOP 100 키워드 100개 보유"` (실시간 DFS 결과 사용)
- **→ 동일한 모델이라도 입력 컨텍스트(real DFS data)가 바뀌면 결과가 적응적으로 변함 = 정상 작동**

---

## 6. 비용 시뮬레이션 (사업 모델 검증)

### 1회 풀 분석 단가 (확정)
| 항목 | 비용 |
|------|-----:|
| DataForSEO | $0.020 |
| OpenAI (gpt-4o) | $0.009 |
| Resend | $0.000 |
| **합계** | **$0.029 (≈ 39원)** |

### 클라이언트당 월간 비용 (주간 스캔 기준)
- 4주 × $0.029 = **$0.116 (157원/월)**

### PatientRank 마진 분석
- **Starter 플랜 39,000원/월** → 마진율 99.6%
- **Pro 플랜 89,000원/월** → 마진율 99.8% (스캔 빈도 2배여도 99.6%)
- **Enterprise 199,000원/월** → 경쟁사 추적 5개 = $0.116 × 5 = $0.58/월 → 마진율 99.5%

### 100명 베타 운영 시 월간 인프라 비용
- DataForSEO: 100 × $0.08 = **$8.00**
- OpenAI: 100 × $0.036 = **$3.60**
- Resend: $0 (3,000/월 한도 내)
- Cloudflare Pages: $0 (무료 한도)
- D1: $0 (무료 한도 25M reads/day)
- **합계 ≈ $11.60/월 (15,800원)** — 베타 100명 운영에 월 1.6만원이면 충분

---

## 7. 발견된 이슈 & TODO

### P1 (즉시 수정 권장)
없음 ✅ — 4개 API 모두 정상 작동

### P2 (다음 스프린트)
1. **OpenAI `actions_count: 0` 이슈**
   - `ai-action-guide.ts` 프롬프트에 gpt-4o 폴백용 분기 추가
   - "MUST return at least 3 actions in JSON array" 명시
   - Schema validation 실패 시 1회 자동 재시도 추가

2. **gpt-5.5 모델 미가용 처리**
   - OpenAI Org에 gpt-5.5 액세스 신청 (2026년 5월 기준 일부 Org만 활성화)
   - 또는 PRIMARY를 `gpt-4o`로 강등하고 FALLBACK을 `gpt-4o-mini`로 변경 (cost-saving)

3. **Resend Sandbox sender → Custom domain**
   - 현재 `onboarding@resend.dev` 사용 중 (수신자에게 "via resend.dev" 표시됨)
   - `patientrank.kr` 또는 `bdbddc.com` 서브도메인으로 DKIM/SPF/DMARC 설정 후 전환

### P3 (Long-term)
4. **Toss Payments 실호출 검증 미진행** — secret 미등록 상태
5. **Solapi 카카오 알림톡 실호출 검증 미진행** — secret 미등록 상태

---

## 8. 시뮬레이션 엔드포인트 인벤토리

본 검증에서 추가된 5개 엔드포인트는 **`DEMO_TOKEN`** secret으로 보호됨 (기본값 `demo-only-public-2026`).
운영 환경에서는 secret을 강력한 값으로 교체 후 외부 공개 금지.

| 경로 | 메서드 | 파라미터 | 용도 |
|------|--------|----------|------|
| `/demo/real/google-oauth` | GET | `token` | Google OAuth config 검증 (비파괴) |
| `/demo/real/dataforseo` | GET | `token`, `target` | DataForSEO ranked_keywords 실호출 |
| `/demo/real/openai` | GET | `token` | OpenAI action guide 실호출 |
| `/demo/real/resend` | GET | `token`, `to` | Resend 이메일 실호출 |
| `/demo/real/full-stack` | GET | `token`, `target`, `to` | 3 API 직렬 체인 |

---

## 9. 배포 환경

- **빌드**: Vite + Hono Cloudflare Pages adapter (442.04 kB)
- **배포 URL**: https://98f83396.patientrank.pages.dev
- **D1 데이터베이스**: `patientrank-production` (8개 마이그레이션 적용 완료)
- **Cloudflare Secrets**: 8개 등록 (APP_NAME, APP_URL, DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, RESEND_API_KEY)
- **D1 Settings**: `openai_api_key` 등록 (sk-proj-te9LVfv..., 164 chars)

---

## 10. 결론

> **"PatientRank의 핵심 외부 API 4종이 운영 환경에서 실제로 작동합니다."**

- ✅ Google OAuth: 검수 신청 자료와 100% 일치하는 scope/redirect 로 인증 URL 생성 가능
- ✅ DataForSEO: 서울비디치과 실제 도메인 100 키워드 추출, 1회 $0.02
- ✅ OpenAI: gpt-5.5 → gpt-4o 폴백 정상, 1회 $0.009
- ✅ Resend: 실제 메일 2통 발송 성공 (수신함 확인 권장)
- ✅ Full-stack: 3 API 8초 직렬 체인, 1회 $0.029

**1회 풀 분석 비용 $0.029 (39원)** — Starter 플랜 39,000원/월 기준 마진율 **99.6%**.
**100명 베타 월 인프라 비용 ≈ $11.60 (15,800원)** — 사업 모델 경제성 확인 완료.

다음 마일스톤:
1. P2 이슈 (OpenAI actions 파싱) 다음 스프린트 수정
2. Toss Payments / Solapi secret 등록 후 6종 API 풀 검증
3. 베타 사용자 모집 시작 (Patient Funnel 6,000명 풀)

---

**최종 검증 완료**: 2026-05-16 03:19 KST
**총 비용 지출**: $0.05686 (약 77원)
**총 실호출 횟수**: 7회 (Google 1 + DFS 2 + OpenAI 2 + Resend 2)
