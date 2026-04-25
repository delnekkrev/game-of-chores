-- ============================================================
--  SETUP_DB.sql
--  Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)
--  This replaces the old tables — it only creates one new table.
-- ============================================================

-- 1. Create the daily_completions table
CREATE TABLE IF NOT EXISTS daily_completions (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id      TEXT        NOT NULL,
  date_id      TEXT        NOT NULL,        -- format: YYYY-MM-DD  e.g. "2026-04-25"
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, date_id)                -- prevents double-checking the same task in a day
);

-- 2. Enable Row Level Security (required for anon access)
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to read completions (parent view)
CREATE POLICY "allow_select" ON daily_completions
  FOR SELECT USING (true);

-- 4. Allow anyone to insert completions (kid checking tasks)
CREATE POLICY "allow_insert" ON daily_completions
  FOR INSERT WITH CHECK (true);

-- 5. Allow anyone to delete completions (kid un-checking tasks)
CREATE POLICY "allow_delete" ON daily_completions
  FOR DELETE USING (true);

-- ============================================================
--  That's it! The app is fully ready once this runs.
--  The old tables (players, tasks, completions, weekly_scores)
--  can be left alone or deleted — they're no longer used.
-- ============================================================
