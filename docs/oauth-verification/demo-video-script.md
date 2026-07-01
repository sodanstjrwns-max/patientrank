# Google OAuth Verification — Demo Video Script

**App:** PatientRank
**Domain:** https://patientrank.pages.dev
**Required Length:** 2–5 minutes
**Upload to:** YouTube (Unlisted)
**Submitted with:** Verification request 2026-04-25

---

## 📋 Pre-Recording Checklist

- [ ] Logout state cleared (use Incognito / new browser profile)
- [ ] Test GSC account ready: sodanstjrwns@gmail.com
- [ ] At least 1 verified GSC property (e.g., bdbddc.com)
- [ ] Screen resolution: 1920x1080
- [ ] Recording tool: Loom / OBS / Mac built-in (Cmd+Shift+5)
- [ ] Audio: Optional (Korean OK, but English subtitles recommended)
- [ ] Browser: Chrome (clean, no extensions visible)

---

## 🎬 Scene-by-Scene Script

### Scene 1 — App Introduction (0:00 – 0:20)

**Visual:** Open https://patientrank.pages.dev landing page in browser.

**Narration (English subtitle):**
> "This is PatientRank — a medical-only SEO diagnostic SaaS for clinics in Korea. Today I'll demonstrate why we need access to the Google Search Console read-only scope."

**Action:**
- Scroll slowly through landing page hero
- Stop at the "URL 진단" section briefly
- Highlight the URL bar showing `patientrank.pages.dev`

---

### Scene 2 — Sign-In Flow (0:20 – 0:50)

**Visual:** Click "로그인" / "Login" in top nav.

**Narration:**
> "First, the user signs in with Google OAuth. At this stage we only request basic profile and email scopes — non-sensitive."

**Action:**
- Click "Google 계정으로 시작" button
- Show Google consent screen
- **Highlight the requested scopes box** (basic profile, email — no sensitive scopes yet)
- Approve → redirected back to PatientRank dashboard

---

### Scene 3 — Run a Scan (0:50 – 1:20)

**Visual:** Dashboard → enter URL → run SEO scan.

**Narration:**
> "The user enters their clinic website URL. PatientRank fetches keyword ranking data from third-party SEO providers — but as you'll see, this only catches a small fraction of the clinic's actual search exposure."

**Action:**
- Enter `bdbddc.com` in scan input
- Click "진단 시작" / "Start Scan"
- Wait for result page to load (~10s)
- Result page appears showing 47 keywords, DR 0, etc.

---

### Scene 4 — The Problem (1:20 – 1:50)

**Visual:** Scroll down to the GSC card on result page.

**Narration:**
> "Notice: the third-party database only found 47 keywords. But this clinic has thousands of actual search impressions on Google. To surface those missed keywords, we need the user to connect their Google Search Console — read-only."

**Action:**
- Highlight "47 keywords" in the Executive Summary card
- Scroll down to the GSC card
- Hover on the gold "GSC 계정 연결" button
- Pause for 2 seconds on the card description that says "real impression keywords up to 25,000, read-only, disconnect anytime"

---

### Scene 5 — Sensitive Scope Consent (1:50 – 2:30) ⭐ **MOST IMPORTANT**

**Visual:** Click "GSC 계정 연결" button → Google consent screen for `webmasters.readonly`.

**Narration:**
> "Now the user explicitly clicks 'Connect Google Search Console.' This triggers a separate OAuth consent flow that clearly shows the requested scope: webmasters.readonly. The user can review and approve."

**Action:**
- Click "GSC 계정 연결" gold button
- **Google consent screen appears — record the FULL screen**
  - Show app name: "PatientRank"
  - Show app logo
  - **Show the requested scope clearly:** "View Search Console data for your verified sites"
  - Show developer contact info
- Click "Continue" / "허용"
- User redirected back to result page

**⚠️ Critical:** This scene must clearly capture the consent screen with the sensitive scope visible. Google reviewers will pause here.

---

### Scene 6 — Data Display (2:30 – 3:10)

**Visual:** GSC card now shows real data.

**Narration:**
> "After consent, PatientRank fetches the user's GSC data via the Search Analytics API and displays it in their dashboard. This includes total keywords, missed keyword count, impressions, clicks, CTR, and average position."

**Action:**
- Show GSC card with populated data:
  - "Total keywords: 12,847"
  - "Missed keywords: 2,341"
  - "Total impressions: 187,230"
- Scroll to keyword table showing actual GSC rows
- Highlight a row: keyword + impressions + clicks + CTR + avg position

---

### Scene 7 — Limited Use Demonstration (3:10 – 3:40)

**Visual:** Show that data is per-user only.

**Narration:**
> "GSC data is displayed only to the user who connected their own account. We never share, sell, or transfer this data to third parties, never use it for advertising, and the data is cached for at most 24 hours."

**Action:**
- Show URL: `patientrank.pages.dev/result/123` (user's own scan)
- Open browser DevTools → Application → Cookies → show HttpOnly session cookie
- Briefly show the Privacy Policy in another tab: `/privacy`
- Highlight the "Limited Use Compliance" section

---

### Scene 8 — Disconnect Flow (3:40 – 4:10)

**Visual:** User disconnects GSC.

**Narration:**
> "The user can disconnect at any time from inside the app. This immediately revokes the refresh token via Google's revoke endpoint and deletes our local copy."

**Action:**
- Click "GSC 연결 해제" button on GSC card
- Confirmation modal appears
- Click "확인" / "Confirm"
- GSC card returns to "Connect" state
- Open https://myaccount.google.com/permissions in another tab
- Show that PatientRank is no longer in the user's authorized apps list

---

### Scene 9 — Privacy & Security Recap (4:10 – 4:40)

**Visual:** Open `/privacy` page in new tab.

**Narration:**
> "Our Privacy Policy clearly documents Google API Limited Use compliance. We use webmasters.readonly because it's the minimum scope required for our use case, never request write access, and never use data for advertising."

**Action:**
- Scroll through `/privacy` page
- Pause on Section 4: "Google API 사용자 데이터 정책 준수"
- Highlight the 4 Limited Use bullet points
- Scroll to Section 8: User rights (열람·정정·삭제·연결 해제)

---

### Scene 10 — Closing (4:40 – 5:00)

**Visual:** Return to PatientRank homepage.

**Narration:**
> "PatientRank uses the webmasters.readonly scope solely to help individual clinic owners discover keywords missed by third-party SEO databases. Read-only, user-initiated, transparent. Thank you for reviewing."

**Action:**
- Show PatientRank logo
- Show contact email: hello@patientrank.kr
- Fade out

---

## 🎙️ Optional: Korean Narration Version

원장님이 영상 직접 녹화하실 경우 한국어 멘트 ↓

| Scene | 한국어 멘트 |
|---|---|
| 1 | "이건 PatientRank, 한국 의료기관 전용 구글 SEO 진단 SaaS입니다. 오늘은 Google Search Console 읽기 전용 권한이 왜 필요한지 시연하겠습니다." |
| 2 | "먼저 사용자는 Google OAuth로 로그인합니다. 이 단계에서는 기본 프로필과 이메일만 요청하며, 민감 권한은 요청하지 않습니다." |
| 3 | "사용자가 자신의 병원 URL을 입력하고 SEO 스캔을 실행합니다. PatientRank는 외부 SEO 데이터베이스에서 키워드 정보를 가져오는데, 보시다시피 실제 노출 키워드의 일부만 잡힙니다." |
| 4 | "외부 DB에선 47개 키워드만 발견되지만, 이 병원의 실제 구글 노출은 수천 개입니다. 이 누락된 키워드들을 찾기 위해 사용자의 Google Search Console 읽기 전용 연결이 필요합니다." |
| 5 | "이제 사용자가 'GSC 계정 연결' 버튼을 명시적으로 클릭합니다. 별도의 OAuth 동의 화면이 뜨고, 요청 권한 'webmasters.readonly'가 분명히 표시됩니다. 사용자는 검토 후 승인합니다." |
| 6 | "동의 후 PatientRank는 Search Analytics API를 통해 GSC 데이터를 가져와 사용자 대시보드에 표시합니다. 전체 키워드 수, 놓친 키워드, 노출수, 클릭수, CTR, 평균 순위가 보입니다." |
| 7 | "GSC 데이터는 본인이 연결한 사용자에게만 표시됩니다. 제3자에게 공유·판매·전송하지 않고, 광고에 사용하지 않으며, 캐시는 최대 24시간만 유지됩니다." |
| 8 | "사용자는 앱 안에서 언제든 연결 해제할 수 있습니다. 즉시 Google revoke 엔드포인트가 호출되어 refresh token이 삭제됩니다." |
| 9 | "개인정보처리방침에 Google API Limited Use 준수가 명시되어 있습니다. 'webmasters.readonly'는 우리 용도에 필요한 최소 권한이며, 쓰기 권한은 요청하지 않고, 광고 활용도 하지 않습니다." |
| 10 | "PatientRank는 webmasters.readonly 권한을 오직 개별 병원 원장이 외부 DB에서 누락된 키워드를 발견할 수 있도록 돕기 위해서만 사용합니다. 읽기 전용, 사용자 주도, 투명. 검토해주셔서 감사합니다." |

---

## 📤 Upload Settings

- **Title:** `PatientRank — Google OAuth Verification Demo (webmasters.readonly)`
- **Privacy:** **Unlisted** (not Public, not Private)
- **Description:**
  ```
  Demo video for Google OAuth verification.

  App: PatientRank (https://patientrank.pages.dev)
  Client ID: 248882577385-n9hu8id2v88106ikutpv9mups4s4kh9c.apps.googleusercontent.com
  Scope: https://www.googleapis.com/auth/webmasters.readonly
  Privacy Policy: https://patientrank.pages.dev/privacy
  Terms of Service: https://patientrank.pages.dev/terms
  ```
- **Captions:** Upload English `.srt` file (auto-generate via YouTube studio is OK)

---

## ✅ Final Submission Checklist

After recording:
- [ ] Video uploaded as Unlisted
- [ ] URL copied: `https://youtu.be/_______`
- [ ] All 4 redirect URIs registered in Google Console
- [ ] Privacy Policy live at `/privacy`
- [ ] Terms of Service live at `/terms`
- [ ] App logo (120x120 PNG) uploaded to OAuth consent screen
- [ ] Scope justification submitted via OAuth consent screen form
- [ ] Demo video URL submitted via OAuth consent screen form
