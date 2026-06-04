-- Run this in Supabase SQL Editor

-- Ideas: add approval status
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- Comments: add approval status
ALTER TABLE comments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- Enable RLS on both so anon can read approved only (optional, for future)
-- For now, the leaderboard reads all with status='approved'
