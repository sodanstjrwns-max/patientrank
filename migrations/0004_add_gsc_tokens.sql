-- 0004: Google Search Console 연동 (프리미엄 기능)
-- GSC 사이트의 노출/클릭 키워드를 Search Analytics API로 가져오기 위해
-- user별로 refresh_token을 보관한다.

CREATE TABLE IF NOT EXISTS gsc_tokens (
  user_id INTEGER PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_site_url TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_gsc_tokens_expires ON gsc_tokens(expires_at);

-- GSC에서 가져온 키워드 캐시 (scan_id별, 프리미엄 유저 전용)
CREATE TABLE IF NOT EXISTS gsc_keyword_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scan_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  site_url TEXT NOT NULL,
  keyword TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  avg_position REAL DEFAULT 0,
  page_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scan_id) REFERENCES scans(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_gsc_snapshots_scan ON gsc_keyword_snapshots(scan_id);
CREATE INDEX IF NOT EXISTS idx_gsc_snapshots_keyword ON gsc_keyword_snapshots(keyword);
