-- Enable Row Level Security
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Footer and Homepage need this)
CREATE POLICY "Allow public read access" 
ON site_config FOR SELECT 
TO public 
USING (true);

-- Allow anonymous update access (Admin panel needs this to save)
-- Note: In a production app with real auth, this should be restricted to authenticated admins only.
CREATE POLICY "Allow anonymous update access" 
ON site_config FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);

-- Allow anonymous insert access (Admin panel needs this to add new keys if missing)
CREATE POLICY "Allow anonymous insert access" 
ON site_config FOR INSERT 
TO public 
WITH CHECK (true);
