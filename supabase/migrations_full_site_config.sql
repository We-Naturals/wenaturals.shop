-- 1. Create the table
CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Security (RLS)
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- 3. Allow Public Read (Everyone can see the links)
CREATE POLICY "Allow public read access" 
ON site_config FOR SELECT 
TO public 
USING (true);

-- 4. Allow Updates (Admin can save changes)
CREATE POLICY "Allow anonymous update access" 
ON site_config FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);

-- 5. Allow Inserts (Admin can add new configs)
CREATE POLICY "Allow anonymous insert access" 
ON site_config FOR INSERT 
TO public 
WITH CHECK (true);

-- 6. Seed Default Data (So the footer/shorts aren't empty)
INSERT INTO site_config (key, value) VALUES 
('social_links', '{
    "instagram": "#",
    "youtube": "#",
    "mail": "mailto:hello@wenaturals.com",
    "amazon": "#",
    "flipkart": "#",
    "meesho": "#"
}') ON CONFLICT (key) DO NOTHING;

INSERT INTO site_config (key, value) VALUES 
('youtube_shorts', '[]') ON CONFLICT (key) DO NOTHING;
