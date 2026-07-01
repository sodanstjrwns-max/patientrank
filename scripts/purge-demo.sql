-- 데모 유저(demo@patientrank.kr, id=2) 및 관련 데이터 전부 제거
-- 원장님 본인 계정(sodanstjrwns@gmail.com, id=1)은 그대로 둠

-- 1) 자식 테이블부터 정리 (FK 참조 안전)
DELETE FROM kakao_logs WHERE user_id = 2;
DELETE FROM ai_action_guides WHERE user_id = 2;
DELETE FROM competitor_alerts WHERE user_id = 2;
DELETE FROM competitors WHERE user_id = 2;
DELETE FROM payments WHERE user_id = 2;
DELETE FROM subscriptions WHERE user_id = 2;
DELETE FROM keyword_snapshots WHERE scan_id IN (SELECT id FROM scans WHERE user_id = 2);
DELETE FROM scan_snapshots WHERE user_id = 2;
DELETE FROM scans WHERE user_id = 2;
DELETE FROM domains WHERE user_id = 2;
DELETE FROM sessions WHERE user_id = 2;
DELETE FROM beta_signups WHERE email = 'demo@patientrank.kr';
DELETE FROM leads WHERE email = 'demo@patientrank.kr';
DELETE FROM magic_links WHERE email = 'demo@patientrank.kr';

-- 2) 마지막으로 유저 자체 삭제
DELETE FROM users WHERE email = 'demo@patientrank.kr';

-- 3) 디버그 세션도 정리
DELETE FROM sessions WHERE id = 'debug-admin-session-2026';
