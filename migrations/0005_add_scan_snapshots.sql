-- Day 1-B: 시계열 추적 시스템
-- 매주 자동 재스캔으로 도메인별 SEO 변화를 추적하기 위한 스냅샷 테이블

CREATE TABLE IF NOT EXISTS scan_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  scan_id INTEGER REFERENCES scans(id) ON DELETE SET NULL,
  -- 핵심 KPI
  keyword_count INTEGER DEFAULT 0,
  top3_count INTEGER DEFAULT 0,
  top10_count INTEGER DEFAULT 0,
  top30_count INTEGER DEFAULT 0,
  top100_count INTEGER DEFAULT 0,
  estimated_traffic INTEGER DEFAULT 0,
  -- 도메인 권위
  domain_rating INTEGER DEFAULT 0,
  backlinks_total INTEGER DEFAULT 0,
  referring_domains INTEGER DEFAULT 0,
  dofollow_ratio REAL DEFAULT 0,
  -- 롱테일
  longtail_count INTEGER DEFAULT 0,
  longtail_volume INTEGER DEFAULT 0,
  -- AI 점수 (AI 액션 가이드용)
  ai_score INTEGER DEFAULT 0,
  -- 메타
  snapshot_date DATE NOT NULL,            -- YYYY-MM-DD (주간 키)
  trigger_type TEXT DEFAULT 'cron',       -- 'cron' | 'manual' | 'rescan'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 도메인 + 날짜 복합 인덱스 (시계열 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_snapshots_domain_date ON scan_snapshots(domain, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_id ON scan_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_scan_id ON scan_snapshots(scan_id);
-- 한 도메인은 같은 날짜에 1개 스냅샷만 (UPSERT 가능)
CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshots_unique ON scan_snapshots(domain, snapshot_date);

-- AI 액션 가이드 캐시 (Day 1-F~H용 - KV 대신 D1 사용해서 시계열 보존)
CREATE TABLE IF NOT EXISTS ai_action_guides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  scan_id INTEGER REFERENCES scans(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  week_of DATE NOT NULL,                  -- 월요일 기준 주차 (YYYY-MM-DD)
  weekly_score INTEGER DEFAULT 0,         -- 0-100
  score_change INTEGER DEFAULT 0,         -- vs 지난 주
  top_strength TEXT,
  top_weakness TEXT,
  actions_json TEXT NOT NULL,             -- this_week_actions[] JSON
  roadmap_json TEXT,                      -- next_4_weeks_roadmap[] JSON
  model_used TEXT DEFAULT 'gpt-5.5',      -- gpt-5.5 | gpt-4o
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_guides_scan_id ON ai_action_guides(scan_id);
CREATE INDEX IF NOT EXISTS idx_ai_guides_domain_week ON ai_action_guides(domain, week_of DESC);

-- 시스템 설정 (OpenAI API 키 등 - personal memory 합의대로 DB 저장)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cron 실행 로그 (디버깅 + 어드민 대시보드용)
CREATE TABLE IF NOT EXISTS cron_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,                 -- 'weekly_rescan' | 'weekly_ai_guide'
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME,
  status TEXT DEFAULT 'running',          -- running | success | failed | partial
  domains_processed INTEGER DEFAULT 0,
  domains_failed INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  error_log TEXT
);

CREATE INDEX IF NOT EXISTS idx_cron_runs_started_at ON cron_runs(started_at DESC);
