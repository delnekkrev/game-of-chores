-- Run this once in your Supabase SQL Editor to enable the Reactions feature

CREATE TABLE IF NOT EXISTS reactions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name  TEXT NOT NULL,
  target_name  TEXT NOT NULL,
  emoji        TEXT NOT NULL,
  message      TEXT DEFAULT '',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON reactions FOR ALL USING (true) WITH CHECK (true);
