-- Stir It Up: Matching Pipeline, Moderation & Reporting, and Scheduled Refresh
-- Migration: 002_matching_moderation_refresh.sql

-- 1. Rejected Image Matches: Prevents repeatedly suggesting or auto-matching rejected/mismatched portraits
CREATE TABLE IF NOT EXISTS rejected_image_matches (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT,
  url TEXT NOT NULL,
  reason TEXT,
  rejected_by TEXT DEFAULT 'system',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rejected_matches_person ON rejected_image_matches(person_id);
CREATE INDEX IF NOT EXISTS idx_rejected_matches_url ON rejected_image_matches(url);
CREATE INDEX IF NOT EXISTS idx_rejected_matches_ext ON rejected_image_matches(provider, external_id);

-- 2. Catalog Reports & Takedowns: For copyright, privacy, non-consensual images, or incorrect identities
CREATE TABLE IF NOT EXISTS catalog_reports (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('person', 'image')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  reporter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  action_taken TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON catalog_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON catalog_reports(target_type, target_id);

-- 3. Job Locks: Ensures distributed job locking for scheduled catalog refreshes and provider quota safety
CREATE TABLE IF NOT EXISTS job_locks (
  lock_name TEXT PRIMARY KEY,
  locked_by TEXT NOT NULL,
  acquired_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- 4. Alter People Table to add refresh metadata
ALTER TABLE people ADD COLUMN last_refreshed_at TEXT;
ALTER TABLE people ADD COLUMN refresh_error TEXT;

-- 5. Alter Person Images Table to add revalidation metadata and broken link detection
ALTER TABLE person_images ADD COLUMN last_checked_at TEXT;
ALTER TABLE person_images ADD COLUMN http_status INTEGER;
ALTER TABLE person_images ADD COLUMN is_broken INTEGER NOT NULL DEFAULT 0;
ALTER TABLE person_images ADD COLUMN failure_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_person_images_broken ON person_images(is_broken);
CREATE INDEX IF NOT EXISTS idx_person_images_checked ON person_images(last_checked_at);
