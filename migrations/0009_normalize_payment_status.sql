-- ===================================================================
-- Migration 0009: 결제 status 값 정규화
-- 배경: 토스 응답('DONE')이 그대로 저장돼 어드민 매출 집계(status='paid')와 불일치
-- 앞으로는 코드에서 'paid'로 통일 저장 — 기존 레코드도 정규화
-- ===================================================================

UPDATE payments SET status = 'paid' WHERE status = 'DONE';
UPDATE payments SET status = 'failed' WHERE status IN ('ABORTED', 'EXPIRED', 'FAILED');
UPDATE payments SET status = 'canceled' WHERE status IN ('CANCELED', 'PARTIAL_CANCELED');
