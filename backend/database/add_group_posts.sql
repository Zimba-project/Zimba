-- Migration: add tables for group-specific posts
CREATE TABLE IF NOT EXISTS group_posts (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  type VARCHAR(32) NOT NULL, -- 'discussion' or 'poll'
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(16) DEFAULT 'approved', -- 'pending','approved','rejected'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_post_body (
  post_id INTEGER PRIMARY KEY REFERENCES group_posts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(1024),
  end_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_post_options (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES group_posts(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  votes INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_group_posts_group ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_status ON group_posts(status);
