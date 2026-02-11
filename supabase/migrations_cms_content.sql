-- CMS Content Migration

-- 1. Homepage Content (Hero, Marquee)
INSERT INTO site_config (key, value)
VALUES (
  'content_homepage',
  '{
    "hero": {
      "title_part_1": "Organic",
      "title_part_2": "Alchemy",
      "title_part_3": "for_the",
      "title_part_4": "Soul.",
      "subtext": "Experience the convergence of nature and science. Infused with rare botanicals our serums deliver pure essence directly to your skin.",
      "cta_primary_text": "SHOP COLLECTION",
      "cta_primary_link": "/shop",
      "cta_secondary_text": "OUR PHILOSOPHY",
      "cta_secondary_link": "/about"
    },
    "marquee": {
      "text": "We Naturals",
      "duration": 40
    }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- 2. Global Content (Navbar, Footer)
INSERT INTO site_config (key, value)
VALUES (
  'content_global',
  '{
    "navbar": {
      "links": [
        { "label": "Shop", "href": "/shop" },
        { "label": "Categories", "href": "/shop" },
        { "label": "Blog", "href": "/blog" },
        { "label": "About", "href": "/about" }
      ]
    },
    "footer": {
      "newsletter_title": "Stay in the Glow.",
      "newsletter_text": "Join our ethical circle for exclusive alchemy releases.",
      "copyright_text": "© 2026 WE NATURALS"
    }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
