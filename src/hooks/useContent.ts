"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const DEFAULT_CONTENT = {
    content_homepage: {
        visible: true,
        hero: {
            title_part_1: "Nature's",
            title_part_2: "Blueprint",
            title_part_3: "Refined",
            title_part_4: "by Science",
            subtext: "Experience the fusion of molecular innovation and botanical purity. We create skincare that respects your biology.",
            cta_primary_text: "Shop Collection",
            cta_primary_link: "/shop",
            cta_secondary_text: "Our Philosophy",
            cta_secondary_link: "#about",
            media: [
                { url: "/hero-product.png", type: "image", alt: "Hero Product" }
            ],
            top_pill_text: "Reimagining Nature",
            purity_label: "Purity",
            purity_value: "100% Organic",
            result_label: "Result",
            result_value: "Clinically Proven"
        },
        marquee: {
            visible: true,
            text: "ORGANIC • SUSTAINABLE • CRUELTY-FREE • CLINICALLY PROVEN •",
            duration: 40
        }
    },
    content_marquee_top: {
        visible: true,
        text: "WE NATURALS • PURE • POTENT • PROVEN •",
        duration: 35
    },
    content_marquee_bottom: {
        visible: true,
        text: "ORGANIC • SUSTAINABLE • CRUELTY-FREE • CLINICALLY PROVEN •",
        duration: 40
    },
    content_global: {
        navbar: {
            logo_url: "/we_naturals_logo.png",
            links: [
                { label: "Shop", href: "/shop" },
                { label: "About", href: "/#about" },
                { label: "Journal", href: "/blog" }
            ]
        },
        footer: {
            logo_url: "/we_naturals_logo.png",
            newsletter_title: "Join the Inner Circle",
            newsletter_text: "Receive exclusive invites to our seasonal launches and wellness journals.",
            copyright_text: "© 2024 We Naturals. All rights reserved."
        }
    },
    content_philosophy: {
        visible: true,
        title_top: "Science that",
        title_highlight: "Whispers",
        title_bottom: "to Nature.",
        description: "We don't just create skincare. We orchestrate a dialogue between the laboratory and the living earth. Our glass-encapsulated formulas are designed to dissolve the barrier between modern life and ancient biological wisdom.",
        media: [
            { url: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=1000", type: "image", alt: "Philosophy" }
        ],
        stat_number: "99%",
        stat_text_highlight: "Bio-availability",
        stat_text: "measured across our glass-serum collection for maximum cellular absorption.",
        points: [
            {
                title: "Molecular Purity",
                description: "Every drop is refined through glass-distillation to preserve the raw vitality of nature."
            },
            {
                title: "Ethical Sourcing",
                description: "We partner with local alchemists who harvest ingredients at the peak of their lunar cycle."
            },
            {
                title: "Adaptive Hydration",
                description: "Bio-intelligent serums that scan your skin's moisture needs in real-time."
            }
        ]
    },
    content_featured: {
        visible: true,
        subheading: "The Collection",
        heading_start: "Curated",
        heading_highlight: "Essentials",
        cta_text: "View Full Collection"
    },
    content_journal: {
        visible: true,
        heading_start: "The Ritual",
        heading_highlight: "Journal",
        subheading: "Insights into the alchemy of wellness, molecular science, and the art of intentional living.",
        cta_text: "Enter the Journal",
        tag_label: "Editorial"
    },
    content_testimonials: {
        visible: true,
        subheading: "The Echoes",
        heading: "Client Rituals",
        items: [
            { author: "Elena R.", role: "Dermatologist", content: "I have never seen a formulation that respects the skin barrier while delivering such potent actives.", rating: 5 },
            { author: "Sarah M.", role: "Verified Buyer", content: "The changes in my skin texture were visible within three days.", rating: 5 },
            { author: "Julian K.", role: "Aesthetics Director", content: "A masterclass in minimal intervention with maximal impact.", rating: 5 }
        ]
    },
    content_pages: {
        shop: {
            title: "The Molecular Shop",
            description: "Explore our collection of bio-active serums and botanical distillations.",
            heading: "Curated Skincare",
            blocks: []
        },
        about: {
            title: "Behind the Glass",
            description: "Merging ancient biological wisdom with modern molecular science.",
            heading: "Our Story",
            blocks: [
                {
                    id: "about-1",
                    type: "hero",
                    content: {
                        heading: "Alchemy of the Earth",
                        subheading: "Where nature meets molecular science.",
                        image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80",
                        alignment: "center"
                    }
                },
                {
                    id: "about-2",
                    type: "rich_text",
                    content: {
                        html: "<p>We don't just formulate skincare; we engineer biological compatibility. Our process begins where others end—distilling potent botanicals into their most bio-available forms.</p>"
                    }
                },
                {
                    id: "about-3",
                    type: "image_text",
                    content: {
                        heading: "The Glass House",
                        text: "Our laboratories are designed to be as transparent as our ingredients. We believe in showing the process, from root to bottle.",
                        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80",
                        direction: "right"
                    }
                }
            ]
        },
        contact: {
            title: "Join the Dialogue",
            description: "Speak with our molecular specialists or visit our physical ateliers.",
            heading: "Get in Touch",
            blocks: []
        },
        faq: {
            title: "Biological FAQ",
            description: "Common inquiries about molecular purity and delivery.",
            heading: "Frequently Asked Questions",
            items: [
                { question: "Are your products 100% organic?", answer: "Yes, all our botanical distillates are certified organic and sustainably harvested." },
                { question: "How long does delivery take?", answer: "Standard delivery takes 3-5 business days. Express options are available at checkout." }
            ]
        }
    },
    content_categories: {
        visible: true,
        title_start: "The",
        title_highlight: "Collections",
        header_visible: true,
        media: []
    },
    youtube_shorts: {
        visible: true,
        title: "Visual Alchemy.",
        header_visible: true,
        marquee_visible: true,
        items: [],
        media: []
    },
    content_design_system: {
        primary_color: "#3b82f6", // Default blue-500
        border_radius: "0.75rem", // Default rounded-xl or 12px
        glass_opacity: 0.1,       // Default glass opacity
        glass_blur: "10px",       // Default backdrop blur
        font_heading: "Inter",
        font_body: "Inter"
    },
    content_navigation: {
        header: [
            { label: "Shop", href: "/shop", type: "internal" },
            { label: "About", href: "/#about", type: "internal" },
            { label: "Journal", href: "/blog", type: "internal" }
        ],
        footer: [
            { label: "Shop", href: "/shop", type: "internal" },
            { label: "About", href: "/#about", type: "internal" },
            { label: "Journal", href: "/blog", type: "internal" },
            { label: "Contact", href: "/contact", type: "internal" }
        ]
    },
    content_marketing: {
        announcement_bar: {
            enabled: true,
            text: "Free Shipping on Orders Over $100",
            link: "/shop",
            color: "#000000",
            dismissible: true
        },
        seo: {
            titleTemplate: "%s | We Naturals",
            defaultDescription: "Discover the fusion of molecular science and botanical purity. Premium skincare crafted for biological respect.",
            defaultImage: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=1200",
            jsonLd: {
                type: "Organization",
                name: "We Naturals",
                logo: "https://wenaturals.com/logo.png"
            }
        }
    },
    homepage_layout: [
        'hero',
        'marquee_top',
        'philosophy',
        'rituals',
        'shorts',
        'featured',
        'journal',
        'marquee_bottom',
        'categories'
    ],
    content_system: {
        maintenance_mode: false
    }
};

export function useContent(
    key: 'content_homepage' | 'content_global' | 'content_philosophy' | 'content_featured' | 'content_journal' | 'content_testimonials' | 'content_pages' | 'content_categories' | 'youtube_shorts' | 'content_design_system' | 'content_navigation' | 'content_marketing' | 'homepage_layout' | 'content_system' | 'content_marquee_top' | 'content_marquee_bottom',
    initialData?: any
) {
    const [content, setContent] = useState<any>(initialData || DEFAULT_CONTENT[key]);

    useEffect(() => {
        // If we don't have initialData, fetch it from Supabase
        if (!initialData) {
            const fetchContent = async () => {
                const supabase = createClient();
                const { data } = await supabase.from('site_config').select('value').eq('key', key).single();
                if (data?.value) {
                    setContent(data.value);
                }
            };
            fetchContent();
        }

        // Listen for real-time preview updates from Admin Panel
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'CMS_UPDATE_ALL') {
                if (event.data.data?.[key]) {
                    setContent(event.data.data[key]);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [key, initialData]);

    return content;
}
