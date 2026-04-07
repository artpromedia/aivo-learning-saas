-- Add preferred_language column to users and learners tables.
-- Defaults to 'en' for existing rows.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) NOT NULL DEFAULT 'en';

ALTER TABLE learners
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) NOT NULL DEFAULT 'en';
