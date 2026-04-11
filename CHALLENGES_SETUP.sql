-- Run this in your Supabase SQL editor to enable the Challenges feature

CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_name TEXT NOT NULL,
  title TEXT NOT NULL,
  points INTEGER NOT NULL,
  week_id TEXT NOT NULL,
  completed_by TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on challenges"
  ON challenges FOR ALL
  USING (true)
  WITH CHECK (true);
