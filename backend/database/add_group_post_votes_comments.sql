-- Migration: add tables for group post votes and comments
CREATE TABLE IF NOT EXISTS group_post_votes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  option_id INTEGER REFERENCES group_post_options(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_post_votes_post ON group_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_post ON group_post_comments(post_id);
