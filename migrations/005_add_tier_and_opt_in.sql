-- Stir It Up: Add Tier and Opt-In Classification for 18,000+ Curated Personalities
-- Migration: 005_add_tier_and_opt_in.sql

ALTER TABLE people ADD COLUMN tier TEXT NOT NULL DEFAULT 'A';
ALTER TABLE people ADD COLUMN opt_in INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_people_tier ON people(tier);
CREATE INDEX IF NOT EXISTS idx_people_opt_in ON people(opt_in);
CREATE INDEX IF NOT EXISTS idx_people_cat_optin ON people(category, opt_in);
CREATE INDEX IF NOT EXISTS idx_people_cat_tier ON people(category, tier);
