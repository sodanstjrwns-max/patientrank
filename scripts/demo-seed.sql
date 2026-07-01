-- ===================================================================
-- PatientRank — 전체 기능 데모 유저 시뮬레이션 시드
-- 페르소나: "김데모 원장 (서울 강남 데모치과, PF2024-DEMO 수료생)"
-- 생성하는 데이터:
--   1) demo@patientrank.kr 유저 (PRO 플랜, PF 50% 할인)
--   2) 베타 신청 이력 (PF 알럼나이 라벨)
--   3) 최근 스캔 + 지난주 스냅샷 (시계열 비교용)
--   4) 구독 + 정기결제 성공 1건 + past_due 1건 시뮬레이션
--   5) 경쟁사 2개 (강남임플란트치과, 청담치과)
--   6) AI 액션 가이드 (캐시 1건)
--   7) 카카오 로그 3건 (베타 초대 + 결제 성공 + 주간 리포트)
-- ===================================================================

-- 깨끗한 시작을 위해 demo@ 관련 데이터 모두 정리
DELETE FROM kakao_logs WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM ai_action_guides WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM competitors WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM payments WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM scan_snapshots WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM keyword_snapshots WHERE scan_id IN (SELECT id FROM scans WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr'));
DELETE FROM scans WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM domains WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
DELETE FROM beta_signups WHERE email = 'demo@patientrank.kr';
DELETE FROM users WHERE email = 'demo@patientrank.kr';

-- ===================================================================
-- 1) 데모 유저
-- ===================================================================
INSERT INTO users (
  email, name, clinic_name, specialty, plan, plan_started_at, plan_ends_at,
  toss_customer_key, kakao_opt_in, phone, is_admin, auth_provider, created_at
) VALUES (
  'demo@patientrank.kr',
  '김데모',
  '데모치과',
  '치과',
  'pro',
  datetime('now', '-21 days'),
  datetime('now', '+9 days'),  -- 9일 뒤 다음 청구
  'cust_demo_001',
  1,
  '010-1234-5678',
  0,
  'email',
  datetime('now', '-21 days')
);

-- ===================================================================
-- 2) 베타 신청 이력 (PF 알럼나이로 신청 → 초대 완료 상태)
-- ===================================================================
INSERT INTO beta_signups (
  email, name, clinic_name, clinic_url, phone, patient_funnel_code,
  is_pf_alumni, status, signed_up_at, source, created_at, updated_at
) VALUES (
  'demo@patientrank.kr',
  '김데모',
  '데모치과',
  'https://demo-dental.kr',
  '010-1234-5678',
  'PF2024-DEMO',
  1,
  'signed_up',  -- 초대 → 가입 완료
  datetime('now', '-21 days'),
  'pf-alumni',
  datetime('now', '-25 days'),
  datetime('now', '-21 days')
);

-- ===================================================================
-- 3) 도메인 + 스캔 결과 (시계열 비교용: 지난주 + 이번주)
-- ===================================================================
INSERT INTO domains (user_id, domain, created_at)
SELECT id, 'demo-dental.kr', datetime('now', '-21 days') FROM users WHERE email = 'demo@patientrank.kr';

-- 지난주 스캔 (8일 전) — 키워드 35개, top10 6개
INSERT INTO scans (
  user_id, domain_id, url, keyword_count, top3_count, top10_count, top30_count, top100_count,
  estimated_traffic, status, created_at
)
SELECT
  u.id, d.id, 'https://demo-dental.kr',
  35, 1, 6, 14, 35,
  2840,
  'completed',
  datetime('now', '-8 days')
FROM users u JOIN domains d ON d.user_id = u.id
WHERE u.email = 'demo@patientrank.kr' AND d.domain = 'demo-dental.kr';

-- 지난주 키워드 (대표 5개)
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '강남 임플란트', 8, 2400, 'https://demo-dental.kr/implant', 96.0, datetime('now', '-8 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '인비절라인 강남', 14, 880, 'https://demo-dental.kr/invisalign', 17.6, datetime('now', '-8 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '라미네이트 가격', 22, 1300, 'https://demo-dental.kr/laminate', 13.0, datetime('now', '-8 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '글로우네이트', 9, 480, 'https://demo-dental.kr/glow', 14.4, datetime('now', '-8 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '치아교정 비용', 18, 3600, 'https://demo-dental.kr/braces', 72.0, datetime('now', '-8 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr';

-- 지난주 스냅샷
INSERT INTO scan_snapshots (
  user_id, domain, scan_id, keyword_count, top3_count, top10_count, top30_count, top100_count,
  estimated_traffic, ai_score, snapshot_date, trigger_type, created_at
)
SELECT
  u.id, 'demo-dental.kr', s.id, 35, 1, 6, 14, 35, 2840, 58,
  date('now', '-8 days'), 'initial',
  datetime('now', '-8 days')
FROM users u JOIN scans s ON s.user_id = u.id
WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-8 days') || '%';

-- 이번주 스캔 (1일 전) — 키워드 47개로 상승, top10 9개로 ↑
INSERT INTO scans (
  user_id, domain_id, url, keyword_count, top3_count, top10_count, top30_count, top100_count,
  estimated_traffic, status, created_at
)
SELECT
  u.id, d.id, 'https://demo-dental.kr',
  47, 2, 9, 19, 47,
  3920,
  'completed',
  datetime('now', '-1 days')
FROM users u JOIN domains d ON d.user_id = u.id
WHERE u.email = 'demo@patientrank.kr' AND d.domain = 'demo-dental.kr';

-- 이번주 키워드 (순위 변동 포함)
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '강남 임플란트', 5, 2400, 'https://demo-dental.kr/implant', 240.0, datetime('now', '-1 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '인비절라인 강남', 7, 880, 'https://demo-dental.kr/invisalign', 88.0, datetime('now', '-1 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '라미네이트 가격', 19, 1300, 'https://demo-dental.kr/laminate', 19.5, datetime('now', '-1 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '글로우네이트', 4, 480, 'https://demo-dental.kr/glow', 96.0, datetime('now', '-1 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '치아교정 비용', 24, 3600, 'https://demo-dental.kr/braces', 36.0, datetime('now', '-1 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';
-- 신규 등장 키워드
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '강남 치과 추천', 11, 1900, 'https://demo-dental.kr', 38.0, datetime('now', '-1 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT s.id, '임플란트 가격 비교', 16, 2200, 'https://demo-dental.kr/implant', 44.0, datetime('now', '-1 days')
FROM scans s JOIN users u ON s.user_id = u.id WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';

-- 이번주 스냅샷
INSERT INTO scan_snapshots (
  user_id, domain, scan_id, keyword_count, top3_count, top10_count, top30_count, top100_count,
  estimated_traffic, ai_score, snapshot_date, trigger_type, created_at
)
SELECT
  u.id, 'demo-dental.kr', s.id, 47, 2, 9, 19, 47, 3920, 67,
  date('now', '-1 days'), 'weekly_cron',
  datetime('now', '-1 days')
FROM users u JOIN scans s ON s.user_id = u.id
WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';

-- ===================================================================
-- 4) 구독 + 결제 이력 (PF 50% 할인 적용)
--    Pro 플랜: 149,000원 → 74,500원
-- ===================================================================
INSERT INTO subscriptions (
  user_id, plan, status, price_krw, discount_rate, final_price_krw,
  billing_cycle, toss_billing_key, toss_customer_key,
  toss_card_company, toss_card_number_masked,
  current_period_start, current_period_end, next_billing_date,
  notes, created_at, updated_at
)
SELECT
  id, 'pro', 'active', 149000, 50, 74500,
  'monthly', 'bkey_demo_pf_alumni_50pct', 'cust_demo_001',
  '신한카드', '4242-****-****-1234',
  datetime('now', '-21 days'),
  datetime('now', '+9 days'),
  datetime('now', '+9 days'),  -- 9일 뒤 정기결제
  'PF 알럼나이 50% 평생 할인 (PF2024-DEMO)',
  datetime('now', '-21 days'),
  datetime('now', '-21 days')
FROM users WHERE email = 'demo@patientrank.kr';

-- 첫 결제 (성공, 21일 전)
INSERT INTO payments (
  user_id, subscription_id, toss_payment_key, toss_order_id,
  amount_krw, vat_krw, status, method, card_company, card_number_masked,
  reason, receipt_url, created_at, paid_at
)
SELECT
  u.id, s.id, 'tpay_demo_001', 'order_demo_first_001',
  74500, 6773, 'paid', 'card', '신한카드', '4242-****-****-1234',
  'initial', 'https://dashboard.tosspayments.com/receipts/demo_001',
  datetime('now', '-21 days'),
  datetime('now', '-21 days')
FROM users u JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'demo@patientrank.kr';

-- ===================================================================
-- 5) 경쟁사 2개
-- ===================================================================
INSERT INTO competitors (user_id, my_domain, competitor_domain, alias, is_active, created_at, updated_at)
SELECT id, 'demo-dental.kr', 'gangnam-implant.kr', '강남임플란트치과', 1,
       datetime('now', '-14 days'), datetime('now', '-14 days')
FROM users WHERE email = 'demo@patientrank.kr';
INSERT INTO competitors (user_id, my_domain, competitor_domain, alias, is_active, created_at, updated_at)
SELECT id, 'demo-dental.kr', 'cheongdam-dental.com', '청담치과', 1,
       datetime('now', '-7 days'), datetime('now', '-7 days')
FROM users WHERE email = 'demo@patientrank.kr';

-- 경쟁사 스캔 + 키워드 (비교 계산용 — gangnam-implant.kr만 시드)
INSERT INTO scans (user_id, url, keyword_count, top3_count, top10_count, top30_count, top100_count,
                   estimated_traffic, status, created_at)
VALUES (NULL, 'https://gangnam-implant.kr', 62, 5, 14, 28, 62, 7800, 'completed', datetime('now', '-2 days'));

INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT id, '강남 임플란트', 3, 2400, 'https://gangnam-implant.kr', 480.0, datetime('now', '-2 days')
FROM scans WHERE url = 'https://gangnam-implant.kr' ORDER BY id DESC LIMIT 1;
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT id, '임플란트 잘하는 치과', 6, 1700, 'https://gangnam-implant.kr/why', 170.0, datetime('now', '-2 days')
FROM scans WHERE url = 'https://gangnam-implant.kr' ORDER BY id DESC LIMIT 1;
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT id, '인비절라인 강남', 12, 880, 'https://gangnam-implant.kr/invisalign', 26.4, datetime('now', '-2 days')
FROM scans WHERE url = 'https://gangnam-implant.kr' ORDER BY id DESC LIMIT 1;
INSERT INTO keyword_snapshots (scan_id, keyword, rank, search_volume, ranked_url, etv, created_at)
SELECT id, '디지털 임플란트', 4, 1100, 'https://gangnam-implant.kr/digital', 165.0, datetime('now', '-2 days')
FROM scans WHERE url = 'https://gangnam-implant.kr' ORDER BY id DESC LIMIT 1;

-- 업데이트 도메인 (scan_service가 도메인 추출하지 않으므로 직접 set)
UPDATE scans SET domain_id = NULL WHERE url = 'https://gangnam-implant.kr';

-- ===================================================================
-- 6) AI 액션 가이드 (캐시 1건 — GPT-5.5 사용한 척)
-- ===================================================================
INSERT INTO ai_action_guides (
  user_id, scan_id, domain, week_of, weekly_score, score_change,
  top_strength, top_weakness, actions_json, roadmap_json,
  model_used, prompt_tokens, completion_tokens, cost_usd, created_at
)
SELECT
  u.id, s.id, 'demo-dental.kr',
  date('now', '-1 days'),
  67, 9,
  '글로우네이트 키워드 9위→4위 점프 (search_volume 480/월 신규 트래픽 확보)',
  '치아교정 비용 18위→24위 하락 (월 3,600 검색량 핵심 키워드)',
  '[{"action":"치아교정 비용 페이지 콘텐츠 확장","priority":"high","impact":"+250 traffic/month","effort":"2시간","steps":["가격표 명시","케이스별 비용 차이 표","비포애프터 사진 3건"]},{"action":"라미네이트 가격 컨텐츠 보강","priority":"medium","impact":"+80 traffic/month","effort":"1시간","steps":["FAQ 추가","라미네이트 종류별 가격"]},{"action":"강남 치과 추천 키워드 LP 신설","priority":"high","impact":"+450 traffic/month","effort":"4시간","steps":["원장 소개","진료과목","위치 약도"]}]',
  '{"week1":"치아교정 비용 페이지 보강","week2":"강남 치과 추천 LP 신설","week3":"임플란트 가격 비교 콘텐츠","week4":"백링크 5개 확보"}',
  'gpt-5.5',
  1240, 856, 0.0234,
  datetime('now', '-1 days')
FROM users u JOIN scans s ON s.user_id = u.id
WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';

-- ===================================================================
-- 7) 카카오 알림톡 로그 3건
-- ===================================================================
-- 베타 초대장 (21일 전)
INSERT INTO kakao_logs (
  user_id, phone, template_code, message_title, message_body,
  button_url, status, sent_at, created_at
)
SELECT
  id, '010-1234-5678', 'BETA_INVITE',
  '[PatientRank] 베타 초대장 도착',
  '김데모 원장님, PatientRank 베타에 초대되었습니다!\nPF 알럼나이 50% 평생 할인 코드: PF50LIFETIME\n링크에서 첫 진단 시작해 주세요.',
  'https://patientrank.pages.dev/checkout?plan=pro&coupon=PF50LIFETIME',
  'sent', datetime('now', '-21 days'), datetime('now', '-21 days')
FROM users WHERE email = 'demo@patientrank.kr';

-- 결제 성공 알림 (21일 전)
INSERT INTO kakao_logs (
  user_id, phone, template_code, message_title, message_body,
  button_url, status, sent_at, created_at
)
SELECT
  id, '010-1234-5678', 'PAYMENT_SUCCESS',
  '[PatientRank] 결제 완료',
  '74,500원 결제가 완료되었습니다.\n다음 결제일: ' || strftime('%Y-%m-%d', 'now', '+9 days'),
  'https://patientrank.pages.dev/dashboard',
  'sent', datetime('now', '-21 days'), datetime('now', '-21 days')
FROM users WHERE email = 'demo@patientrank.kr';

-- 주간 리포트 (1일 전)
INSERT INTO kakao_logs (
  user_id, phone, template_code, message_title, message_body,
  button_url, status, sent_at, created_at
)
SELECT
  u.id, '010-1234-5678', 'WEEKLY_REPORT',
  '[PatientRank] 이번주 진단 리포트',
  'demo-dental.kr 이번주 변동:\n• 키워드 35→47개 (+12)\n• TOP10 6→9개 (+3)\n• 예상 트래픽 2,840→3,920 (+38%)\n• 글로우네이트 9→4위 ⬆\n• 치아교정 비용 18→24위 ⬇',
  'https://patientrank.pages.dev/result/' || s.id,
  'sent', datetime('now', '-1 days'), datetime('now', '-1 days')
FROM users u JOIN scans s ON s.user_id = u.id
WHERE u.email = 'demo@patientrank.kr' AND s.created_at LIKE '%' || strftime('%Y-%m-%d', 'now', '-1 days') || '%';

-- 시드 완료 (확인 쿼리는 별도 verify-demo.sql 스크립트에서 실행)
SELECT 'seed_done' AS status, datetime('now') AS at;
