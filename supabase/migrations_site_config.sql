-- Create a table for site-wide configuration
CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed defaults for Footer Links
INSERT INTO site_config (key, value) VALUES 
('social_links', '{
    "instagram": "#",
    "youtube": "#",
    "mail": "mailto:hello@wenaturals.com",
    "amazon": "#",
    "flipkart": "#",
    "meesho": "#"
}') ON CONFLICT (key) DO NOTHING;

-- Seed defaults for YouTube Shorts
INSERT INTO site_config (key, value) VALUES 
('youtube_shorts', '[
    { "id": 1, "title": "Morning Ritual", "views": "1.2K", "thumbnail": "/placeholder.jpg", "url": "#" },
    { "id": 2, "title": "Texture Reveal", "views": "856", "thumbnail": "/placeholder.jpg", "url": "#" },
    { "id": 3, "title": "Our Philosophy", "views": "2.5K", "thumbnail": "/placeholder.jpg", "url": "#" },
    { "id": 4, "title": "Ingredient Spotlight", "views": "940", "thumbnail": "/placeholder.jpg", "url": "#" },
    { "id": 5, "title": "Sourcing Alchemy", "views": "1.8K", "thumbnail": "/placeholder.jpg", "url": "#" },
    { "id": 6, "title": "Customer Glow", "views": "3.4K", "thumbnail": "/placeholder.jpg", "url": "#" }
]') ON CONFLICT (key) DO NOTHING;
