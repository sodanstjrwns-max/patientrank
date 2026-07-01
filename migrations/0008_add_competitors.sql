-- ===================================================================
-- Migration 0008: 경쟁사 추적 + 변화 알림
-- Day 7-B 트랙: 유저가 등록한 경쟁사 도메인 자동 추적
-- ===================================================================

-- 1. 경쟁사 등록 테이블
CREATE TABLE IF NOT EXISTS competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  my_domain TEXT NOT NULL,         -- 내 병원 도메인
  competitor_domain TEXT NOT NULL, -- 경쟁사 도메인
  alias TEXT,                       -- "강남임플란트치과" 같은 표시 이름
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 경쟁사 변화 알림 (이번 주에 경쟁사가 어떻게 움직였는지)
CREATE TABLE IF NOT EXISTS competitor_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  competitor_domain TEXT NOT NULL,
  alert_type TEXT NOT NULL,        -- 'new_keyword' / 'lost_keyword' / 'rank_jump' / 'rank_drop'
  -- 변화 데이터
  keyword TEXT,
  old_rank INTEGER,
  new_rank INTEGER,
  change_magnitude INTEGER,        -- 절대값 변화량
  -- 카카오 발송 여부
  kakao_sent INTEGER NOT NULL DEFAULT 0,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
