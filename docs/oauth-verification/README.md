# Google OAuth Verification 패키지 (v2 — Day 4-8 반영)

PatientRank의 `webmasters.readonly` (Sensitive scope) 검수 신청용 자료 모음입니다.

> 🆕 **2026-05-15 업데이트:** Day 4-8 기능 (어드민 베타, 카카오 주간 리포트, 정기결제, 경쟁사 추적, PF 수료생 LP) 반영.

---

## 📂 파일 구성 (5종)

| 파일 | 용도 | 우선순위 |
|------|------|---------|
| **`SUBMISSION-MASTER.md`** | ⭐ **이거 하나만 켜놓고 제출 진행** — STEP 1→5 복붙 가이드 | 1순위 |
| **`VIDEO-RECORDING-CHECKLIST.md`** | 🎬 영상 촬영 컷리스트 (Scene 1-11, 80분 작업 가이드) | 2순위 |
| `scope-justification.md` | OAuth Scope 영문 사유서 (Q1/Q2/Q3 답변용 원본) | 참고 |
| `demo-video-script.md` | 영상 시나리오 v1 (구버전) — v2는 VIDEO-RECORDING-CHECKLIST 참조 | 참고 |
| `README.md` | 본 파일 — 검수 진행 가이드 + 전체 인덱스 | 시작점 |

---

## 🎯 검수 진행 5단계 (전체 일정: 2~6주)

### STEP 1. 사전 정비 ✅ (완료)

- [x] **개인정보처리방침** 풀버전 (`/privacy`) — 한/영 이중, GSC Limited Use 명시
- [x] **이용약관** 풀버전 (`/terms`) — 제3장 GSC 연동 별도 명시
- [x] **앱 로고** PNG 120/512 (`/static/logo-120.png`, `/static/logo-512.png`)
- [x] **OAuth Scope 사유서** 영문본 v2 (Day 4-8 반영 → `SUBMISSION-MASTER.md` STEP 4-A)
- [x] **Demo 영상 시나리오** v2 (`VIDEO-RECORDING-CHECKLIST.md`)
- [x] **APP_URL secret** = `https://patientrank.pages.dev` (Cloudflare Pages)
- [x] **Day 4-8 라이브 검증** — `/beta`, `/admin/beta`, `/dashboard/competitors`, `/pf-alumni`, 결제 시스템 전부 OK ✅

### STEP 2. Google Cloud Console — OAuth 동의 화면 입력 (15분)

→ `SUBMISSION-MASTER.md` STEP 1 그대로 따라가기

### STEP 3. Sensitive Scope 등록 (5분)

→ `SUBMISSION-MASTER.md` STEP 2 그대로 따라가기

### STEP 4. Demo 영상 촬영 + YouTube 업로드 (80분) 🆕

→ **`VIDEO-RECORDING-CHECKLIST.md`** 풀버전 사용 (Scene 1-11)

핵심 변경 사항 (v1 대비):
- ⬆️ **5분 영상으로 확장** (기존 3분) — Day 5 카카오 리포트 / Day 7 경쟁사 Scene 추가
- ⬆️ Scene 5 (Consent) **30초 정지** 권장 (기존 5초)
- 🆕 Scene 7: 카카오 주간 리포트 (Output channel 투명성)
- 🆕 Scene 8: 경쟁사 추적 — "GSC 데이터 미사용" 명시 (거절 사유 #4 사전 방어)

### STEP 5. 검수 신청 제출 (15분)

→ `SUBMISSION-MASTER.md` STEP 4 그대로 따라가기 (v2 영문 답변 Q1/Q2/Q3 사용)

---

## 🆕 v2에서 강화된 부분

| 항목 | v1 (구버전) | v2 (현재) |
|---|---|---|
| 영상 길이 | 2:30 ~ 3:30 | **4:30 ~ 5:30** |
| 영상 Scene | 7개 | **11개** |
| Consent 정지 시간 | 5초 | **30초** |
| Q2 답변 길이 | 3문단 | **4문단 (GSC vs 경쟁사 격리 명시)** |
| 거절 대응 | TOP 3 | **TOP 4 (#4: GSC vs 경쟁사 헷갈림)** |
| 사전 점검 URL | 8개 | **13개 (Day 4-8 라이브 추가)** |

---

## 🟢 검수 받는 동안에도 정상 사용 가능

검수 진행 중에도 **테스트 사용자(sodanstjrwns@gmail.com)** 는 GSC 연동 정상 동작합니다.

테스트 사용자 추가:
https://console.cloud.google.com/apis/credentials/consent → 하단 "테스트 사용자" → "+ ADD USERS"

PF 수료생 베타테스터들도 여기에 추가 권장 (검수 통과 전까지 100명 한도).

---

## 📞 검수 거절 시 대처

가장 흔한 거절 사유 TOP 4 (v2):

1. **데모 영상에서 sensitive scope 사용 불명확** → Scene 5 재촬영 (30초 정지 필수)
2. **Privacy Policy Limited Use 명시 부족** → `/privacy` Section 4 URL 답장
3. **도메인 소유권 미확인** → GSC에서 `patientrank.pages.dev` 속성 확인
4. **🆕 GSC vs 경쟁사 기능 헷갈림** → Q2 답변 3번 조항 인용 + Scene 8 자막 재강조

상세 대응은 `SUBMISSION-MASTER.md` 하단 "🆘 거절 시 대응" 섹션 참조.

---

## 🔗 참고 링크

- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)
- [OAuth Verification FAQ](https://support.google.com/cloud/answer/9110914)
- [Sensitive scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Search Console API Docs](https://developers.google.com/webmaster-tools/v1/api_reference_index)
- [Loom (영상 촬영 도구 추천)](https://loom.com)
