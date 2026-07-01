# 🎬 PatientRank OAuth 검수 영상 촬영 체크리스트

> **목적:** 한 번에 OK 받는 5분짜리 Google OAuth Verification 데모 영상을 찍기 위한 **완벽한 사전 준비 + 촬영 컷리스트**.
> **예상 소요:** 사전 준비 25분 + 촬영 25분 + 편집/업로드 30분 = **총 80분**
> **출력:** YouTube Unlisted 5분 영상 1개 (Google 검수자가 봄)
> **버전:** v2 (Day 4-8 반영 — 카카오 리포트, 경쟁사 추적 Scene 추가)

---

## 📌 왜 이 체크리스트가 필요한가?

**Google OAuth 검수 거절 사유 #1 = "영상에서 sensitive scope 사용이 명확하지 않음"** (전체 거절의 약 60%)

이 체크리스트를 그대로 따라 찍으면:
- ✅ Consent 화면이 5초 이상 명확히 보임
- ✅ 실제 GSC 데이터가 본인 대시보드에 표시됨
- ✅ 경쟁사 기능과 GSC 데이터의 격리가 시각적으로 드러남
- ✅ Limited Use 4개 조항이 음성/자막으로 강조됨

---

## 🛠️ STEP 0 — 촬영 도구 준비 (5분)

### 권장 도구 (택1)

| 도구 | 가격 | 장점 | 추천도 |
|---|---|---|---|
| **Loom** (https://loom.com) | 무료 (5분 한도) | 브라우저 확장만으로 끝, 자동 YouTube 업로드 | ⭐⭐⭐⭐⭐ |
| **OBS Studio** | 완전 무료 | 화질 최고, 편집 자유로움 | ⭐⭐⭐⭐ |
| **macOS QuickTime** | 무료 (Mac) | 사전 설치, 간단 | ⭐⭐⭐ |
| **Windows 게임바** (Win+G) | 무료 (Win) | 사전 설치 | ⭐⭐ |

> **이번엔 Loom 추천.** 5분 한도 = 우리 영상 길이와 정확히 일치, YouTube 업로드도 한 번에.

### 설정 체크리스트

- [ ] **해상도:** 1920×1080 (Full HD) 이상
- [ ] **프레임:** 30fps 이상
- [ ] **마이크:** 노트북 내장 OK (음질보다 음성 명확성이 중요)
- [ ] **마우스 커서 강조:** Loom은 기본 ON, OBS는 "Highlight Mouse" 플러그인
- [ ] **알림 차단:** macOS `Do Not Disturb` / Windows `집중 지원` ON
- [ ] **브라우저:** 새 시크릿/프라이빗 창에서 진행 (즐겨찾기/광고 노출 방지)
- [ ] **줌 레벨:** Cmd/Ctrl + 0 (기본 100%) — 검수자가 작은 글씨도 볼 수 있어야 함

---

## 🧪 STEP 1 — 촬영 전 테스트 계정 준비 (10분)

### 1-A. GSC 속성이 등록된 테스트 계정 확인

**필수 조건:** 촬영에 쓰는 Google 계정이 **최소 1개의 GSC 속성**을 소유해야 합니다.

- [ ] https://search.google.com/search-console 접속
- [ ] 속성 목록에 본인 도메인 (예: `bdbddc.com`) 표시 확인
- [ ] 클릭 → "Performance" 메뉴에 데이터 표시 확인 (지난 28일 impressions > 0)

> ⚠️ 데이터가 비어있으면 검수자가 "이 앱이 진짜 GSC 데이터를 처리하나?" 의심함 → 데이터 있는 속성 사용

### 1-B. PatientRank 테스트 계정 준비

- [ ] **Google Cloud Console → OAuth 동의 화면 → Test users**에 본인 이메일 추가됨 확인
- [ ] https://patientrank.pages.dev 로그인 정상
- [ ] 무료 진단 1회 완료해 두기 (Scene 3에서 빠르게 결과 보여주려고)
- [ ] (옵션) 경쟁사 1개 미리 등록 (`/dashboard/competitors`) — Scene 8용

### 1-C. 환경 변수 점검

```bash
cd /home/user/webapp
npx wrangler pages secret list --project-name patientrank | grep -E "GOOGLE|APP_URL"
```

- [ ] `GOOGLE_CLIENT_ID` 설정됨
- [ ] `GOOGLE_CLIENT_SECRET` 설정됨
- [ ] `APP_URL` = `https://patientrank.pages.dev`

### 1-D. 자막용 텍스트 미리 복사 (메모장에 붙여놓기)

영상 편집 중 자막 작업이 빠르도록 사전 복사 ↓

```
[Scene 1] PatientRank — Medical-only SEO diagnostic SaaS for Korean clinics
[Scene 2] Standard sign-in: email + profile only (no sensitive scope yet)
[Scene 3] Free scan: ~47 keywords from DataForSEO (third-party data)
[Scene 4] Problem: Real GSC shows 2,000–25,000+ keywords — huge gap
[Scene 5] ⭐ User clicks "Connect Search Console" → requests webmasters.readonly
[Scene 6] GSC data displayed only to property owner (read-only)
[Scene 7] Weekly KakaoTalk report — user's own data sent to user's own phone
[Scene 8] Competitor tracking uses PUBLIC DataForSEO data — NOT GSC data
[Scene 9] Limited Use: data isolated per user, never shared, no ads, no resale
[Scene 10] User can disconnect anytime — Google permissions page link visible
[Scene 11] hello@patientrank.kr · https://patientrank.pages.dev
```

---

## 🎬 STEP 2 — 컷별 촬영 가이드 (5분 영상)

### 🚦 촬영 일반 원칙

1. **각 Scene 시작/끝에 1초씩 여유** (편집 시 잘라내기 좋음)
2. **마우스 천천히 움직이기** — 검수자가 시각적으로 따라올 수 있어야 함
3. **클릭 후 페이지 로드 끝까지 기다리기** — 중간에 끊지 말 것
4. **소리 내서 읽기** — 자막 + 나레이션 같이 가는 것이 안전 (TTS 후처리 옵션도)

---

### **Scene 1 — App Intro (0:00–0:20)**

🎯 **목적:** 우리가 의료 카테고리 전용 SaaS임을 즉시 보여줌

**컷 리스트:**
- [ ] 0:00–0:05 — 새 탭에서 `https://patientrank.pages.dev` 입력하는 모습 (URL 바 또렷이)
- [ ] 0:05–0:12 — 랜딩 페이지 hero 섹션 보여줌 (스크롤 X, 정지)
- [ ] 0:12–0:20 — 천천히 아래로 스크롤하면서 "의료 카테고리 전용" 문구 등 강조

**🗣️ 나레이션 (영문, 천천히):**
> "PatientRank is a Google SEO diagnostic SaaS built exclusively for South Korean medical clinics. Our target users are clinic owners, including the 6,000-plus alumni of the Patient Funnel program."

**✅ 검수자가 보는 것:**
- 명확한 URL: `patientrank.pages.dev`
- "의료 카테고리 전용" 메시지
- 한국 시장 타겟임이 한눈에 보임

---

### **Scene 2 — Standard Sign-In (0:20–0:50)**

🎯 **목적:** 처음엔 sensitive scope를 요청하지 않음을 보여줌 (점진적 동의 패턴)

**컷 리스트:**
- [ ] 0:20–0:25 — "로그인" 버튼 클릭
- [ ] 0:25–0:35 — Google OAuth 화면 (계정 선택)
- [ ] 0:35–0:45 — ⭐ **Consent 화면 정지** → `email`, `profile`만 요청되는 것 보여줌 (스크린샷 같은 5초 정지)
- [ ] 0:45–0:50 — "허용" 클릭 후 대시보드 이동

**🗣️ 나레이션:**
> "At first sign-in, we only request standard OpenID scopes — email and profile. No sensitive scope is requested at this stage."

**⚠️ 주의:**
- Consent 화면에서 **"View your data in Google Search Console" 문구가 보이면 안 됨** (Scene 5와 헷갈림)
- 처음 보는 사용자라면 이 단계에서 처음 OAuth가 뜨도록 시크릿 창 사용

---

### **Scene 3 — Run Free Scan (0:50–1:20)**

🎯 **목적:** GSC 없이도 기본 진단이 동작한다는 것을 보여줌 (대안 솔루션의 존재 강조)

**컷 리스트:**
- [ ] 0:50–0:55 — 메인의 URL 입력창에 `bdbddc.com` (또는 본인 도메인) 입력
- [ ] 0:55–1:00 — "진단 시작" 클릭
- [ ] 1:00–1:15 — 로딩 후 결과 페이지 표시 (키워드 약 47개)
- [ ] 1:15–1:20 — 키워드 테이블 위로 마우스 호버

**🗣️ 나레이션:**
> "Without connecting Search Console, the user gets about 47 keywords from third-party data."

---

### **Scene 4 — The Problem (1:20–1:50)**

🎯 **목적:** 왜 sensitive scope가 필요한지 시각적으로 정당화

**컷 리스트:**
- [ ] 1:20–1:30 — 결과 페이지의 "더 많은 키워드 발견" 또는 GSC 연동 유도 카드 보여줌
- [ ] 1:30–1:45 — 자막으로 "Third-party: 47 keywords | Real GSC: 2,000–25,000 keywords" 표시
- [ ] 1:45–1:50 — "Connect Search Console" 버튼에 마우스 호버

**🗣️ 나레이션:**
> "But the actual Search Console shows two thousand to twenty-five thousand keywords for a typical clinic. To close this gap, we need read-only access to the user's Search Console."

---

### **Scene 5 — ⭐ Consent for Sensitive Scope (1:50–2:30) [가장 중요]**

🎯 **목적:** 검수자가 가장 집중해서 보는 컷. 5초 이상 정지 필수.

**컷 리스트:**
- [ ] 1:50–1:55 — "Connect Search Console" 버튼 클릭
- [ ] 1:55–2:25 — ⭐ **Google OAuth Consent 화면 30초 정지** ⭐
  - 반드시 다음 텍스트가 화면에 또렷이 보여야 함:
    - **"PatientRank wants additional access to your Google Account"**
    - **"View Search Console data for your verified sites"** (또는 `https://www.googleapis.com/auth/webmasters.readonly`)
  - 마우스로 해당 텍스트를 손가락처럼 가리키기 (3초 호버)
- [ ] 2:25–2:30 — "허용" 클릭

**🗣️ 나레이션 (천천히, 또박또박):**
> "The user explicitly clicks 'Connect Search Console'. Google shows the consent screen requesting the **webmasters dot readonly** scope. This is a read-only scope — we cannot modify any Search Console data. The user must click Allow to proceed."

**🚨 절대 실패하면 안 되는 체크리스트:**
- [ ] Consent 화면이 **최소 5초 이상** 정지 (권장 15-30초)
- [ ] **"webmasters.readonly"** 또는 **"View Search Console data"** 문구가 보임
- [ ] 화면이 흐릿하지 않음 (1080p 이상)
- [ ] 클릭 전 화면에 손가락처럼 마우스로 강조

> ⚠️ 이 Scene만 실패해도 **무조건 거절**입니다. 첫 시도가 자신 없으면 다시 찍으세요.

---

### **Scene 6 — GSC Data Displayed (2:30–3:10)**

🎯 **목적:** 받아온 데이터가 **본인 대시보드에만 표시**됨을 증명

**컷 리스트:**
- [ ] 2:30–2:35 — Consent 후 대시보드로 자동 리다이렉트
- [ ] 2:35–2:55 — 새로 나타난 GSC 키워드 테이블 보여줌 (2,000+개 표시, 임프레션/CTR 포함)
- [ ] 2:55–3:05 — 화면 우측 상단에 본인 계정 이메일 강조 (자막: "Data shown only to: sodanstjrwns@gmail.com")
- [ ] 3:05–3:10 — 키워드 1-2개에 호버하면서 "본인 GSC 속성: bdbddc.com" 표시 확인

**🗣️ 나레이션:**
> "After consent, the user's GSC data appears in their own dashboard. This data is visible only to the authenticated owner of this Search Console property — never to other PatientRank users."

---

### **Scene 7 — Weekly KakaoTalk Report (3:10–3:40)** 🆕 Day 5

🎯 **목적:** 데이터 사용 채널을 모두 공개 — 본인 카카오톡으로만 전송

**컷 리스트:**
- [ ] 3:10–3:15 — `/dashboard` 의 "주간 리포트 설정" 섹션으로 스크롤
- [ ] 3:15–3:25 — 카카오톡 알림톡 미리보기 카드 보여줌 (본인 데이터만 발송됨을 강조)
- [ ] 3:25–3:40 — 자막: "User's own data → User's own KakaoTalk only. Never to other users."

**🗣️ 나레이션:**
> "Every Monday at 6 AM Korea time, the user receives a summary of their own data on their own KakaoTalk — never shared with anyone else."

---

### **Scene 8 — Competitor Tracking (3:40–4:10)** 🆕 Day 7

🎯 **목적:** **검수자가 가장 혼동할 수 있는 부분** — 경쟁사 기능은 GSC 데이터를 쓰지 않음

**컷 리스트:**
- [ ] 3:40–3:45 — `/dashboard/competitors` 페이지로 이동
- [ ] 3:45–4:00 — 등록된 경쟁사 1개와 비교 카드 보여줌
- [ ] 4:00–4:10 — ⭐ **자막 5초 정지: "Competitor data source: Public DataForSEO SERP only. GSC data is NEVER used here."**

**🗣️ 나레이션 (강조):**
> "Important: Competitor analysis uses only public DataForSEO SERP data — never any user's private GSC data. GSC data and competitor data are completely isolated."

> 💡 이 Scene이 거절 사유 #4 ("GSC vs 경쟁사 헷갈림") 사전 방어용입니다.

---

### **Scene 9 — Limited Use Compliance (4:10–4:30)**

🎯 **목적:** Privacy Policy Section 4 명시적으로 보여줌

**컷 리스트:**
- [ ] 4:10–4:15 — 새 탭에서 `https://patientrank.pages.dev/privacy` 열기
- [ ] 4:15–4:25 — "Section 4: Limited Use of Google User Data" 까지 스크롤 + 4개 조항 호버
- [ ] 4:25–4:30 — URL 바에 `/privacy` 또렷이 보이게 끝

**🗣️ 나레이션:**
> "Our Privacy Policy Section four explicitly lists four Limited Use commitments: data is shown only to the owner, never sold, never used for ads, and never shared with third parties."

---

### **Scene 10 — Disconnect Flow (4:30–4:50)**

🎯 **목적:** 사용자가 언제든 권한 회수 가능함을 보여줌

**컷 리스트:**
- [ ] 4:30–4:35 — `/dashboard` 또는 `/settings`에서 "GSC 연결 해제" 버튼 클릭
- [ ] 4:35–4:42 — 확인 모달 → 확인 클릭
- [ ] 4:42–4:50 — 자막: "Or revoke at: https://myaccount.google.com/permissions" + 해당 URL 새 탭에서 보여주기 (옵션)

**🗣️ 나레이션:**
> "The user can disconnect anytime from within PatientRank, or revoke permissions globally from their Google Account settings."

---

### **Scene 11 — Closing (4:50–5:10)**

🎯 **목적:** 검수자가 추가 문의할 채널 명시

**컷 리스트:**
- [ ] 4:50–4:55 — 랜딩 페이지 footer로 이동
- [ ] 4:55–5:05 — 자막 화면: `PatientRank · hello@patientrank.kr · https://patientrank.pages.dev`
- [ ] 5:05–5:10 — 로고 정지 + 페이드 아웃

**🗣️ 나레이션:**
> "Thank you for reviewing PatientRank. Contact: hello@patientrank.kr"

---

## 🎞️ STEP 3 — 편집 가이드 (15분)

### 필수 후처리

- [ ] **Scene 5 (Consent)** 길이 5초 이상 확인 — 짧으면 잘라내지 말고 정지 프레임 추가로 늘리기
- [ ] **Scene 8 (Competitor)** 자막 "Public DataForSEO only — NOT GSC" 5초 이상 표시
- [ ] 자막 폰트 크기 **24pt 이상** (검수자가 모바일로 볼 수도 있음)
- [ ] 전체 길이 **5분 ± 30초** 권장 (10분 초과 시 검수자가 안 끝까지 봄)
- [ ] 음악 BGM **금지** — 나레이션 명확성 우선
- [ ] 끝에 1초 검은 화면 추가 (자연스러운 종료감)

### Loom 사용 시

- [ ] 녹화 종료 후 자동 생성된 영상 → 우측 상단 "Edit Video" → trim 사용
- [ ] "Add captions" (자동 자막) 활성화 후 영문 자막 수정
- [ ] "Speed up silences" OFF (검수자가 정상 속도로 봐야 함)

---

## 📤 STEP 4 — YouTube 업로드 (10분)

### Loom에서 YouTube로 보내기

1. Loom 영상 페이지 → "..." → "Download" (MP4)
2. https://studio.youtube.com → "Create" → "Upload videos"
3. 다음 정보 입력:

| 필드 | 입력값 |
|---|---|
| **Title** | `PatientRank — Google OAuth Verification Demo (webmasters.readonly)` |
| **Description** | 아래 박스 복붙 |
| **Visibility** | ⚠️ **Unlisted** (Public도 Private도 아닌 일부 공개) |
| **Audience** | "No, it's not made for kids" |
| **Category** | "Science & Technology" |
| **Language** | "English" |

**Description 박스:**
```
Demo video for Google OAuth verification.

App: PatientRank (https://patientrank.pages.dev)
Client ID: 248882577385-n9hu8id2v88106ikutpv9mups4s4kh9c.apps.googleusercontent.com
Scope: https://www.googleapis.com/auth/webmasters.readonly
Privacy Policy: https://patientrank.pages.dev/privacy
Terms of Service: https://patientrank.pages.dev/terms

Sections demonstrated:
- 0:00 App intro and target audience (medical clinics)
- 0:20 Standard OAuth sign-in (no sensitive scope yet)
- 0:50 Free scan demonstration (DataForSEO third-party data)
- 1:20 The problem — third-party data misses 95%+ of real keywords
- 1:50 Sensitive scope consent screen (webmasters.readonly) ⭐
- 2:30 GSC data displayed only to property owner
- 3:10 Weekly KakaoTalk report (output channel)
- 3:40 Competitor tracking (GSC data NOT used for competitors)
- 4:10 Limited Use compliance summary
- 4:30 User-initiated disconnect flow
- 4:50 Contact information
```

4. 업로드 완료 → **YouTube URL 복사** → `SUBMISSION-MASTER.md` STEP 4-C에 붙여넣기

---

## ✅ STEP 5 — 제출 전 최종 점검 (5분)

영상 업로드 후 **YouTube에서 시크릿 창으로 재생**하면서 체크 ↓

### 🚦 절대 통과 체크리스트

- [ ] 시크릿 창에서 영상이 재생됨 (Unlisted 링크 정상 동작)
- [ ] Scene 5 Consent 화면이 **5초 이상** 또렷이 보임
- [ ] Scene 5에 `webmasters.readonly` 또는 `View Search Console data` 텍스트 보임
- [ ] Scene 6에 실제 GSC 키워드 데이터가 보임 (2,000+개)
- [ ] Scene 7에 카카오 리포트 미리보기 보임
- [ ] Scene 8에 "Public DataForSEO only — NOT GSC" 자막 5초 이상 보임
- [ ] Scene 9에 `/privacy` URL이 또렷이 보임
- [ ] 영상 전체 길이 4분 30초 ~ 5분 30초 사이
- [ ] 음성/자막에 영문 사용 (한글 OK 단, **영문 자막 필수**)
- [ ] 영상 화질 720p 이상

### 🚦 거절 위험 신호 (있으면 재촬영)

- ⛔ Consent 화면이 1-2초만 지나감
- ⛔ 화면 글씨가 흐려서 검수자가 텍스트 못 읽음
- ⛔ 본인 이메일/도메인 노출 없음 (가짜 계정으로 의심)
- ⛔ GSC 데이터 화면 없음 (Mock-up처럼 보임)
- ⛔ 영상 길이 10분 초과 (검수자가 끝까지 안 봄)
- ⛔ 광고/배너/팝업이 화면에 떠 있음 (앱 외 노이즈)

---

## 🆘 자주 묻는 질문

### Q1. 한국어로 찍어도 되나요?
A. **나레이션은 한국어 OK, 자막은 반드시 영문.** Google 검수자는 보통 영어권. 자막만 영문이면 통과합니다.

### Q2. 화면에 실제 환자 데이터가 보여도 되나요?
A. **개인정보가 보이면 무조건 안 됨.** 키워드(예: "강남 임플란트")는 OK, 환자 이름/전화번호는 모자이크 필수.

### Q3. 영상이 5분 넘으면 어떡하나요?
A. 7분 이내면 OK. 10분 넘으면 검수자가 보다 지칩니다. 5분 이내 권장.

### Q4. 다시 찍어야 하는데 어떡하나요?
A. YouTube에 새 영상 업로드 → 검수 답장 메일에 새 링크 첨부. 옛 영상은 삭제 OK.

### Q5. 음성 녹음이 안 되면?
A. **자막만 있어도 통과 가능.** 하지만 음성 + 자막 같이 가는 게 성공률 ↑

---

## 📋 촬영 당일 준비물 체크 (최종)

촬영 시작 직전 ↓

- [ ] 노트북 충전 100% 또는 어댑터 연결
- [ ] 네트워크 안정 (WiFi → 가능하면 유선)
- [ ] 시크릿 브라우저 창 1개만 열림 (다른 탭 ALL CLOSE)
- [ ] OS 알림 OFF (Do Not Disturb)
- [ ] 마이크 권한 활성화 (Loom/OBS)
- [ ] 본 체크리스트를 두 번째 모니터/태블릿에 띄워놓음 (촬영 중 참고)
- [ ] 시계 (촬영 후 길이 5분 ± 30초 확인용)
- [ ] 커피 한 잔 ☕

---

**원장님, 이 체크리스트 따라가시면 첫 영상으로 OK 받을 확률 90%+ 입니다.**

가장 자주 떨어지는 Scene 5 (Consent 정지) 와 Scene 8 (경쟁사 격리) 자막만 신경쓰시면 됩니다. 🎬
