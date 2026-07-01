# Patient Rank

국내 최초 의료기관 전용 구글 SEO 진단 SaaS. 병원 홈페이지 URL 하나만 입력하면
10초 안에 ① 구글에서 랭크된 모든 키워드와 순위, ② 이번 달 만들어야 할 콘텐츠 처방전을 보여줍니다.

## Project Overview
- **Name**: Patient Rank (patientrank.kr)
- **Goal**: 의료기관이 구글(AI 검색 시대) 노출 현황을 즉시 진단하고, "그래서 어떤 콘텐츠를 만들어야 하는지"까지 처방받는다
- **Tagline**: 우리 병원 구글에서 몇 위?
- **Tech Stack**: Hono + TypeScript + Cloudflare Pages + D1 + KV + TailwindCSS + DataForSEO + OpenAI + Toss Payments

## Public URLs
- **Production**: https://patientrank.kr
- **GitHub**: https://github.com/sodanstjrwns-max/patientrank

## Completed Features

### 진단 코어 (M1 + M1.5)
- URL 역추적 진단 (`POST /api/scan`) — DataForSEO Labs Ranked Keywords 연동
- KV 24시간 캐싱, IP 해시 기반 월 3회 무료 한도 (SHA-256)
- 결과 페이지 `/result/:id` — SEO 등급(A+~F), 스코어카드, 도넛, 진료과 분류, 키워드 표
- 백링크·도메인 권위(DR)·경쟁사 링크 갭 분석
- 비회원 21번째 행 블러 + 이메일 게이팅 (`POST /api/leads`)

### 롱테일 발견기 (자가 체이닝 워커)
- 사이트맵 역추적 (700+ URL) + 250개 시·군·구 매트릭스
- `ctx.waitUntil` 청크 체이닝으로 CPU 30초 한도 우회, HMAC 서명 내부 엔드포인트
- 폴링 기반 워치독 자동 복구 (60초 정체 시 마지막 청크부터 재개)
- 검증: bdbddc.com 45개 롱테일 발견 ("홍성 라미네이트" #1 포함)

### 🆕 콘텐츠 처방전 (Content Prescription Engine)
- **"그래서 뭘 만들어야 하나?"에 답하는 핵심 차별화 기능**
- 5가지 처방 유형 자동 분류 + 우선순위 스코어링:
  - `quick_win` — 11~30위 키워드, 콘텐츠 보강 1편이면 1페이지 진입권
  - `defend` — 4~10위, TOP3 승격 사정권
  - `gap_attack` — 경쟁사는 잡는데 우리는 없는 키워드
  - `new_content` — 수요 있는데 콘텐츠 자체가 없는 지역 롱테일
  - `ctr_fix` — GSC 노출 많은데 클릭 못 받는 키워드 (제목/메타만 수정)
- 처방마다 할 일 · 기대 효과 · 추천 콘텐츠 주제 제공
- 무료: 상위 3건 공개 + 블러 게이팅 / 유료: 전체
- 결과 페이지 `#prescription` 섹션 + `GET /api/scan/:id/prescriptions`

### 인증 / 권한
- Google OAuth 로그인 (매직링크는 2026-04 제거) + JWT 세션 쿠키 (30일, revoke 지원)
- JWT_SECRET 필수화 (미설정 시 명시적 에러 — 폴백 시크릿 제거됨)
- 플랜별 권한 (free / basic / pro / agency / admin)

### GSC 연동 (Pro+)
- Google Search Console OAuth — 사이트 목록, 키워드 동기화
- "노출됐지만 우리가 못 잡은 키워드" 회수 (`POST /api/scan/:id/gsc-sync`)

### 결제 (토스페이먼츠)
- 빌링키 발급 → **첫 결제 즉시 청구** (2026-07 버그 수정: 이전엔 카드 등록만 하고 미청구)
- 쿠폰 시스템 (BETA100 / PATIENTFUNNEL50) + 사용 횟수 카운트 (`consumeCoupon`)
- 결제 status 'paid'로 통일 (마이그레이션 0009로 기존 'DONE' 정규화)
- 일일 빌링 크론 — 자동 청구, past_due 재시도, 만료 처리

### 베타 / 마케팅
- 베타 신청 `/beta` + 어드민 초대 관리 `/admin/beta` (카카오 알림톡 발송)
- 페이션트 퍼널 수료생 전용 LP `/pf-alumni`
- 경쟁사 추적 `/dashboard/competitors`

### 크론 (Cloudflare Dashboard에서 수동 등록 필요)
- `0 21 * * 0` (월 06:00 KST) — 주간 리스캔 + 스냅샷 + AI 가이드 + 카카오 리포트
- `0 21 * * *` (매일 06:00 KST) — 정기결제 자동 청구
- ⚠️ Pages는 wrangler.jsonc triggers 미지원 → Dashboard > Settings > Functions > Cron Triggers에서 등록 확인 필요

## Functional Entry URIs

**Pages**
- `GET /` — 랜딩 / `GET /result/:id` — 진단 결과 (처방전 포함)
- `GET /pricing` `GET /login` `GET /dashboard` `GET /dashboard/competitors`
- `GET /admin` `GET /admin/beta` — 어드민
- `GET /beta` `GET /pf-alumni` `GET /checkout` `GET /blog` `GET /terms` `GET /privacy`
- `GET /payment/success` `GET /payment/fail` — 토스 콜백

**API (Public)**
- `GET /api/health`
- `POST /api/scan` `{ url, max_rank? }` — 진단 (IP 월 3회)
- `GET /api/scan/:id` — 결과 JSON
- `GET /api/scan/:id/prescriptions` — 🆕 콘텐츠 처방전 (비회원 3건)
- `POST /api/leads` — 이메일 게이팅 해제
- `POST /api/scan/:id/longtail/start` / `GET .../longtail/status` — 롱테일 잡
- `POST /api/beta/signup`

**API (Auth)**
- `GET /auth/google` `GET /auth/google/callback` — OAuth
- `GET /auth/gsc/connect` `GET /auth/gsc/callback` — GSC OAuth
- `POST /api/auth/logout` `GET /api/auth/me`
- `GET/POST /api/gsc/*` — GSC 상태/사이트/동기화 (Pro+)
- `POST /api/coupon/validate` `POST /api/payment/init`
- `GET/POST/DELETE /api/competitors*`

**API (Admin / Internal)**
- `GET /api/admin/stats`
- `POST /api/admin/beta/invite` `POST /api/admin/beta/invite-all`
- `POST /api/_internal/longtail/prepare|chunk` — HMAC 서명 워커 체이닝

## Data Architecture
- **Database**: Cloudflare D1 — users, sessions, domains, scans, keyword_snapshots, leads,
  backlinks, gsc_tokens, gsc_keyword_snapshots, scan_snapshots, ai_action_guides,
  subscriptions, payments, coupons, beta_signups, kakao_logs, competitors, cron_runs (마이그레이션 0001~0009)
- **Cache**: Cloudflare KV — `scan:{domain}` (24h), `longtail:{domain}:*` (3d), `longtail:job:{id}` (2h)
- **Secrets**: DATAFORSEO_*, RESEND_API_KEY, GOOGLE_CLIENT_*, JWT_SECRET, TOSS_*, KAKAO_*, OPENAI_API_KEY

## User Guide
1. `/` 접속 → 병원 홈페이지 URL 입력 → 10초 후 결과
2. **콘텐츠 처방전** 섹션에서 이번 달 할 일을 우선순위대로 확인
3. 이메일 입력 → 전체 키워드 공개 / 로그인 → 롱테일 스캔
4. Pro 플랜 → GSC 연동으로 "놓친 키워드" 회수 + AI 액션 가이드 + 주간 카카오 리포트

## Recent Fixes (2026-07-01)
- 💰 첫 결제 실청구 누락 수정 — 빌링키 발급 후 `chargeBillingKey` 즉시 호출
- 🗃️ payments 스키마 통일 (0001 ↔ 0006 충돌 해소) + status 'paid' 정규화 (0009)
- 🎟️ 쿠폰 `current_uses` 증가 로직 추가 (무한 사용 버그 수정)
- 🔒 에러 페이지 스택 트레이스 비노출 (어드민만 표시) / JWT_SECRET·TOSS 키 폴백 제거
- 🆕 콘텐츠 처방전 엔진 + 결과 페이지 섹션 + API

## Not Yet Implemented
- 토스 웹훅 (카드사 측 취소/환불 동기화)
- 결제·쿠폰 단위 테스트 (vitest)
- 블로그 자동화 (AEO), PDF 리포트
- invite-all 비동기 체이닝 (현재 순차 루프 — 200명 이상 시 개선 필요)

## Local Development
```bash
npm run db:migrate:local
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
```

## Deployment
- **Platform**: Cloudflare Pages + Workers (사용자 소유 계정)
- **Status**: ✅ Active (https://patientrank.kr)
- **Deploy**: `npm run deploy:prod` (+ 원격 마이그레이션 `npm run db:migrate:prod`)
- **Last Updated**: 2026-07-01
