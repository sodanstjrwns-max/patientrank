-- M2: 매직링크 로그인 + 세션 관리 + 어드민 플래그

-- users.is_admin 컬럼 추가
ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- 세션 테이블 (JWT id 추적 + revoke 기능)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,              -- UUID, JWT의 jti claim
  user_id INTEGER NOT NULL REFERENCES users(id),
  user_agent TEXT,
  ip_hash TEXT,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 슈퍼 어드민 시드: sodanstjrwns@gmail.com
-- 이미 유저면 is_admin=1 업데이트, 없으면 삽입
INSERT INTO users (email, name, clinic_name, specialty, plan, is_admin, plan_started_at, plan_ends_at)
VALUES ('sodanstjrwns@gmail.com', '문석준', '서울비디치과', '치과', 'agency', 1,
        CURRENT_TIMESTAMP, '2099-12-31 23:59:59')
ON CONFLICT(email) DO UPDATE SET
  is_admin = 1,
  plan = 'agency',
  plan_ends_at = '2099-12-31 23:59:59';
