-- Patient Rank Initial Schema
-- 국내 최초 의료기관 전용 구글 SEO 진단 SaaS

-- 사용자
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  clinic_name TEXT,
  specialty TEXT,
  plan TEXT DEFAULT 'free',
  plan_started_at DATETIME,
  plan_ends_at DATETIME,
  toss_customer_key TEXT,
  kakao_opt_in INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- 등록 도메인
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  domain TEXT NOT NULL,
  nickname TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);

-- 진단 이력 (비회원 포함)
CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  domain_id INTEGER REFERENCES domains(id),
  url TEXT NOT NULL,
  ip_hash TEXT,
  keyword_count INTEGER DEFAULT 0,
  top3_count INTEGER DEFAULT 0,
  top10_count INTEGER DEFAULT 0,
  top30_count INTEGER DEFAULT 0,
  top100_count INTEGER DEFAULT 0,
  estimated_traffic INTEGER DEFAULT 0,
  raw_data TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_domain_id ON scans(domain_id);
CREATE INDEX IF NOT EXISTS idx_scans_ip_hash ON scans(ip_hash);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);

-- 키워드 스냅샷
CREATE TABLE IF NOT EXISTS keyword_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scan_id INTEGER REFERENCES scans(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  rank INTEGER NOT NULL,
  search_volume INTEGER DEFAULT 0,
  ranked_url TEXT,
  etv REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_scan_id ON keyword_snapshots(scan_id);
CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_rank ON keyword_snapshots(rank);

-- 백링크
CREATE TABLE IF NOT EXISTS backlinks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER REFERENCES domains(id),
  source_url TEXT,
  target_url TEXT,
  anchor TEXT,
  domain_rank INTEGER,
  first_seen DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backlinks_domain_id ON backlinks(domain_id);

-- 주간 알림
CREATE TABLE IF NOT EXISTS weekly_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER REFERENCES domains(id),
  week_of DATE,
  new_keywords TEXT,
  risen_keywords TEXT,
  dropped_keywords TEXT,
  lost_keywords TEXT,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weekly_alerts_domain_id ON weekly_alerts(domain_id);
CREATE INDEX IF NOT EXISTS idx_weekly_alerts_week_of ON weekly_alerts(week_of);

-- 결제 이력
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  plan TEXT,
  amount INTEGER,
  toss_payment_key TEXT,
  status TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- 이메일 게이팅 리드 (비회원 → 리드 전환)
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scan_id INTEGER REFERENCES scans(id),
  email TEXT NOT NULL,
  clinic_name TEXT,
  specialty TEXT,
  doctor_name TEXT,
  kakao_opt_in INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_scan_id ON leads(scan_id);

-- 매직링크 토큰
CREATE TABLE IF NOT EXISTS magic_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
