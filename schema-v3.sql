-- Enable RLS on submission_history and set explicit policies
ALTER TABLE submission_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for leaderboard)
CREATE POLICY "select_all" ON submission_history
  FOR SELECT USING (true);

-- Allow anyone to insert (needed for MUSHclient plugin + web import)
CREATE POLICY "insert_all" ON submission_history
  FOR INSERT WITH CHECK (true);

-- Deny update/delete by default (RLS blocks these since no policy allows them)
