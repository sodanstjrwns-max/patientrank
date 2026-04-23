# Patient Rank

국내 최초 의료기관 전용 구글 SEO 진단 SaaS. 병원 홈페이지 URL 하나만 입력하면
10초 안에 구글 한국에서 랭크된 모든 키워드와 순위를 보여줍니다.

## Project Overview
- **Name**: Patient Rank (patientrank.co.kr)
- **Goal**: 의료기관이 네이버가 아닌 구글(AI 검색 시대) 노출 현황을 즉시 진단하고 주간 변동을 추적할 수 있게 한다
- **Tagline**: 우리 병원 구글에서 몇 위?
- **Tech Stack**: Hono + TypeScript + Cloudflare Pages + D1 + KV + TailwindCSS + DataForSEO API

## Completed Features (M1)
- 랜딩 페이지 (히어로, 소셜 프루프, 기능 3단, 가격, FAQ, 최종 CTA)
- URL 역추적 방식 진단 API (`POST /api/scan`)
- DataForSEO Labs Ranked Keywords 연동 (API 키 미설정 시 데모 모드 자동 작동)
- KV 24시간 캐싱 (동일 도메인 재조회 시 API 호출 없음)
- IP 해시 기반 월 3회 무료 조회 하드리밋 (SHA-256)
- 진단 결과 페이지 `/result/[scanId]`
  - 스코어카드 (총 키워드 / TOP 3·10·30·100)
  - Canvas 기반 도넛차트 (외부 라이브러리 없음)
  - 진료과 자동 분류 + 상위 3개 진료과 집계
  - 전체 키워드 테이블 (검색 필터)
  - 비회원 게이팅 (21번째 행부터 블러 처리)
- 이메일 게이팅 (`POST /api/leads`) + Resend 이메일 발송
- D1 스키마 전체 (users / domains / scans / keyword_snapshots / backlinks / weekly_alerts / payments / leads / magic_links)
- 공유 가능한 결과 URL (`/result/:id`)
- 가격 페이지 (얼리버드 50% 할인 적용)
- 로그인 / 대시보드 / 블로그 / 약관 / 개인정보처리방침 골격

## Not Yet Implemented
- **M2**: 매직링크 로그인, 토스페이먼츠, 플랜 기반 조회 제한, 대시보드 MVP
- **M3**: Cron Triggers 기반 주간 스냅샷, 카카오 알림톡 연동, 알림 피드
- **M4**: 경쟁사 갭 분석, 백링크 분석 화면
- **M5**: API 토큰 발급, 화이트라벨, 다중 도메인 관리
- PDF 리포트 생성 (Resend 메일 안 템플릿만 구현)
- AEO 블로그 자동화

## URLs & Endpoints
**Pages**
- `GET /` 랜딩 페이지 (URL 진단 입력)
- `GET /result/:id` 진단 결과 (공유 가능)
- `GET /pricing` 가격 플랜
- `GET /login` 로그인 (M2 예정)
- `GET /dashboard` 대시보드 (M2 예정)
- `GET /blog` 블로그
- `GET /terms`, `GET /privacy` 법적 문서

**API**
- `GET /api/health` 헬스체크
- `POST /api/scan` `{ url }` → 진단 실행 (IP 월 3회 제한)
- `GET /api/scan/:id` 진단 결과 JSON
- `POST /api/leads` `{ scan_id, email, clinic_name?, specialty?, doctor_name?, kakao_opt_in? }` → 게이팅 해제 + 리포트 발송

## Data Architecture
- **Database**: Cloudflare D1 (SQLite, 글로벌 분산)
- **Cache**: Cloudflare KV (`scan:{domain}` 24h TTL)
- **Storage Tables** (마이그레이션 `migrations/0001_initial_schema.sql`):
  - `users` – 회원
  - `domains` – 회원이 등록한 모니터링 도메인
  - `scans` – 진단 이력 (비회원 포함, IP 해시 저장)
  - `keyword_snapshots` – 스캔당 키워드·순위 스냅샷 (최대 200개)
  - `leads` – 이메일 게이팅으로 수집한 비회원 리드
  - `backlinks` – 백링크 (Pro 이상)
  - `weekly_alerts` – 주간 변동 스냅샷 (M3)
  - `payments` – 결제 이력 (M2)
  - `magic_links` – 매직링크 로그인 토큰 (M2)

## User Guide
### 비회원 진단
1. `/` 접속 → 병원 홈페이지 URL 입력 (예: `example-hospital.com`)
2. 10초 로딩 후 `/result/:id`로 자동 이동
3. 상위 20개 키워드는 즉시 공개, 21번째 이후는 블러 처리
4. 이메일 입력 폼 작성 → 전체 키워드 + PDF 리포트 발송 (Resend 키 설정 시)

### 월 조회 제한
- 동일 IP(해시) 기준 30일 롤링 3회 제한
- 초과 시 429 응답으로 Basic 업그레이드 유도

### 데모 모드
- `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` 미설정 시 자동으로 현실적인 샘플 데이터 반환
- 실제 배포 전 반드시 실제 키 설정 필요

## Local Development
```bash
# 1) 로컬 D1 마이그레이션
npm run db:migrate:local

# 2) 빌드
npm run build

# 3) PM2로 기동
pm2 start ecosystem.config.cjs

# 4) 확인
curl http://localhost:3000/api/health
```

## Deployment
- **Platform**: Cloudflare Pages + Workers
- **Status**: 🚧 개발 중 (M1 MVP 완료, 로컬 데모 모드 작동)
- **Last Updated**: 2026-04-23

### Production Deploy Checklist
1. `npx wrangler d1 create patientrank-production` → 받은 ID를 `wrangler.jsonc`에 반영
2. `npx wrangler kv namespace create CACHE` → 받은 ID를 `wrangler.jsonc`에 반영
3. `npm run db:migrate:prod`
4. 환경변수 등록 (`npx wrangler pages secret put DATAFORSEO_LOGIN` 등)
5. `npm run deploy:prod`
