# Patient Rank

국내 최초 의료기관 전용 구글 SEO 진단 SaaS. 병원 홈페이지 URL 하나만 입력하면
10초 안에 구글 한국에서 랭크된 모든 키워드와 순위를 보여줍니다.

## Project Overview
- **Name**: Patient Rank (patientrank.kr)
- **Goal**: 의료기관이 네이버가 아닌 구글(AI 검색 시대) 노출 현황을 즉시 진단하고 주간 변동을 추적할 수 있게 한다
- **Tagline**: 우리 병원 구글에서 몇 위?
- **Tech Stack**: Hono + TypeScript + Cloudflare Pages + D1 + KV + TailwindCSS + DataForSEO API

## Public URLs
- **Production**: https://patientrank.kr
- **Latest Deploy**: https://9dde7fd4.patientrank.pages.dev

## Completed Features (M1 + M1.5)
### 진단 코어
- URL 역추적 진단 (`POST /api/scan`) — DataForSEO Labs Ranked Keywords 연동
- KV 24시간 캐싱, IP 해시 기반 월 3회 무료 한도 (SHA-256)
- 결과 페이지 `/result/[scanId]` — 스코어카드, 도넛, 진료과 분류, 키워드 표
- 비회원 21번째 행 블러 + 이메일 게이팅 (`POST /api/leads`)

### 롱테일 발견기 (Option A + B, 백그라운드 비동기)
- 사이트맵 역추적 (700+ URL 파싱) + 250개 시·군·구 매트릭스
- **자가 체이닝 워커 아키텍처** — `ctx.waitUntil` 30초 CPU 한도 우회
  - `POST /api/scan/:id/longtail/start` — 1초 이내 job_id 반환
  - `POST /_internal/longtail/prepare` — 사이트맵 파싱 (HMAC 서명)
  - `POST /_internal/longtail/chunk` — 청크당 SERP 5개 병렬 처리, 다음 청크 자동 트리거
  - `GET /api/scan/:id/longtail/status` — 프론트가 2초 폴링
- 200~500 키워드 무제한 스캔, 청크당 5개 동시 처리
- 검증: bdbddc.com에서 45개 롱테일(TOP 10에 30개), "홍성 라미네이트" #1 포함

### 인증 / 권한
- 매직링크 로그인 (Resend) + JWT 세션 쿠키
- 플랜별 권한 (free / basic / pro / agency / admin)
- 무료: 월 3회 + 롱테일 월 1회, 유료: 무제한

### 랜딩 페이지 v2 (의료 SaaS 프리미엄 디자인)
- `#hero` `#diagnose` — 페이션트퍼널×서울비디치과 검증 뱃지, 4개 라이브 카운터
- `#live-demo` — bdbddc.com 실제 결과 카드 (홍성 라미네이트 #1, 당진 인비절라인 #1)
- `#trust` `#why-us` — 문석준 대표원장 프로필, 매출 성장 차트(월 6천만 → 연 120억)
- `#comparison` — 네이버광고 vs Ahrefs/Semrush vs Patient Rank 4열 비교표
- `#features` — 기능 6단 (URL 1개·롱테일·카톡·갭·백링크·GSC)
- `#how` — 동작 원리 4스텝
- `#pricing` — Free / Basic / Pro / Premium 4단 (얼리버드 50%)
- `#faq` — 자주 묻는 질문
- `#cta` — 최종 행동 유도

## Functional Entry URIs
**Pages**
- `GET /` — 랜딩 페이지
- `GET /result/:id` — 진단 결과 (공유 가능, 롱테일 버튼 자동 노출)
- `GET /pricing` — 가격 플랜
- `GET /login` — 매직링크 로그인
- `GET /dashboard` — 회원 대시보드
- `GET /blog`, `GET /terms`, `GET /privacy`

**API (Public)**
- `GET /api/health`
- `POST /api/scan` `{ url, max_rank? }` — 기본 스캔 (IP 월 3회 제한)
- `GET /api/scan/:id` — 진단 결과 JSON
- `POST /api/leads` `{ scan_id, email, ... }` — 이메일 게이팅 해제
- `POST /api/scan/:id/longtail/start` `{ mode?, max? }` — 롱테일 잡 생성, **즉시 jobId 반환**
- `GET /api/scan/:id/longtail/status?jobId=` — 잡 상태/진행률 (프론트 2초 폴링)
- `POST /api/scan/:id/longtail` `{ mode?, max? }` — 동기 롱테일 호출 (admin/paid)

**API (Auth)**
- `POST /api/auth/magic-link` — 매직링크 발송
- `GET /api/auth/verify?token=` — 토큰 검증
- `GET /api/auth/me` — 현재 세션 정보

**API (Internal, HMAC 서명)**
- `POST /_internal/longtail/prepare` — 사이트맵 파싱 워커
- `POST /_internal/longtail/chunk` — 청크 처리 워커

## Data Architecture
- **Database**: Cloudflare D1 (SQLite, 글로벌 분산)
- **Cache**: Cloudflare KV
  - `scan:{domain}` — 기본 스캔 결과 (24h TTL)
  - `longtail:{domain}:{mode}:{max}` — 롱테일 결과 (3d TTL)
  - `longtail:job:{jobId}` — 잡 상태 (2h TTL)
  - `longtail:active:{scanId}` — 진행 중 잡 인덱스
- **Tables** (`migrations/0001_initial_schema.sql`):
  - users / domains / scans / keyword_snapshots / leads
  - backlinks / weekly_alerts / payments / magic_links

## User Guide
### 비회원 진단
1. `/` 접속 → 병원 홈페이지 URL 입력
2. 10초 로딩 후 `/result/:id`로 자동 이동
3. 상위 20개 키워드 즉시 공개, 21번째 이후 블러
4. 이메일 입력 → 전체 키워드 공개

### 롱테일 발견기 (회원/유료)
1. 결과 페이지 하단 "롱테일 스캔 시작" 클릭
2. 1초 내 잡 생성 → 진행률 바가 phase별로 갱신 (sitemap → matrix → serp → volumes)
3. 평균 3~5분 후 완료, 결과 카드에 신규 키워드 자동 표시
4. 무료 플랜은 월 1회, 유료는 무제한

## Verification (2026-04-25 기준)
- 라이브 사이즈: 59,334 bytes
- 11/11 섹션 ID 정상 (`hero` `diagnose` `live-demo` `trust` `why-us` `comparison` `features` `how` `pricing` `faq` `cta`)
- 4개 카운터 마크업 정상 (6,000+ / 2.1배 / 40% / 62%)
- 롱테일 `/start` 평균 응답: **0.82초** (이전 30초 타임아웃 → 자가 체이닝으로 해결)
- bdbddc.com 200 키워드 스캔 완료: 45개 롱테일 발견, $2.535
- snubidc.com 60 키워드 스캔: 폴링 0% → 100% 정상 진행, 3분 완료

## Not Yet Implemented
- **Option C** — Google Search Console OAuth 연동 (Premium 전용)
- **M3** — Cron Trigger 기반 주간 스냅샷 + 카카오 알림톡
- **M4** — 경쟁사 갭 분석, 백링크 분석 화면
- **M5** — API 토큰, 화이트라벨, 다중 도메인 관리
- PDF 리포트 자동 생성 (현재는 메일 템플릿만)

## Recommended Next Steps
1. **Option C (GSC OAuth)** — Premium 플랜 차별화 포인트, 노출됐지만 못 잡은 키워드 100% 회수
2. **Cron 주간 스냅샷** — Basic+ 플랜 핵심 가치, 카카오 비즈메시지 연동
3. **결제 (토스페이먼츠)** — 얼리버드 가격 즉시 매출화
4. **블로그 자동화 (AEO)** — 자기 도메인 SEO 자산 강화

## Local Development
```bash
npm run db:migrate:local
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
```

## Deployment
- **Platform**: Cloudflare Pages + Workers
- **Status**: ✅ Active (https://patientrank.kr)
- **Last Updated**: 2026-04-25
