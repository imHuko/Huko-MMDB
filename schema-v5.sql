-- Create pastes table for the MUSHclient pastebin plugin
CREATE TABLE IF NOT EXISTS pastes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow anyone to read (public pastebin)
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_all" ON pastes
  FOR SELECT USING (true);

-- Allow anyone to insert (plugin posts without auth)
CREATE POLICY "insert_all" ON pastes
  FOR INSERT WITH CHECK (true);
