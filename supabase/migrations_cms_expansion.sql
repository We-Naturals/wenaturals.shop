-- Insert default content for Philosophy, Featured, Journal, and Testimonials
INSERT INTO site_config (key, value)
VALUES
    ('content_philosophy', '{
        "title_top": "Science that",
        "title_highlight": "Whispers",
        "title_bottom": "to Nature.",
        "description": "We don''t just create skincare. We orchestrate a dialogue between the laboratory and the living earth. Our glass-encapsulated formulas are designed to dissolve the barrier between modern life and ancient biological wisdom.",
        "image": "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=1000",
        "stat_number": "99%",
        "stat_text_highlight": "Bio-availability",
        "stat_text": "measured across our glass-serum collection for maximum cellular absorption.",
        "points": [
            {
                "title": "Molecular Purity",
                "description": "Every drop is refined through glass-distillation to preserve the raw vitality of nature."
            },
            {
                "title": "Ethical Sourcing",
                "description": "We partner with local alchemists who harvest ingredients at the peak of their lunar cycle."
            },
            {
                "title": "Adaptive Hydration",
                "description": "Bio-intelligent serums that scan your skin''s moisture needs in real-time."
            }
        ]
    }'::jsonb),
    ('content_featured', '{
        "subheading": "The Collection",
        "heading_start": "Curated",
        "heading_highlight": "Essentials",
        "cta_text": "View Full Collection"
    }'::jsonb),
    ('content_journal', '{
        "heading_start": "The Ritual",
        "heading_highlight": "Journal",
        "subheading": "Insights into the alchemy of wellness, molecular science, and the art of intentional living.",
        "cta_text": "Enter the Journal"
    }'::jsonb),
    ('content_testimonials', '[
        {
            "author": "Elena R.",
            "role": "Dermatologist",
            "content": "I have never seen a formulation that respects the skin barrier while delivering such potent actives. It is not just skincare; it is a restoration of the skin''s natural intelligence.",
            "rating": 5
        },
        {
            "author": "Sarah M.",
            "role": "Verified Buyer",
            "content": "The changes in my skin texture were visible within three days. It feels like my face is finally drinking water after years of thirst.",
            "rating": 5
        },
        {
            "author": "Julian K.",
            "role": "Aesthetics Director",
            "content": "A masterclass in minimal intervention with maximal impact. The glass distillation process clearly preserves the bio-energy of the ingredients.",
            "rating": 5
        }
    ]'::jsonb)
ON CONFLICT (key) DO NOTHING;
