-- Stir It Up: People Catalog, Images, and Community Submissions Migration
-- Migration: 001_create_people_and_images.sql

-- 1. People table: Central unified people entity model
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('female', 'male', 'non-binary', 'other', 'unknown')),
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT NOT NULL DEFAULT '[]',
  primary_image_id TEXT,
  provider TEXT NOT NULL DEFAULT 'local',
  external_id TEXT,
  description TEXT,
  aliases TEXT NOT NULL DEFAULT '[]',
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged', 'removed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Unique constraint for external provider IDs (e.g. Wikidata QID per provider)
CREATE UNIQUE INDEX IF NOT EXISTS idx_people_provider_ext 
ON people(provider, external_id) 
WHERE external_id IS NOT NULL;

-- Indexes for category, name, and search
CREATE INDEX IF NOT EXISTS idx_people_category_name ON people(category, name);
CREATE INDEX IF NOT EXISTS idx_people_normalized_name ON people(normalized_name);
CREATE INDEX IF NOT EXISTS idx_people_category ON people(category);
CREATE INDEX IF NOT EXISTS idx_people_gender ON people(gender);
CREATE INDEX IF NOT EXISTS idx_people_moderation ON people(moderation_status);
CREATE INDEX IF NOT EXISTS idx_people_provider ON people(provider);
CREATE INDEX IF NOT EXISTS idx_people_created_at ON people(created_at);

-- 2. Person Images table: Supports multiple image sources per person with licensing and provenance
CREATE TABLE IF NOT EXISTS person_images (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  provider TEXT NOT NULL DEFAULT 'local',
  external_id TEXT,
  source_url TEXT,
  license TEXT NOT NULL DEFAULT 'unknown',
  license_url TEXT,
  author TEXT,
  attribution TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  width INTEGER,
  height INTEGER,
  mime_type TEXT,
  file_size INTEGER,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'failed')),
  verification_details TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'removed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Unique constraint for provider image IDs (e.g. Wikimedia Commons filename per provider)
CREATE UNIQUE INDEX IF NOT EXISTS idx_person_images_provider_ext 
ON person_images(provider, external_id) 
WHERE external_id IS NOT NULL;

-- Indexes for person image queries
CREATE INDEX IF NOT EXISTS idx_person_images_person_id ON person_images(person_id);
CREATE INDEX IF NOT EXISTS idx_person_images_primary ON person_images(person_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_person_images_verification ON person_images(verification_status);
CREATE INDEX IF NOT EXISTS idx_person_images_moderation ON person_images(moderation_status);

-- 3. Community Submissions table: Moderated submissions for people and candidate images
CREATE TABLE IF NOT EXISTS community_submissions (
  id TEXT PRIMARY KEY,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('person', 'image', 'edit', 'tag')),
  person_id TEXT REFERENCES people(id) ON DELETE SET NULL,
  proposed_data TEXT NOT NULL,
  submitter_name TEXT,
  submitter_ip TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'removed')),
  moderation_notes TEXT,
  reviewer_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comm_sub_status ON community_submissions(moderation_status);
CREATE INDEX IF NOT EXISTS idx_comm_sub_type ON community_submissions(submission_type);
CREATE INDEX IF NOT EXISTS idx_comm_sub_created ON community_submissions(created_at);
