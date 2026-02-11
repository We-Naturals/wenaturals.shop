-- Migration for Universal Section Visibility (Phase 19)
-- Adds 'visible: true' to all major CMS sections to support toggling

-- 1. Updates Home sections (Hero & Marquee)
UPDATE site_config
SET value = jsonb_set(
    jsonb_set(value, '{visible}', 'true'::jsonb, true),
    '{marquee, visible}', 'true'::jsonb, true
)
WHERE key = 'content_homepage';

-- 2. Updates Philosophy
UPDATE site_config
SET value = jsonb_set(value, '{visible}', 'true'::jsonb, true)
WHERE key = 'content_philosophy';

-- 3. Updates Featured
UPDATE site_config
SET value = jsonb_set(value, '{visible}', 'true'::jsonb, true)
WHERE key = 'content_featured';

-- 4. Updates Journal
UPDATE site_config
SET value = jsonb_set(value, '{visible}', 'true'::jsonb, true)
WHERE key = 'content_journal';

-- 5. Updates Testimonials (Also restructures to object if it was an array)
UPDATE site_config
SET value = CASE 
    WHEN jsonb_typeof(value) = 'array' THEN 
        jsonb_build_object('visible', true, 'items', value)
    ELSE 
        jsonb_set(value, '{visible}', 'true'::jsonb, true)
END
WHERE key = 'content_testimonials';
