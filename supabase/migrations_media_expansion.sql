-- Migration for Enhanced Media Management (Phase 18)

-- 1. Updates content_homepage to include 'media' array in 'hero' section
--    Uses existing hero image (currently hardcoded in FE, so we set a default here)
UPDATE site_config
SET value = jsonb_set(
    value,
    '{hero, media}',
    '[
        {"url": "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=1000", "type": "image", "alt": "Hero Image"},
        {"url": "https://cdn.coverr.co/videos/coverr-skincare-routine-2665/1080p.mp4", "type": "video", "alt": "Skincare Ritual"}
    ]'::jsonb
)
WHERE key = 'content_homepage';

-- 2. Migrate content_philosophy 'image' string to 'media' array
--    Takes the existing 'image' value and puts it into the new array structure
UPDATE site_config
SET value = (
    value - 'image' || 
    jsonb_build_object(
        'media', 
        jsonb_build_array(
            jsonb_build_object(
                'url', value->>'image',
                'type', 'image',
                'alt', 'Philosophy Image'
            )
        )
    )
)
WHERE key = 'content_philosophy' AND value ? 'image';
