-- Stir It Up: Popularity Scoring, Demographics, and 32k High-Speed Indexes
-- Migration: 003_add_popularity_and_32k_indexes.sql

-- 1. Add popularity, country, birth_year, and occupations columns to people table
ALTER TABLE people ADD COLUMN popularity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE people ADD COLUMN country TEXT;
ALTER TABLE people ADD COLUMN birth_year INTEGER;
ALTER TABLE people ADD COLUMN occupations TEXT NOT NULL DEFAULT '[]';

-- 2. Indexes for fast game round sampling, difficulty tiering, and filtered search
CREATE INDEX IF NOT EXISTS idx_people_popularity ON people(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_people_category_pop ON people(category, popularity DESC);
CREATE INDEX IF NOT EXISTS idx_people_gender_pop ON people(gender, popularity DESC);
CREATE INDEX IF NOT EXISTS idx_people_cat_gender_pop ON people(category, gender, popularity DESC);
CREATE INDEX IF NOT EXISTS idx_people_birth_year ON people(birth_year);
