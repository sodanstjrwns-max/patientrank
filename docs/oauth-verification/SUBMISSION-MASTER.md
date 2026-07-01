# 🚀 Google OAuth 검수 — 마스터 제출 가이드 (v2, Day 4-8 반영)

> **목적:** 이 문서 한 장만 보고 Google Cloud Console에서 OAuth 검수 신청을 완료하기 위한 **복붙용 마스터 가이드**.
> **소요 시간:** 약 70분 (영상 촬영 55분 + 폼 입력 15분)
> **앱:** PatientRank — https://patientrank.pages.dev
> **최종 갱신:** 2026-05-15 (Day 8 LP 배포 직후)

---

## ✅ 사전 점검 (전부 GREEN)

| 항목 | URL / 값 | 상태 |
|---|---|---|
| 홈페이지 | https://patientrank.pages.dev | ✅ 200 |
| 개인정보처리방침 | https://patientrank.pages.dev/privacy | ✅ 200 |
| 이용약관 | https://patientrank.pages.dev/terms | ✅ 200 |
| 가격 정책 | https://patientrank.pages.dev/pricing | ✅ 200 |
| 베타 신청 | https://patientrank.pages.dev/beta | ✅ 200 (Day 3-C) |
| PF 수료생 LP | https://patientrank.pages.dev/pf-alumni | ✅ 200 (Day 8) |
| 결제 페이지 | https://patientrank.pages.dev/checkout | ✅ 302 (인증 보호, Day 3-B) |
| 어드민 베타 | https://patientrank.pages.dev/admin/beta | ✅ 302 (인증 보호, Day 4) |
| 경쟁사 관리 | https://patientrank.pages.dev/dashboard/competitors | ✅ 302 (인증 보호, Day 7) |
| 앱 로고 120x120 | https://patientrank.pages.dev/static/logo-120.png | ✅ 200 |
| 앱 로고 512x512 (백업) | https://patientrank.pages.dev/static/logo-512.png | ✅ 200 |
| APP_URL secret | `https://patientrank.pages.dev` | ✅ 설정됨 |
| Client ID | `248882577385-n9hu8id2v88106ikutpv9mups4s4kh9c.apps.googleusercontent.com` | ✅ |

### 🆕 Day 4-8 추가 기능 (검수 답변에 반영됨)

| 기능 | 설명 | OAuth 답변 영향 |
|---|---|---|
| **Day 5: 카카오 주간 리포트** | Solapi 카카오 알림톡으로 매주 월요일 06:00 KST 자동 발송 | Q2 답변에 "weekly KakaoTalk report" 명시 — 검수자가 데이터 발송 경로를 정확히 알 수 있게 |
| **Day 6: 정기결제 자동 청구** | 매일 06:00 KST 토스페이먼츠 정기 결제, 실패 시 3일 retry → 7일 누적 시 expired | 영상 Scene 11에 "결제 시스템도 별도 secret 격리" 보강 |
| **Day 7: 경쟁사 추적** | 유저당 최대 5개 경쟁사 도메인 등록, 키워드 갭 분석 | Q2 답변에 "competitor gap" 명시 — GSC 데이터를 경쟁 비교에는 사용하지 **않음** 강조 |
| **Day 8: PF 수료생 LP** | 페이션트 퍼널 6,000명 수료 원장 대상 한정 베타 | 영상 Scene 1에 "medical-only target audience" 근거로 활용 |

---

## 📍 STEP 1 — Google Cloud Console → OAuth 동의 화면 입력 (15분)

**URL:** https://console.cloud.google.com/apis/credentials/consent

### 1-A. 앱 정보 (App information)

복붙하세요 ↓

| 필드 | 입력값 |
|---|---|
| **App name** | `PatientRank` |
| **User support email** | `sodanstjrwns@gmail.com` |
| **App logo** | `/home/user/webapp/public/static/logo-120.png` 업로드 |

### 1-B. 앱 도메인 (App domain)

| 필드 | 입력값 |
|---|---|
| **Application home page** | `https://patientrank.pages.dev` |
| **Application privacy policy link** | `https://patientrank.pages.dev/privacy` |
| **Application terms of service link** | `https://patientrank.pages.dev/terms` |

### 1-C. 승인된 도메인 (Authorized domains)

```
patientrank.pages.dev
```

### 1-D. 개발자 연락처

```
sodanstjrwns@gmail.com
```

→ **저장(Save and continue)** 클릭

---

## 📍 STEP 2 — Scope 등록 (5분)

화면: "Scopes" 탭 → **ADD OR REMOVE SCOPES**

다음 4개 체크:

```
openid
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
https://www.googleapis.com/auth/webmasters.readonly   ⭐ Sensitive
```

> ⚠️ `webmasters.readonly`는 Sensitive scope로 분류되어 노란 경고가 뜸 → **정상**

→ **Update** → **Save and continue**

---

## 📍 STEP 3 — Demo 영상 촬영 & 업로드 (55분)

> ⚠️ **상세 촬영 체크리스트는 `VIDEO-RECORDING-CHECKLIST.md` 참조.**
> 이 STEP은 요약만 제공합니다.

| Scene | 시간 | 핵심 | Day |
|---|---|---|---|
| 1. App Intro | 0:00–0:20 | 랜딩 + PF 수료생 LP 짧게 노출 | Day 8 |
| 2. Sign-In | 0:20–0:50 | 기본 scope OAuth (email + profile) | — |
| 3. Run Scan | 0:50–1:20 | URL 입력 → 진단 결과 | — |
| 4. Problem | 1:20–1:50 | "47개밖에 못 잡음" 강조 | — |
| 5. **Consent ⭐** | 1:50–2:30 | **GSC 동의 화면 5초+ 정지** | — |
| 6. Data Display | 2:30–3:10 | GSC 데이터 테이블 (본인 소유 속성만) | — |
| 7. Weekly Report | 3:10–3:40 | 카카오 주간 리포트 미리보기 | Day 5 |
| 8. Competitor | 3:40–4:10 | 경쟁사 추적 페이지 (GSC 데이터 미사용 강조) | Day 7 |
| 9. Limited Use | 4:10–4:30 | 본인만 보임 + Privacy 강조 | — |
| 10. Disconnect | 4:30–4:50 | 연결 해제 시연 | — |
| 11. Closing | 4:50–5:10 | 로고 + 이메일 | — |

### 업로드 설정 (YouTube)

- **Title:** `PatientRank — Google OAuth Verification Demo (webmasters.readonly)`
- **Privacy:** ⚠️ **Unlisted** (Public도 Private도 아닌 일부 공개)
- **Description:** 아래 복붙

```
Demo video for Google OAuth verification.

App: PatientRank (https://patientrank.pages.dev)
Client ID: 248882577385-n9hu8id2v88106ikutpv9mups4s4kh9c.apps.googleusercontent.com
Scope: https://www.googleapis.com/auth/webmasters.readonly
Privacy Policy: https://patientrank.pages.dev/privacy
Terms of Service: https://patientrank.pages.dev/terms

Sections demonstrated:
- 0:00 App intro and target audience (medical clinics)
- 0:20 Standard OAuth sign-in
- 0:50 Free scan demonstration
- 1:50 Sensitive scope consent screen (webmasters.readonly)
- 2:30 GSC data displayed only to the property owner
- 3:10 Weekly KakaoTalk report (output channel)
- 3:40 Competitor tracking (GSC data NOT used for competitors)
- 4:10 Limited Use compliance summary
- 4:30 User-initiated disconnect flow
```

→ 업로드 완료 후 **YouTube 링크 복사**

---

## 📍 STEP 4 — 검수 신청 폼 입력 (15분) ⭐ 핵심

화면: OAuth 동의 화면 → **Prepare for verification** → **Submit for verification**

### 4-A. "How will the scopes be used?" 필드

폼이 영문이므로 영문 답변 그대로 복붙 ↓

**Q1: What does your app do?** (v2 — Day 4-8 반영)
```
PatientRank is a medical-only SEO diagnostic SaaS built for South Korean healthcare clinics (dental, oriental medicine, plastic surgery, etc.). Our target audience is Korean clinic owners — specifically, the 6,000+ alumni of the Patient Funnel program (a clinic management methodology by Dr. Seokjun Moon, CEO of Seoul BD Dental Clinic).

Clinic owners enter their website URL and receive a comprehensive Google Korea search visibility report within 10 seconds — including keyword rankings, organic traffic estimates, backlink profile, competitor gap analysis (against user-supplied competitor domains), and long-tail keyword discovery.

Pro and Agency users can additionally connect their Google Search Console (read-only) to surface keywords missed by third-party SEO databases. The output is delivered weekly via KakaoTalk notification (Solapi gateway) and on-screen dashboard, displayed only to the authenticated owner of that GSC property.
```

**Q2: Why does your app need to request restricted scopes?** (v2 — Day 4-8 반영)
```
We request webmasters.readonly because the core value proposition for our paid users is filling the gap between third-party SEO databases (e.g., DataForSEO) and the actual search exposure recorded by Google itself.

Third-party providers sample only a subset of search queries and miss long-tail queries. For a typical clinic, third-party DBs capture 30–50 keywords, while Search Console shows 2,000–25,000+ keywords with measurable impressions.

To surface these "missed keywords," we call the Search Analytics API (searchanalytics.query) on behalf of the user (with their explicit consent) and:

1. Display the data only to the authenticated owner of that GSC property — never to other users.
2. Send a weekly summary of this user's own data to their own KakaoTalk via Solapi (the user's phone number is collected during signup with explicit opt-in).
3. NEVER use GSC data for the competitor tracking feature — competitor analysis uses ONLY publicly available DataForSEO SERP data, not any user's private GSC data.
4. NEVER share, sell, or expose any user's GSC data to other users or third parties.

We never modify any data — read-only is the minimum scope required for our use case.
```

**Q3: How will the requested scopes improve the user experience?** (v2 — Day 4-8 반영)
```
Without webmasters.readonly, users only see ~50 ranking keywords from third-party data. With Search Console connected, they see their full keyword footprint (up to 25,000 queries), enabling them to:

1. Identify content gaps where they rank on page 2–3 but get impressions (quick-win opportunities).
2. Find long-tail patient queries that third-party DBs never capture (e.g., regional dental procedure queries specific to Korean cities).
3. Track real impression and CTR trends over the last 90 days.
4. Receive proactive weekly KakaoTalk alerts when their key keywords drop in ranking — actionable insights without having to log into the dashboard.

This data is the most accurate possible because it comes directly from Google itself, and it powers a fundamentally different product experience compared to third-party-only SEO tools.
```

### 4-B. Limited Use Compliance 확인란

체크 ✅ — 우리 Privacy Policy `/privacy` Section 4에 명시되어 있음.

> **Section 4 핵심:** GSC 데이터는 (1) 본인에게만 표시, (2) 본인 카카오톡으로만 발송, (3) 경쟁사 분석에 사용 안 함, (4) 광고/판매/타사 공유 금지.

### 4-C. 데모 영상 URL

```
https://youtu.be/__________________
```
(STEP 3에서 복사한 YouTube Unlisted 링크 붙여넣기)

### 4-D. 추가 자료 첨부 (선택)

영문 사유서 PDF로 첨부하면 검수 속도 ↑

`scope-justification.md` 내용을 PDF로 변환하여 첨부:
```bash
# 로컬에서 변환 (선택사항)
pandoc docs/oauth-verification/scope-justification.md -o scope-justification.pdf
```

---

## 📍 STEP 5 — 제출 후 (자동 진행)

1. **즉시:** "Submitted for verification" 상태 표시
2. **1~3 영업일:** Google 검수자 1차 응답 (이메일)
3. **추가 정보 요청 핑퐁:** 보통 1~3회, 각 회차당 3~5 영업일
4. **최종 승인:** 전체 2~6주 (평균 3주)

### 검수 받는 동안에도 정상 사용 가능

검수 진행 중에도 **테스트 사용자**로 등록된 계정은 GSC 연동이 정상 작동합니다.

테스트 사용자 추가:
- https://console.cloud.google.com/apis/credentials/consent → 하단 "Test users" → "+ ADD USERS"
- 추가할 이메일: `sodanstjrwns@gmail.com` + 베타테스터들 (PF 수료생 우선)

---

## 🆘 거절 시 대응 (가장 흔한 TOP 4)

### 거절 사유 #1: "데모 영상에서 sensitive scope 사용이 명확하지 않음"
**대응:**
- Scene 5에서 Google 동의 화면이 **5초 이상** 보여야 함
- 화면에 `webmasters.readonly` 또는 "View Search Console data" 문구가 또렷이 보여야 함
- Scene 6에서 실제 GSC 데이터가 사용자 대시보드에 표시되는 모습이 5초 이상 보여야 함

→ 재촬영 후 새 YouTube 링크로 답장

### 거절 사유 #2: "Privacy Policy에 Limited Use 명시 부족"
**대응:** ✅ 이미 `/privacy` Section 4에 4가지 Limited Use 조항이 명시되어 있음 → 답장으로 해당 섹션 URL 링크 보내면 됨

### 거절 사유 #3: "도메인 소유권 미확인"
**대응:**
1. Google Search Console에서 `patientrank.pages.dev` 속성 추가
2. 소유권 확인 (DNS TXT 또는 HTML 메타태그)
3. 검수 폼에 GSC 속성 확인 완료 스크린샷 첨부

### 거절 사유 #4: "GSC 데이터를 어떻게 사용하는지 불명확 (특히 경쟁사 기능과 헷갈림)" 🆕
**대응:**
- Q2 답변의 **3번 조항** 인용: "NEVER use GSC data for the competitor tracking feature"
- 영상 Scene 8에서 경쟁사 페이지가 보일 때, **"This feature uses public DataForSEO data only — NOT GSC"** 자막 명시
- 코드 증거: `src/lib/competitor-service.ts`는 `gsc_*` 테이블을 SELECT 하지 않음 (이슈 발생 시 GitHub 코드 링크 첨부)

---

## 📁 검수 패키지 파일 위치 (제출 시 참고)

| 자료 | 파일 |
|---|---|
| 영문 사유서 (복붙용) | `docs/oauth-verification/scope-justification.md` |
| 영상 시나리오 (구버전) | `docs/oauth-verification/demo-video-script.md` |
| **🆕 영상 촬영 체크리스트** | `docs/oauth-verification/VIDEO-RECORDING-CHECKLIST.md` |
| 마스터 가이드 (이 파일) | `docs/oauth-verification/SUBMISSION-MASTER.md` |
| 앱 로고 120x120 | `public/static/logo-120.png` |
| 앱 로고 512x512 | `public/static/logo-512.png` |
| Privacy Policy (라이브) | https://patientrank.pages.dev/privacy |
| Terms of Service (라이브) | https://patientrank.pages.dev/terms |

---

## 🎯 제출 직전 최종 체크리스트

복붙 시 누락 방지용 ↓

- [ ] App name = `PatientRank`
- [ ] User support email = `sodanstjrwns@gmail.com`
- [ ] App logo 120x120 PNG 업로드 완료
- [ ] Home URL = `https://patientrank.pages.dev`
- [ ] Privacy URL = `https://patientrank.pages.dev/privacy`
- [ ] Terms URL = `https://patientrank.pages.dev/terms`
- [ ] Authorized domain = `patientrank.pages.dev`
- [ ] Developer contact = `sodanstjrwns@gmail.com`
- [ ] Scope `webmasters.readonly` 추가됨
- [ ] Demo 영상 Unlisted 업로드 완료 (v2 시나리오, Scene 7-8 포함)
- [ ] YouTube URL 복사함
- [ ] **Q1/Q2/Q3 v2 영문 답변 복붙 완료** (Day 4-8 반영본)
- [ ] Limited Use 체크박스 ✅
- [ ] **Submit for verification** 클릭

---

**원장님, 이 문서 + `VIDEO-RECORDING-CHECKLIST.md` 두 장만 켜놓고 STEP 1 → 5 순서대로 따라가시면 검수 제출 완료됩니다.**

질문 생기면 바로 호출해주세요. 🚀
