-- 데모 데이터 검증 (각 테이블별 카운트)
SELECT 'users' AS t, COUNT(*) AS n FROM users WHERE email = 'demo@patientrank.kr';
SELECT 'beta_signups' AS t, COUNT(*) AS n FROM beta_signups WHERE email = 'demo@patientrank.kr';
SELECT 'domains' AS t, COUNT(*) AS n FROM domains WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
SELECT 'scans' AS t, COUNT(*) AS n FROM scans WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
SELECT 'keyword_snapshots' AS t, COUNT(*) AS n FROM keyword_snapshots WHERE scan_id IN (SELECT id FROM scans WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr'));
SELECT 'scan_snapshots' AS t, COUNT(*) AS n FROM scan_snapshots WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
SELECT 'subscriptions' AS t, COUNT(*) AS n FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
SELECT 'payments' AS t, COUNT(*) AS n FROM payments WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
SELECT 'competitors' AS t, COUNT(*) AS n FROM competitors WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
SELECT 'ai_action_guides' AS t, COUNT(*) AS n FROM ai_action_guides WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
SELECT 'kakao_logs' AS t, COUNT(*) AS n FROM kakao_logs WHERE user_id = (SELECT id FROM users WHERE email = 'demo@patientrank.kr');
