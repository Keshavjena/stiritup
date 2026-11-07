-- A separate, inspectable question bank. Catalog data is unaffected.
CREATE TABLE IF NOT EXISTS question_bank (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('standard', 'challenge', 'spicy')),
  text TEXT NOT NULL CHECK (length(trim(text)) > 0),
  normalized_text TEXT NOT NULL,
  source TEXT NOT NULL,
  review_status TEXT NOT NULL CHECK (review_status IN ('legacy', 'generated', 'unreviewed', 'reviewed')),
  UNIQUE (game_id, mode, normalized_text)
);
CREATE INDEX IF NOT EXISTS idx_question_bank_deck ON question_bank(game_id, mode);
CREATE TABLE IF NOT EXISTS question_seed_versions (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);
