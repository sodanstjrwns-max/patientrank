-- ===================================================================
-- Migration 0006: 결제 시스템 + 베타 신청 + 카카오 알림톡 로그
-- Day 3 (B + C 트랙): 토스페이먼츠 연동 + 페이션트 퍼널 수료생 베타
--
-- NOTE: D1 트랜잭션 호환성 위해 인덱스 최소화. 추가 인덱스는 0007에서.
-- ===================================================================

-- 1. 베타 신청 테이블
CREATE TABLE IF NOT EXISTS beta_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  clinic_name TEXT,
  clinic_url TEXT,
  phone TEXT,
  patient_funnel_code TEXT,
  is_pf_alumni INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_at DATETIME,
  signed_up_at DATETIME,
  source TEXT,
  message TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 구독 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  price_krw INTEGER NOT NULL DEFAULT 0,
  discount_rate INTEGER NOT NULL DEFAULT 0,
  final_price_krw INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  toss_billing_key TEXT,
  toss_customer_key TEXT,
  toss_card_company TEXT,
  toss_card_number_masked TEXT,
  current_period_start DATETIME,
  current_period_end DATETIME,
  next_billing_date DATETIME,
  cancelled_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 결제 내역 테이블
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subscription_id INTEGER,
  toss_payment_key TEXT,
  toss_order_id TEXT NOT NULL UNIQUE,
  toss_transaction_key TEXT,
  amount_krw INTEGER NOT NULL,
  vat_krw INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT,
  card_company TEXT,
  card_number_masked TEXT,
  reason TEXT,
  refunded_at DATETIME,
  refund_amount_krw INTEGER,
  refund_reason TEXT,
  receipt_url TEXT,
  failure_code TEXT,
  failure_message TEXT,
  raw_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME
);

-- 4. 카카오 알림톡 로그
CREATE TABLE IF NOT EXISTS kakao_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  phone TEXT NOT NULL,
  template_code TEXT NOT NULL,
  message_title TEXT,
  message_body TEXT,
  button_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  kakao_message_id TEXT,
  failure_reason TEXT,
  sent_at DATETIME,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 쿠폰 테이블
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent',
  discount_value INTEGER NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from DATETIME,
  valid_until DATETIME,
  applies_to TEXT,
  is_lifetime INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 쿠폰 사용 기록
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  subscription_id INTEGER,
  redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. 기본 쿠폰 시드
INSERT OR IGNORE INTO coupons (code, description, discount_type, discount_value, applies_to, is_lifetime, is_active)
VALUES ('PATIENTFUNNEL50', '페이션트 퍼널 수료생 50% 평생 할인', 'percent', 50, 'all', 1, 1);

INSERT OR IGNORE INTO coupons (code, description, discount_type, discount_value, applies_to, is_lifetime, is_active)
VALUES ('BETA100', '베타 첫 달 100% 무료', 'percent', 100, 'all', 0, 1);

INSERT OR IGNORE INTO coupons (code, description, discount_type, discount_value, applies_to, is_lifetime, is_active)
VALUES ('LAUNCH30', '런칭 첫 3개월 30% 할인', 'percent', 30, 'all', 0, 1);
