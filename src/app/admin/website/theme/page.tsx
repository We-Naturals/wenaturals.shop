"use client";

import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    LayoutTemplate, Type, Palette, Monitor, Smartphone,
    Save, RotateCcw, Image as ImageIcon, ExternalLink,
    Bold, Italic, AlignLeft, ChevronDown, Plus, Trash2,
    Eye, EyeOff, Settings, Home, Layers, Users, FileText,
    Navigation, MousePointerClick, Megaphone, Shield, Grid,
    ShieldCheck, ListOrdered, Zap, Minus
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { MediaListEditor, MediaItem } from "@/components/admin/MediaListEditor";
import { ProductDescriptionEditor } from "@/components/admin/ProductDescriptionEditor";

const NAVIGATION_GROUPS = [
    {
        title: "Appearance & Growth",
        tabs: [
            { id: "design", label: "Design System", icon: Palette },
            { id: "layout_spacing", label: "Layout & Spacing", icon: Grid },
            { id: "ascension", label: "Ascension Controls", icon: ShieldCheck },
            { id: "performance", label: "Performance & Eco", icon: Zap },
            { id: "marketing", label: "Marketing & SEO", icon: Megaphone },
        ]
    },
    {
        title: "Site Navigation",
        tabs: [
            { id: "header", label: "Logo & Header", icon: AlignLeft },
            { id: "nav", label: "Main Menu Builder", icon: Navigation },
            { id: "footer", label: "Footer Info", icon: Type },
        ]
    },
    {
        title: "Homepage Canvas",
        tabs: [
            { id: "layout", label: "Section Order", icon: Layers },
            { id: "hero", label: "Hero Banner", icon: Home },
            { id: "philosophy", label: "Philosophy Block", icon: Type },
            { id: "sections", label: "Collections (Shop/Blog)", icon: LayoutTemplate },
            { id: "shorts", label: "Video Gallery", icon: ImageIcon },
            { id: "categories", label: "Category Spotlight", icon: Grid },
        ]
    },
    {
        title: "Audience",
        tabs: [
            { id: "testimonials", label: "Testimonials", icon: Users },
        ]
    },
    {
        title: "Page Content",
        tabs: [
            { id: "pages", label: "Core Pages", icon: FileText },
            { id: "legal", label: "Legal & Privacy", icon: Shield },
        ]
    },
    {
        title: "System",
        tabs: [
            { id: "system", label: "System Settings", icon: Settings },
        ]
    }
];

const SECTION_LABELS: Record<string, string> = {
    hero: "Hero Section",
    philosophy: "Philosophy",
    rituals: "Client Rituals",
    shorts: "Visual Alchemy (Shorts)",
    featured: "Featured Collection",
    journal: "Journal",
    testimonials: "Testimonials (Legacy)",
    categories: "Category Spotlight",
    marquee_top: "Top Marquee (Below Hero)",
    marquee_bottom: "Bottom Marquee (Footer)"
};

export default function ThemePage() {

    const [cmsData, setCmsData] = useState<any>({
        content_homepage: {
            hero: { media: [] },
            marquee: {} // Legacy
        },
        content_marquee_top: { visible: true, text: "", duration: 35 },
        content_marquee_bottom: { visible: true, text: "", duration: 40 },
        content_global: {
            navbar: { links: [] },
            footer: {}
        },
        content_philosophy: {
            points: [],
            media: []
        },
        youtube_shorts: {
            title: "Visual Alchemy.",
            header_visible: true,
            marquee_visible: true,
            visible: true,
            items: [],
            media: []
        },
        content_categories: {
            title_start: "The",
            title_highlight: "Collections",
            header_visible: true,
            visible: true,
            media: []
        },
        content_journal: {
            media: []
        },
        content_featured: {
            media: []
        },
        content_testimonials: {
            items: [],
            visible: true,
            header_visible: true,
            media: []
        },
        content_pages: {
            shop: {},
            about: {},
            contact: {}
        },
        content_design_system: {
            primary_color: "#3b82f6",
            border_radius: "0.75rem",
            glass_opacity: 0.1,
            glass_blur: "10px",
            font_heading: "Inter",
            font_body: "Inter"
        },
        content_navigation: {
            header: [],
            footer: []
        },
        content_marketing: {
            announcement_bar: { enabled: true, text: "", link: "", color: "#000000", dismissible: true },
            seo: { titleTemplate: "", defaultDescription: "", favicon: "", appleTouchIcon: "" }
        },
        homepage_layout: [
            'hero',
            'philosophy',
            'rituals',
            'shorts',
            'featured',
            'journal',
            'testimonials',
            'categories'
        ],
        content_system: {
            maintenance_mode: false
        },
        content_ascension: {
            manual_chrono_mode: null,
            particle_density: 1,
            wind_velocity: 1,
            shader_intensity: 1,
            shader_speed: 1,
            recursive_depth: 3,
            recursive_speed: 1,
            glow_intensity: 1
        },
        content_layout_spacing: {
            section_padding: "py-24",
            container_max_width: "max-w-7xl",
            item_gap: "gap-8"
        },
        content_performance: {
            eco_mode: false,
            particles_enabled: true,
            recursive_geometry_enabled: true,
            smooth_scroll_enabled: true,
            parallax_enabled: true,
            custom_cursor_enabled: true,
            tilt_enabled: true,
            marquee_enabled: true
        }
    });

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("design");
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
    const [refreshKey, setRefreshKey] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState<"edit" | "preview">("edit");

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const keys = [
                'content_homepage',
                'content_global',
                'content_philosophy',
                'content_featured',
                'content_journal',
                'content_testimonials',
                'content_pages',
                'youtube_shorts',
                'content_categories',
                'content_design_system',
                'content_navigation',
                'content_navigation',
                'content_marketing',
                'homepage_layout',
                'content_ascension',
                'content_performance',
                'content_marquee_top',
                'content_marquee_bottom'
            ];

            const { data } = await supabase
                .from('site_config')
                .select('key, value')
                .in('key', keys);

            if (data) {
                const newData: any = { ...cmsData };
                data.forEach((item: any) => {
                    let val = item.value;
                    if (!val) return; // Skip empty configs

                    // Migration: Convert legacy arrays to objects with an items key
                    if (item.key === 'youtube_shorts' && Array.isArray(val)) {
                        val = { ...(newData.youtube_shorts || {}), items: val };
                    }
                    if (item.key === 'content_testimonials' && Array.isArray(val)) {
                        val = { ...(newData.content_testimonials || {}), items: val };
                    }
                    newData[item.key] = val;
                });

                // Phase 2 Migration: Link legacy content_global navbar links to new content_navigation
                const globalLinks = newData.content_global?.navbar?.links;
                const currentHeader = newData.content_navigation?.header;

                if ((!currentHeader || currentHeader.length === 0) &&
                    (Array.isArray(globalLinks) && globalLinks.length > 0)) {
                    newData.content_navigation = {
                        ...(newData.content_navigation || {}),
                        header: globalLinks.filter((l: any) => l && l.visible !== false)
                    };
                }

                // Phase 2 Migration: Seed footer if empty
                if (!newData.content_navigation?.footer || newData.content_navigation.footer.length === 0) {
                    newData.content_navigation = {
                        ...(newData.content_navigation || {}),
                        footer: [
                            { label: 'Shop', href: '/shop' },
                            { label: 'Blog', href: '/blog' },
                            { label: 'About', href: '/about' },
                            { label: 'Contact', href: '/contact' }
                        ]
                    };
                }

                setCmsData(newData);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Sync state with preview iframe in real-time
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'CMS_UPDATE_ALL',
                data: cmsData
            }, "*");
        }
    }, [cmsData]);

    const handleIframeLoad = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'CMS_UPDATE_ALL',
                data: cmsData
            }, "*");
        }
    };



    const updateHome = (section: string, field: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_homepage: {
                ...prev.content_homepage,
                [section]: {
                    ...prev.content_homepage[section],
                    [field]: value
                }
            }
        }));
    };

    const updateGlobal = (section: string, field: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_global: {
                ...prev.content_global,
                [section]: {
                    ...prev.content_global[section],
                    [field]: value
                }
            }
        }));
    };

    const updatePhilosophy = (field: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_philosophy: {
                ...prev.content_philosophy,
                [field]: value
            }
        }));
    };

    const updateFeatured = (field: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_featured: {
                ...prev.content_featured,
                [field]: value
            }
        }));
    };

    const updateJournal = (field: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_journal: {
                ...prev.content_journal,
                [field]: value
            }
        }));
    };

    const updatePages = (page: string, field: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_pages: {
                ...prev.content_pages,
                [page]: {
                    ...prev.content_pages[page],
                    [field]: value
                }
            }
        }));
    };

    const updateLayoutSpacing = (key: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_layout_spacing: {
                ...(prev.content_layout_spacing || {}),
                [key]: value
            }
        }));
    };

    const updateDesignSystem = (key: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_design_system: {
                ...prev.content_design_system,
                [key]: value
            }
        }));
    };

    const updateAscension = (key: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_ascension: {
                ...(prev.content_ascension || {}),
                [key]: value
            }
        }));
    };

    const updateSection = (key: string, field: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    // Listen for messages from the preview iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SELECT_SECTION') {
                setActiveTab(event.data.section);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const getSectionVisibility = (sectionKey: string) => {
        // Special mapping for different content structures
        if (sectionKey === 'hero') return cmsData.content_homepage?.hero?.visible !== false;
        // if (sectionKey === 'testimonials') return cmsData.content_homepage?.marquee?.visible !== false; // Moved to separate configs

        const contentKey = {
            philosophy: 'content_philosophy',
            rituals: 'content_testimonials',
            shorts: 'youtube_shorts',
            featured: 'content_featured',
            journal: 'content_journal',
            categories: 'content_categories',
            marquee_top: 'content_marquee_top',
            marquee_bottom: 'content_marquee_bottom'
        }[sectionKey];

        if (!contentKey) return true;
        return cmsData[contentKey]?.visible !== false;
    };

    const toggleSectionVisibility = (sectionKey: string) => {
        setCmsData((prev: any) => {
            const newData = { ...prev };

            if (sectionKey === 'hero') {
                newData.content_homepage = {
                    ...prev.content_homepage,
                    hero: { ...prev.content_homepage?.hero, visible: prev.content_homepage?.hero?.visible === false ? true : false }
                };
            } else if (sectionKey === 'testimonials') {
                newData.content_homepage = {
                    ...prev.content_homepage,
                    marquee: { ...prev.content_homepage?.marquee, visible: prev.content_homepage?.marquee?.visible === false ? true : false }
                };
            } else {
                const contentKey = {
                    philosophy: 'content_philosophy',
                    rituals: 'content_testimonials',
                    shorts: 'youtube_shorts',
                    featured: 'content_featured',
                    journal: 'content_journal',
                    categories: 'content_categories',
                    marquee_top: 'content_marquee_top',
                    marquee_bottom: 'content_marquee_bottom'
                }[sectionKey];

                if (contentKey) {
                    newData[contentKey] = {
                        ...prev[contentKey],
                        visible: prev[contentKey]?.visible === false ? true : false
                    };
                }
            }
            return newData;
        });
    };

    const toggleVisibility = (contentKey: string) => {
        setCmsData((prev: any) => ({
            ...prev,
            [contentKey]: {
                ...prev[contentKey],
                visible: prev[contentKey]?.visible === false ? true : false
            }
        }));
    };

    const updateNavigation = (section: 'header' | 'footer', newItems: any[]) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_navigation: {
                ...prev.content_navigation,
                [section]: newItems
            }
        }));
    };

    const addNavItem = (section: 'header' | 'footer') => {
        setCmsData((prev: any) => {
            const current = prev.content_navigation?.[section] || [];
            const newItems = [...current, { label: 'New Link', href: '/', type: 'internal' }];
            return {
                ...prev,
                content_navigation: {
                    ...prev.content_navigation,
                    [section]: newItems
                }
            };
        });
    };

    const removeNavItem = (section: 'header' | 'footer', index: number) => {
        setCmsData((prev: any) => {
            const current = [...(prev.content_navigation?.[section] || [])];
            current.splice(index, 1);
            return {
                ...prev,
                content_navigation: {
                    ...prev.content_navigation,
                    [section]: current
                }
            };
        });
    };

    const updateNavItem = (section: 'header' | 'footer', index: number, field: string, value: string) => {
        setCmsData((prev: any) => {
            const current = [...(prev.content_navigation?.[section] || [])];
            if (current[index]) {
                current[index] = { ...current[index], [field]: value };
            }
            return {
                ...prev,
                content_navigation: {
                    ...prev.content_navigation,
                    [section]: current
                }
            };
        });
    };

    const updateMarketing = (section: string, field: string, value: any) => {
        setCmsData((prev: any) => ({
            ...prev,
            content_marketing: {
                ...prev.content_marketing,
                [section]: {
                    ...(prev.content_marketing?.[section as keyof typeof prev.content_marketing] || {}),
                    [field]: value
                }
            }
        }));
    };

    const updatePerformance = (field: string, value: any) => {
        setCmsData((prev: any) => {
            const newData = {
                ...prev,
                content_performance: {
                    ...(prev.content_performance || {}),
                    [field]: value
                }
            };

            // If toggling Eco Mode ON, disable all major animations
            if (field === 'eco_mode' && value === true) {
                newData.content_performance = {
                    ...newData.content_performance,
                    particles_enabled: false,
                    recursive_geometry_enabled: false,
                    smooth_scroll_enabled: false,
                    parallax_enabled: false,
                    custom_cursor_enabled: false,
                    tilt_enabled: false,
                    marquee_enabled: false
                };
            }

            return newData;
        });
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        setCmsData((prev: any) => {
            const newLayout = [...(prev.homepage_layout || [])];
            if (direction === 'up' && index > 0) {
                [newLayout[index], newLayout[index - 1]] = [newLayout[index - 1], newLayout[index]];
            } else if (direction === 'down' && index < newLayout.length - 1) {
                [newLayout[index], newLayout[index + 1]] = [newLayout[index + 1], newLayout[index]];
            }
            return { ...prev, homepage_layout: newLayout };
        });
    };

    const addBlock = (page: string, type: string) => {
        const newBlock = {
            id: `${page}-${Date.now()}`,
            type,
            content: {}
        };
        setCmsData((prev: any) => {
            const currentBlocks = prev.content_pages?.[page]?.blocks || [];
            return {
                ...prev,
                content_pages: {
                    ...prev.content_pages,
                    [page]: {
                        ...(prev.content_pages?.[page] || {}),
                        blocks: [...currentBlocks, newBlock]
                    }
                }
            };
        });
    };

    const updateBlock = (page: string, blockId: string, field: string, value: any) => {
        setCmsData((prev: any) => {
            const currentBlocks = prev.content_pages?.[page]?.blocks || [];
            const newBlocks = currentBlocks.map((b: any) =>
                b.id === blockId ? { ...b, content: { ...b.content, [field]: value } } : b
            );
            return {
                ...prev,
                content_pages: {
                    ...prev.content_pages,
                    [page]: {
                        ...(prev.content_pages?.[page] || {}),
                        blocks: newBlocks
                    }
                }
            };
        });
    };

    const removeBlock = (page: string, blockId: string) => {
        setCmsData((prev: any) => {
            const currentBlocks = prev.content_pages?.[page]?.blocks || [];
            return {
                ...prev,
                content_pages: {
                    ...prev.content_pages,
                    [page]: {
                        ...(prev.content_pages?.[page] || {}),
                        blocks: currentBlocks.filter((b: any) => b.id !== blockId)
                    }
                }
            };
        });
    };

    const moveBlock = (page: string, index: number, direction: 'up' | 'down') => {
        setCmsData((prev: any) => {
            const newBlocks = [...(prev.content_pages?.[page]?.blocks || [])];
            if (direction === 'up' && index > 0) {
                [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
            } else if (direction === 'down' && index < newBlocks.length - 1) {
                [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
            }
            return {
                ...prev,
                content_pages: {
                    ...prev.content_pages,
                    [page]: {
                        ...(prev.content_pages?.[page] || {}),
                        blocks: newBlocks
                    }
                }
            };
        });
    };

    const addFaqItem = () => {
        setCmsData((prev: any) => {
            const currentItems = prev.content_pages?.faq?.items || [];
            return {
                ...prev,
                content_pages: {
                    ...prev.content_pages,
                    faq: {
                        ...(prev.content_pages?.faq || {}),
                        items: [...currentItems, { question: 'New Question', answer: 'New Answer' }]
                    }
                }
            };
        });
    };

    const removeFaqItem = (index: number) => {
        setCmsData((prev: any) => {
            const currentItems = prev.content_pages?.faq?.items || [];
            return {
                ...prev,
                content_pages: {
                    ...prev.content_pages,
                    faq: {
                        ...(prev.content_pages?.faq || {}),
                        items: currentItems.filter((_: any, i: number) => i !== index)
                    }
                }
            };
        });
    };

    const updateFaqItem = (index: number, field: string, value: string) => {
        setCmsData((prev: any) => {
            const currentItems = [...(prev.content_pages?.faq?.items || [])];
            currentItems[index] = { ...currentItems[index], [field]: value };
            return {
                ...prev,
                content_pages: {
                    ...prev.content_pages,
                    faq: {
                        ...(prev.content_pages?.faq || {}),
                        items: currentItems
                    }
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const supabase = createClient();
        const updates = [
            { key: 'content_homepage', value: cmsData.content_homepage },
            { key: 'content_global', value: cmsData.content_global },
            { key: 'content_philosophy', value: cmsData.content_philosophy },
            { key: 'content_featured', value: cmsData.content_featured },
            { key: 'content_journal', value: cmsData.content_journal },
            { key: 'content_testimonials', value: cmsData.content_testimonials },
            { key: 'content_pages', value: cmsData.content_pages },
            { key: 'youtube_shorts', value: cmsData.youtube_shorts },
            { key: 'content_categories', value: cmsData.content_categories },
            { key: 'content_design_system', value: cmsData.content_design_system },
            { key: 'content_navigation', value: cmsData.content_navigation },
            { key: 'content_marketing', value: cmsData.content_marketing },
            { key: 'homepage_layout', value: cmsData.homepage_layout },
            { key: 'content_system', value: cmsData.content_system },
            { key: 'content_ascension', value: cmsData.content_ascension },
            { key: 'content_layout_spacing', value: cmsData.content_layout_spacing },
            { key: 'content_performance', value: cmsData.content_performance },
            { key: 'content_marquee_top', value: cmsData.content_marquee_top },
            { key: 'content_marquee_bottom', value: cmsData.content_marquee_bottom },
        ].filter(u => u.value !== undefined);

        const { error } = await supabase.from('site_config').upsert(updates);
        if (error) {
            console.error('Error saving:', JSON.stringify(error, null, 2));
            alert(`Failed to save changes: ${error.message || 'Unknown error'}`);
        } else {
            setRefreshKey(prev => prev + 1);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg lg:hidden text-zinc-400"
                    >
                        <ListOrdered className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center hidden xs:flex">
                        <span className="text-black font-bold text-lg">W</span>
                    </div>
                    <h1 className="font-bold text-[10px] md:text-sm tracking-widest uppercase truncate">Theme Editor</h1>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* View Toggle for small screens */}
                    <div className="lg:hidden flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setActiveView("edit")}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                activeView === "edit" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setActiveView("preview")}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                activeView === "preview" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            Live
                        </button>
                    </div>

                    <div className="bg-white/5 rounded-lg p-1 hidden sm:flex gap-1">
                        <button
                            onClick={() => setPreviewMode("desktop")}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                previewMode === "desktop" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPreviewMode("mobile")}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                previewMode === "mobile" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-white text-black px-3 md:px-6 py-2 rounded-lg font-bold text-[10px] md:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span className="hidden xs:inline">{saving ? "Saving..." : "Publish"}</span>
                    </button>
                </div>
            </header>

            <div className="pt-16 flex h-screen overflow-hidden">
                {/* Sidebar Controls - Drawer on mobile, Fixed on desktop */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 w-[280px] z-40 bg-zinc-950 border-r border-white/10 transition-transform duration-300 transform lg:relative lg:translate-x-0 flex flex-col h-full",
                    isSidebarOpen ? "translate-x-0 pt-16" : "-translate-x-full"
                )}>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-4">
                        <div className="space-y-6">
                            {NAVIGATION_GROUPS.map((group) => (
                                <div key={group.title} className="space-y-1 md:space-y-2">
                                    <h4 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2">
                                        {group.title}
                                    </h4>
                                    <div className="space-y-0.5">
                                        {group.tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setActiveTab(tab.id);
                                                        setIsSidebarOpen(false);
                                                        setActiveView("edit");
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
                                                        isActive
                                                            ? "bg-white/10 text-white shadow-lg"
                                                            : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "w-4 h-4 transition-colors",
                                                        isActive ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-400"
                                                    )} />
                                                    <span className="text-xs font-semibold tracking-wide">
                                                        {tab.label}
                                                    </span>
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="sidebar-active"
                                                            className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full"
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Info/Footer */}
                    <div className="p-4 border-t border-white/5 bg-black/40">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                <Settings className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider">Editor Mode</p>
                                <p className="text-[9px] text-zinc-500 font-mono">v1.2.4-PRO</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Content Area */}
                <div className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar bg-black/50 transition-all duration-300",
                    activeView === "preview" ? "hidden lg:block lg:flex-1" : "block"
                )}>
                    <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 pb-32">
                        <div className="space-y-16">

                            {/* GENERAL TAB */}
                            {activeTab === "general" && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Site Settings</h3>
                                    <p className="text-zinc-500 text-sm italic">Global site configurations like SEO defaults and analytic IDs will appear here.</p>
                                </div>
                            )}

                            {activeTab === "header" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                            <AlignLeft className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Logo & Identity</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate your brand's global entry point and navigation assets.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Navbar Logo URL</label>
                                            <input
                                                value={cmsData.content_global.navbar?.logo_url || ''}
                                                onChange={(e) => updateGlobal('navbar', 'logo_url', e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                placeholder="/logo.png"
                                            />
                                        </div>
                                        <div className="space-y-3">

                                            {cmsData.content_global.navbar?.links?.map((link: any, i: number) => (
                                                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                                    <input
                                                        value={link.label}
                                                        onChange={(e) => {
                                                            const newLinks = [...cmsData.content_global.navbar.links];
                                                            newLinks[i].label = e.target.value;
                                                            updateGlobal('navbar', 'links', newLinks);
                                                        }}
                                                        className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                        placeholder="Label"
                                                    />
                                                    <input
                                                        value={link.href}
                                                        onChange={(e) => {
                                                            const newLinks = [...cmsData.content_global.navbar.links];
                                                            newLinks[i].href = e.target.value;
                                                            updateGlobal('navbar', 'links', newLinks);
                                                        }}
                                                        className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                        placeholder="Link"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newLinks = [...cmsData.content_global.navbar.links];
                                                            newLinks[i].visible = newLinks[i].visible === false ? true : false;
                                                            updateGlobal('navbar', 'links', newLinks);
                                                        }}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            link.visible !== false ? "text-blue-400 bg-blue-400/10" : "text-zinc-600 hover:bg-white/5"
                                                        )}
                                                        title={link.visible !== false ? "Visible" : "Hidden"}
                                                    >
                                                        {link.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* HERO TAB */}
                            {activeTab === "hero" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                            <Home className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Hero Banner</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate the first contact and primary value proposition for your brand.</p>
                                        </div>
                                    </div>

                                    {/* Hero */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Hero Section Content</h3>
                                            <button
                                                onClick={() => toggleVisibility('content_homepage')}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.content_homepage?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                                title={cmsData.content_homepage?.visible !== false ? "Section Visible" : "Section Hidden"}
                                            >
                                                {cmsData.content_homepage?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Title Part 1</label>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.title_part_1 || ''}
                                                        onChange={(e) => updateHome('hero', 'title_part_1', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Part 2 (Gradient)</label>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.title_part_2 || ''}
                                                        onChange={(e) => updateHome('hero', 'title_part_2', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Part 3 (Italic)</label>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.title_part_3 || ''}
                                                        onChange={(e) => updateHome('hero', 'title_part_3', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Part 4</label>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.title_part_4 || ''}
                                                        onChange={(e) => updateHome('hero', 'title_part_4', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Top Decorative Pill</label>
                                                    <button
                                                        onClick={() => updateHome('hero', 'top_pill_visible', cmsData.content_homepage.hero?.top_pill_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_homepage.hero?.top_pill_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_homepage.hero?.top_pill_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input
                                                    value={cmsData.content_homepage.hero?.top_pill_text || ''}
                                                    onChange={(e) => updateHome('hero', 'top_pill_text', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    placeholder="Reimagining Nature"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Bio-Stat Label</label>
                                                        <button
                                                            onClick={() => updateHome('hero', 'purity_visible', cmsData.content_homepage.hero?.purity_visible === false ? true : false)}
                                                            className={cn("p-0.5 rounded transition-colors", cmsData.content_homepage.hero?.purity_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                        >
                                                            {cmsData.content_homepage.hero?.purity_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.purity_label || ''}
                                                        onChange={(e) => updateHome('hero', 'purity_label', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Bio-Stat Value</label>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.purity_value || ''}
                                                        onChange={(e) => updateHome('hero', 'purity_value', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Result Label</label>
                                                        <button
                                                            onClick={() => updateHome('hero', 'result_visible', cmsData.content_homepage.hero?.result_visible === false ? true : false)}
                                                            className={cn("p-0.5 rounded transition-colors", cmsData.content_homepage.hero?.result_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                        >
                                                            {cmsData.content_homepage.hero?.result_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.result_label || ''}
                                                        onChange={(e) => updateHome('hero', 'result_label', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Result Value</label>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.result_value || ''}
                                                        onChange={(e) => updateHome('hero', 'result_value', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Subtext</label>
                                                    <button
                                                        onClick={() => updateHome('hero', 'subtext_visible', cmsData.content_homepage.hero?.subtext_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_homepage.hero?.subtext_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_homepage.hero?.subtext_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={cmsData.content_homepage.hero?.subtext || ''}
                                                    onChange={(e) => updateHome('hero', 'subtext', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs h-20 resize-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Primary CTA</label>
                                                        <button
                                                            onClick={() => updateHome('hero', 'cta_primary_visible', cmsData.content_homepage.hero?.cta_primary_visible === false ? true : false)}
                                                            className={cn("p-0.5 rounded transition-colors", cmsData.content_homepage.hero?.cta_primary_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                        >
                                                            {cmsData.content_homepage.hero?.cta_primary_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.cta_primary_text || ''}
                                                        onChange={(e) => updateHome('hero', 'cta_primary_text', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Link</label>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.cta_primary_link || ''}
                                                        onChange={(e) => updateHome('hero', 'cta_primary_link', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Secondary CTA</label>
                                                        <button
                                                            onClick={() => updateHome('hero', 'cta_secondary_visible', cmsData.content_homepage.hero?.cta_secondary_visible === false ? true : false)}
                                                            className={cn("p-0.5 rounded transition-colors", cmsData.content_homepage.hero?.cta_secondary_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                        >
                                                            {cmsData.content_homepage.hero?.cta_secondary_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.cta_secondary_text || ''}
                                                        onChange={(e) => updateHome('hero', 'cta_secondary_text', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Link</label>
                                                    <input
                                                        value={cmsData.content_homepage.hero?.cta_secondary_link || ''}
                                                        onChange={(e) => updateHome('hero', 'cta_secondary_link', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5 space-y-4">
                                                <MediaListEditor
                                                    label="Background/Decor Media"
                                                    media={cmsData.content_homepage.hero?.bg_media || []}
                                                    onChange={(newMedia) => updateHome('hero', 'bg_media', newMedia)}
                                                />
                                                <MediaListEditor
                                                    label="Main Hero Visuals (Auto-Rotation)"
                                                    media={cmsData.content_homepage.hero?.media || []}
                                                    onChange={(newMedia) => updateHome('hero', 'media', newMedia)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Marquee */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Marquee</h3>
                                            <button
                                                onClick={() => {
                                                    const current = cmsData.content_homepage.marquee?.visible !== false;
                                                    updateHome('marquee', 'visible', !current);
                                                }}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.content_homepage.marquee?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                            >
                                                {cmsData.content_homepage.marquee?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Marquee Text</label>
                                                <input
                                                    value={cmsData.content_homepage.marquee?.text || ''}
                                                    onChange={(e) => updateHome('marquee', 'text', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold text-lg"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Animation Speed (s)</label>
                                                <input
                                                    type="number"
                                                    value={cmsData.content_homepage.marquee?.duration || 40}
                                                    onChange={(e) => updateHome('marquee', 'duration', parseInt(e.target.value))}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === PHILOSOPHY TAB === */}
                            {activeTab === "philosophy" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                            <LayoutTemplate className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Philosophy Block</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Articulate your brand's core values and mission-critical narrative.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Main Content</h3>
                                            <button
                                                onClick={() => toggleVisibility('content_philosophy')}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.content_philosophy?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                            >
                                                {cmsData.content_philosophy?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs text-zinc-500">Title Top</label>
                                                    <button
                                                        onClick={() => updatePhilosophy('header_visible', cmsData.content_philosophy?.header_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_philosophy?.header_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_philosophy?.header_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input type="text" value={cmsData.content_philosophy?.title_top || ""} onChange={(e) => updatePhilosophy('title_top', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Highlight</label>
                                                <input type="text" value={cmsData.content_philosophy?.title_highlight || ""} onChange={(e) => updatePhilosophy('title_highlight', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Title Bottom</label>
                                                <input type="text" value={cmsData.content_philosophy?.title_bottom || ""} onChange={(e) => updatePhilosophy('title_bottom', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-xs text-zinc-500">Description</label>
                                                <button
                                                    onClick={() => updatePhilosophy('description_visible', cmsData.content_philosophy?.description_visible === false ? true : false)}
                                                    className={cn("p-0.5 rounded transition-colors", cmsData.content_philosophy?.description_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                >
                                                    {cmsData.content_philosophy?.description_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <textarea rows={4} value={cmsData.content_philosophy?.description || ""} onChange={(e) => updatePhilosophy('description', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none" />
                                        </div>
                                        <div className="pt-6 border-t border-white/5 space-y-4">
                                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Stat Card</h3>
                                                <button
                                                    onClick={() => updatePhilosophy('stat_visible', cmsData.content_philosophy?.stat_visible === false ? true : false)}
                                                    className={cn("p-1 rounded-md transition-colors", cmsData.content_philosophy?.stat_visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                                >
                                                    {cmsData.content_philosophy?.stat_visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-zinc-500">Number Label (e.g. 100%)</label>
                                                    <input type="text" value={cmsData.content_philosophy?.stat_number || ""} onChange={(e) => updatePhilosophy('stat_number', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-zinc-500">Text Highlight</label>
                                                    <input type="text" value={cmsData.content_philosophy?.stat_text_highlight || ""} onChange={(e) => updatePhilosophy('stat_text_highlight', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Stat Description</label>
                                                <input type="text" value={cmsData.content_philosophy?.stat_text || ""} onChange={(e) => updatePhilosophy('stat_text', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Main Media</label>
                                                <button
                                                    onClick={() => updatePhilosophy('media_visible', cmsData.content_philosophy?.media_visible === false ? true : false)}
                                                    className={cn("p-0.5 rounded transition-colors", cmsData.content_philosophy?.media_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                >
                                                    {cmsData.content_philosophy?.media_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <MediaListEditor
                                                label=""
                                                media={cmsData.content_philosophy?.media || []}
                                                onChange={(newMedia) => updatePhilosophy('media', newMedia)}
                                            />
                                        </div>
                                    </div>
                                    <div className="h-px bg-zinc-800/50" />
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                            <Type className="w-4 h-4" /> Stats & Points
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Stat Number</label>
                                                <input type="text" value={cmsData.content_philosophy?.stat_number || ""} onChange={(e) => setCmsData({ ...cmsData, content_philosophy: { ...cmsData.content_philosophy, stat_number: e.target.value } })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Stat Text</label>
                                                <input type="text" value={cmsData.content_philosophy?.stat_text || ""} onChange={(e) => setCmsData({ ...cmsData, content_philosophy: { ...cmsData.content_philosophy, stat_text: e.target.value } })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                        </div>
                                        {/* Points Editing - Simplified for now */}
                                        {cmsData.content_philosophy?.points?.map((point: any, i: number) => (
                                            <div key={i} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg space-y-2">
                                                <div className="flex justify-between items-center text-xs text-zinc-500 uppercase tracking-wide">
                                                    <span>Point {i + 1}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newPoints = [...cmsData.content_philosophy.points];
                                                            newPoints[i].visible = newPoints[i].visible === false ? true : false;
                                                            setCmsData({ ...cmsData, content_philosophy: { ...cmsData.content_philosophy, points: newPoints } });
                                                        }}
                                                        className={cn(
                                                            "p-1 rounded transition-colors",
                                                            point.visible !== false ? "text-blue-400 bg-blue-400/10" : "text-zinc-600 hover:bg-white/5"
                                                        )}
                                                        title={point.visible !== false ? "Visible" : "Hidden"}
                                                    >
                                                        {point.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input type="text" value={point.title} onChange={(e) => {
                                                    const newPoints = [...cmsData.content_philosophy.points];
                                                    newPoints[i].title = e.target.value;
                                                    setCmsData({ ...cmsData, content_philosophy: { ...cmsData.content_philosophy, points: newPoints } });
                                                }} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" placeholder="Title" />
                                                <textarea rows={2} value={point.description} onChange={(e) => {
                                                    const newPoints = [...cmsData.content_philosophy.points];
                                                    newPoints[i].description = e.target.value;
                                                    setCmsData({ ...cmsData, content_philosophy: { ...cmsData.content_philosophy, points: newPoints } });
                                                }} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none" placeholder="Description" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* === COLLECTIONS TAB === */}
                            {activeTab === "sections" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                            <LayoutTemplate className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Collections (Shop & Blog)</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Manage your featured products and editorial journal sections.</p>
                                        </div>
                                    </div>

                                    {/* Featured Collection */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Featured Collection</h3>
                                            <button
                                                onClick={() => toggleVisibility('content_featured')}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.content_featured?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                            >
                                                {cmsData.content_featured?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {/* ... (rest of featured collection code) ... */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs text-zinc-500">Subheading</label>
                                                    <button
                                                        onClick={() => updateSection('content_featured', 'header_visible', cmsData.content_featured?.header_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_featured?.header_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_featured?.header_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input type="text" value={cmsData.content_featured?.subheading || ""} onChange={(e) => setCmsData({ ...cmsData, content_featured: { ...cmsData.content_featured, subheading: e.target.value } })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs text-zinc-500">CTA Text</label>
                                                    <button
                                                        onClick={() => updateSection('content_featured', 'cta_visible', cmsData.content_featured?.cta_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_featured?.cta_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_featured?.cta_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input type="text" value={cmsData.content_featured?.cta_text || ""} onChange={(e) => setCmsData({ ...cmsData, content_featured: { ...cmsData.content_featured, cta_text: e.target.value } })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs text-zinc-500 pr-1">Heading + Filters</label>
                                                    <button
                                                        onClick={() => updateSection('content_featured', 'categories_visible', cmsData.content_featured?.categories_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_featured?.categories_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_featured?.categories_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input type="text" value={cmsData.content_featured?.heading_start || ""} onChange={(e) => setCmsData({ ...cmsData, content_featured: { ...cmsData.content_featured, heading_start: e.target.value } })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Highlight</label>
                                                <input type="text" value={cmsData.content_featured?.heading_highlight || ""} onChange={(e) => setCmsData({ ...cmsData, content_featured: { ...cmsData.content_featured, heading_highlight: e.target.value } })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <MediaListEditor
                                                label="Background/Decor Media"
                                                media={cmsData.content_featured?.media || []}
                                                onChange={(newMedia) => updateSection('content_featured', 'media', newMedia)}
                                            />
                                        </div>
                                    </div>
                                    <div className="h-px bg-zinc-800/50" />
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                                <LayoutTemplate className="w-4 h-4" /> Ritual Journal
                                            </h3>
                                            <button
                                                onClick={() => toggleVisibility('content_journal')}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.content_journal?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                            >
                                                {cmsData.content_journal?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs text-zinc-500">Heading Start</label>
                                                    <button
                                                        onClick={() => updateSection('content_journal', 'header_visible', cmsData.content_journal?.header_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_journal?.header_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_journal?.header_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input type="text" value={cmsData.content_journal?.heading_start || ""} onChange={(e) => updateSection('content_journal', 'heading_start', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Highlight</label>
                                                <input type="text" value={cmsData.content_journal?.heading_highlight || ""} onChange={(e) => updateSection('content_journal', 'heading_highlight', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-xs text-zinc-500">Subheading</label>
                                                <button
                                                    onClick={() => updateSection('content_journal', 'subheading_visible', cmsData.content_journal?.subheading_visible === false ? true : false)}
                                                    className={cn("p-0.5 rounded transition-colors", cmsData.content_journal?.subheading_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                >
                                                    {cmsData.content_journal?.subheading_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <textarea rows={2} value={cmsData.content_journal?.subheading || ""} onChange={(e) => updateSection('content_journal', 'subheading', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none" />
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <MediaListEditor
                                                label="Background/Decor Media"
                                                media={cmsData.content_journal?.media || []}
                                                onChange={(newMedia) => updateSection('content_journal', 'media', newMedia)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-xs text-zinc-500">CTA Text</label>
                                                <button
                                                    onClick={() => updateSection('content_journal', 'cta_visible', cmsData.content_journal?.cta_visible === false ? true : false)}
                                                    className={cn("p-0.5 rounded transition-colors", cmsData.content_journal?.cta_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                >
                                                    {cmsData.content_journal?.cta_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <input type="text" value={cmsData.content_journal?.cta_text || ""} onChange={(e) => setCmsData({ ...cmsData, content_journal: { ...cmsData.content_journal, cta_text: e.target.value } })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-xs text-zinc-500">Tag Label (Editorial)</label>
                                                <button
                                                    onClick={() => updateSection('content_journal', 'tag_visible', cmsData.content_journal?.tag_visible === false ? true : false)}
                                                    className={cn("p-0.5 rounded transition-colors", cmsData.content_journal?.tag_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                >
                                                    {cmsData.content_journal?.tag_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <input type="text" value={cmsData.content_journal?.tag_label || ""} onChange={(e) => updateSection('content_journal', 'tag_label', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* === CATEGORIES TAB === */}
                            {activeTab === "categories" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                            <Grid className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Category Spotlight</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Highlight your core product lines and navigational hubs.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Spotlight Settings</h3>
                                            <button
                                                onClick={() => toggleVisibility('content_categories')}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.content_categories?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                            >
                                                {cmsData.content_categories?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs text-zinc-500">Header Start</label>
                                                    <button
                                                        onClick={() => updateSection('content_categories', 'header_visible', cmsData.content_categories?.header_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_categories?.header_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_categories?.header_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input type="text" value={cmsData.content_categories?.title_start || "The"} onChange={(e) => updateSection('content_categories', 'title_start', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Highlight</label>
                                                <input type="text" value={cmsData.content_categories?.title_highlight || "Collections"} onChange={(e) => updateSection('content_categories', 'title_highlight', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <MediaListEditor
                                                label="Background/Decor Media"
                                                media={cmsData.content_categories?.media || []}
                                                onChange={(newMedia) => updateSection('content_categories', 'media', newMedia)}
                                            />
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* === SHORTS TAB === */}
                            {activeTab === "shorts" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                                            <ImageIcon className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Video Shorts</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Embed immersive vertical narratives and visual alchemy.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Gallery Visibility</h3>
                                            <button
                                                onClick={() => toggleVisibility('youtube_shorts')}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.youtube_shorts?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                            >
                                                {cmsData.youtube_shorts?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs text-zinc-500">Section Header</label>
                                                    <button
                                                        onClick={() => updateSection('youtube_shorts', 'header_visible', cmsData.youtube_shorts?.header_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.youtube_shorts?.header_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.youtube_shorts?.header_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input type="text" value={cmsData.youtube_shorts?.title || "Visual Alchemy."} onChange={(e) => updateSection('youtube_shorts', 'title', e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-xs text-zinc-500">Videos/Marquee</label>
                                                    <button
                                                        onClick={() => updateSection('youtube_shorts', 'marquee_visible', cmsData.youtube_shorts?.marquee_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.youtube_shorts?.marquee_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.youtube_shorts?.marquee_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-zinc-500 leading-tight">Controls the visibility of the video cards and scrolling marquee.</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <MediaListEditor
                                                label="Background/Decor Media"
                                                media={cmsData.youtube_shorts?.media || []}
                                                onChange={(newMedia) => updateSection('youtube_shorts', 'media', newMedia)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === MARQUEE TOP TAB === */}
                            {activeTab === "marquee_top" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                                            <Minus className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Top Marquee</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Customize the scrolling text below the Hero section.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Settings</h3>
                                            <button
                                                onClick={() => toggleVisibility('content_marquee_top')}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.content_marquee_top?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                            >
                                                {cmsData.content_marquee_top?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Marquee Text</label>
                                                <input
                                                    type="text"
                                                    value={cmsData.content_marquee_top?.text || ""}
                                                    onChange={(e) => setCmsData({
                                                        ...cmsData,
                                                        content_marquee_top: { ...cmsData.content_marquee_top, text: e.target.value }
                                                    })}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Animation Speed (s)</label>
                                                <input
                                                    type="number"
                                                    value={cmsData.content_marquee_top?.duration || 35}
                                                    onChange={(e) => setCmsData({
                                                        ...cmsData,
                                                        content_marquee_top: { ...cmsData.content_marquee_top, duration: parseInt(e.target.value) }
                                                    })}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === MARQUEE BOTTOM TAB === */}
                            {activeTab === "marquee_bottom" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20">
                                            <Minus className="w-6 h-6 text-pink-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Bottom Marquee</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Customize the scrolling text above the Footer.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Settings</h3>
                                            <button
                                                onClick={() => toggleVisibility('content_marquee_bottom')}
                                                className={cn("p-1 rounded-md transition-colors", cmsData.content_marquee_bottom?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                            >
                                                {cmsData.content_marquee_bottom?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Marquee Text</label>
                                                <input
                                                    type="text"
                                                    value={cmsData.content_marquee_bottom?.text || ""}
                                                    onChange={(e) => setCmsData({
                                                        ...cmsData,
                                                        content_marquee_bottom: { ...cmsData.content_marquee_bottom, text: e.target.value }
                                                    })}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Animation Speed (s)</label>
                                                <input
                                                    type="number"
                                                    value={cmsData.content_marquee_bottom?.duration || 40}
                                                    onChange={(e) => setCmsData({
                                                        ...cmsData,
                                                        content_marquee_bottom: { ...cmsData.content_marquee_bottom, duration: parseInt(e.target.value) }
                                                    })}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === TESTIMONIALS TAB === */}
                            {activeTab === "testimonials" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Client Rituals</h3>
                                                <button
                                                    onClick={() => toggleVisibility('content_testimonials')}
                                                    className={cn("p-1 rounded-md transition-colors", cmsData.content_testimonials?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                                                >
                                                    {cmsData.content_testimonials?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Subheading</label>
                                                    <button
                                                        onClick={() => updateSection('content_testimonials', 'header_visible', cmsData.content_testimonials?.header_visible === false ? true : false)}
                                                        className={cn("p-0.5 rounded transition-colors", cmsData.content_testimonials?.header_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    >
                                                        {cmsData.content_testimonials?.header_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                <input
                                                    value={cmsData.content_testimonials?.subheading || ''}
                                                    onChange={(e) => updateSection('content_testimonials', 'subheading', e.target.value)}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                    placeholder="The Echoes"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Heading</label>
                                                <input
                                                    value={cmsData.content_testimonials?.heading || ''}
                                                    onChange={(e) => updateSection('content_testimonials', 'heading', e.target.value)}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                    placeholder="Client Rituals"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <MediaListEditor
                                                label="Section Decor Media"
                                                media={cmsData.content_testimonials?.media || []}
                                                onChange={(newMedia) => updateSection('content_testimonials', 'media', newMedia)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {(cmsData.content_testimonials?.items || []).map((t: any, i: number) => (
                                            <div key={i} className="relative group p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center px-1">
                                                            <label className="text-xs text-zinc-500">Author</label>
                                                            <button
                                                                onClick={() => {
                                                                    setCmsData((prev: any) => {
                                                                        const newItems = [...(prev.content_testimonials?.items || [])];
                                                                        if (newItems[i]) {
                                                                            newItems[i].visible = newItems[i].visible === false ? true : false;
                                                                        }
                                                                        return {
                                                                            ...prev,
                                                                            content_testimonials: {
                                                                                ...prev.content_testimonials,
                                                                                items: newItems
                                                                            }
                                                                        };
                                                                    });
                                                                }}
                                                                className={cn(
                                                                    "p-0.5 rounded transition-colors",
                                                                    t.visible !== false ? "text-blue-400" : "text-zinc-600"
                                                                )}
                                                                title={t.visible !== false ? "Visible" : "Hidden"}
                                                            >
                                                                {t.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </div>
                                                        <input type="text" value={t.author || ""} onChange={(e) => {
                                                            const newItems = [...cmsData.content_testimonials.items];
                                                            newItems[i].author = e.target.value;
                                                            updateSection('content_testimonials', 'items', newItems);
                                                        }} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-zinc-500">Role</label>
                                                        <input type="text" value={t.role || ""} onChange={(e) => {
                                                            const newItems = [...cmsData.content_testimonials.items];
                                                            newItems[i].role = e.target.value;
                                                            updateSection('content_testimonials', 'items', newItems);
                                                        }} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <label className="text-xs text-zinc-500">Content</label>
                                                    <textarea rows={2} value={t.content || ""} onChange={(e) => {
                                                        const newItems = [...cmsData.content_testimonials.items];
                                                        newItems[i].content = e.target.value;
                                                        updateSection('content_testimonials', 'items', newItems);
                                                    }} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none" />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs text-zinc-500">Rating (1-5)</label>
                                                    <input type="number" min="1" max="5" value={t.rating || 5} onChange={(e) => {
                                                        const newItems = [...cmsData.content_testimonials.items];
                                                        newItems[i].rating = parseInt(e.target.value);
                                                        updateSection('content_testimonials', 'items', newItems);
                                                    }} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" />
                                                </div>
                                            </div>
                                        ))}

                                        {(!cmsData.content_testimonials?.items || cmsData.content_testimonials.items.length === 0) && (
                                            <div className="text-center py-8 text-zinc-600 text-sm">
                                                No testimonials added yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "footer" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                                            <Type className="w-6 h-6 text-zinc-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Footer Info</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Manage the global footer content, newsletter, and legal copyright.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Footer Logo URL</label>
                                            <input
                                                value={cmsData.content_global.footer?.logo_url || ''}
                                                onChange={(e) => updateGlobal('footer', 'logo_url', e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                placeholder="/logo.png"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Newsletter Title</label>
                                                <button
                                                    onClick={() => updateGlobal('footer', 'newsletter_visible', cmsData.content_global.footer?.newsletter_visible === false ? true : false)}
                                                    className={cn("p-0.5 rounded transition-colors", cmsData.content_global.footer?.newsletter_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                    title={cmsData.content_global.footer?.newsletter_visible !== false ? "Visible" : "Hidden"}
                                                >
                                                    {cmsData.content_global.footer?.newsletter_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <input
                                                value={cmsData.content_global.footer?.newsletter_title || ''}
                                                onChange={(e) => updateGlobal('footer', 'newsletter_title', e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Newsletter Text</label>
                                            <textarea
                                                value={cmsData.content_global.footer?.newsletter_text || ''}
                                                onChange={(e) => updateGlobal('footer', 'newsletter_text', e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs h-24 resize-none text-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Copyright Text</label>
                                            <input
                                                value={cmsData.content_global.footer?.copyright_text || ''}
                                                onChange={(e) => updateGlobal('footer', 'copyright_text', e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "pages" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                            <FileText className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Core Pages</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Refine the metadata and unique block content for your internal pages.</p>
                                        </div>
                                    </div>
                                    {['shop', 'about', 'contact', 'faq'].map((page) => (
                                        <div key={page} className="space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">{page.toUpperCase()} Page</h3>
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Browser Title</label>
                                                    <input
                                                        value={cmsData.content_pages?.[page]?.title || ''}
                                                        onChange={(e) => updatePages(page, 'title', e.target.value)}
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Hero Heading</label>
                                                    <input
                                                        value={cmsData.content_pages?.[page]?.heading || ''}
                                                        onChange={(e) => updatePages(page, 'heading', e.target.value)}
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Description</label>
                                                    <textarea
                                                        value={cmsData.content_pages?.[page]?.description || ''}
                                                        onChange={(e) => updatePages(page, 'description', e.target.value)}
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs h-16 resize-none text-white"
                                                    />
                                                </div>
                                                <div className="pt-4 border-t border-white/5">
                                                    <MediaListEditor
                                                        label="Hero Background Media"
                                                        media={cmsData.content_pages?.[page]?.media || []}
                                                        onChange={(newMedia) => updatePages(page, 'media', newMedia)}
                                                    />
                                                </div>

                                                {/* BLOCKS EDITOR */}
                                                {(cmsData.content_pages?.[page]?.blocks || []).length > 0 || page === 'about' ? (
                                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-[10px] uppercase text-zinc-500 font-bold">Content Blocks</h4>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => addBlock(page, 'rich_text')}
                                                                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors"
                                                                >
                                                                    + Text
                                                                </button>
                                                                <button
                                                                    onClick={() => addBlock(page, 'hero')}
                                                                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors"
                                                                >
                                                                    + Hero
                                                                </button>
                                                                <button
                                                                    onClick={() => addBlock(page, 'image_text')}
                                                                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors"
                                                                >
                                                                    + Img/Txt
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            {(cmsData.content_pages?.[page]?.blocks || []).map((block: any, index: number) => (
                                                                <div key={block.id} className="bg-zinc-900/30 border border-white/5 rounded-lg p-4 space-y-4 group">
                                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                                        <span className="text-xs font-bold uppercase text-zinc-400 bg-white/5 px-2 py-0.5 rounded">{block.type}</span>
                                                                        <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={() => moveBlock(page, index, 'up')} disabled={index === 0} className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-all hover:text-blue-400">
                                                                                <ChevronDown className="w-3 h-3 rotate-180" />
                                                                            </button>
                                                                            <button onClick={() => moveBlock(page, index, 'down')} disabled={index === (cmsData.content_pages?.[page]?.blocks?.length || 0) - 1} className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-all hover:text-blue-400">
                                                                                <ChevronDown className="w-3 h-3" />
                                                                            </button>
                                                                            <button onClick={() => removeBlock(page, block.id)} className="p-1 hover:bg-white/10 rounded transition-all hover:text-red-400 ml-2">
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Block Fields */}
                                                                    <div className="space-y-3">
                                                                        {block.type === 'hero' && (
                                                                            <>
                                                                                <input placeholder="Heading" value={block.content.heading || ''} onChange={(e) => updateBlock(page, block.id, 'heading', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-white focus:border-white/30 outline-none" />
                                                                                <input placeholder="Subheading" value={block.content.subheading || ''} onChange={(e) => updateBlock(page, block.id, 'subheading', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-zinc-400 focus:border-white/30 outline-none" />
                                                                                <input placeholder="Image URL" value={block.content.image || ''} onChange={(e) => updateBlock(page, block.id, 'image', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-xs font-mono text-zinc-500 focus:border-white/30 outline-none" />
                                                                            </>
                                                                        )}
                                                                        {block.type === 'rich_text' && (
                                                                            <textarea placeholder="HTML Content" value={block.content.html || ''} onChange={(e) => updateBlock(page, block.id, 'html', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded p-2 text-xs font-mono text-zinc-300 h-24 focus:border-white/20 outline-none" />
                                                                        )}
                                                                        {block.type === 'image_text' && (
                                                                            <>
                                                                                <input placeholder="Heading" value={block.content.heading || ''} onChange={(e) => updateBlock(page, block.id, 'heading', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-white focus:border-white/30 outline-none" />
                                                                                <textarea placeholder="Text Content" value={block.content.text || ''} onChange={(e) => updateBlock(page, block.id, 'text', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded p-2 text-xs text-zinc-300 h-16 focus:border-white/20 outline-none" />
                                                                                <input placeholder="Image URL" value={block.content.image || ''} onChange={(e) => updateBlock(page, block.id, 'image', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-xs font-mono text-zinc-500 focus:border-white/30 outline-none" />
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                                {page === 'contact' && (
                                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-[10px] uppercase text-zinc-500 font-bold">Direct Channels</h4>
                                                            <button
                                                                onClick={() => updatePages('contact', 'channels_visible', cmsData.content_pages?.contact?.channels_visible === false ? true : false)}
                                                                className={cn("p-0.5 rounded transition-colors", cmsData.content_pages?.contact?.channels_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                                title={cmsData.content_pages?.contact?.channels_visible !== false ? "Visible" : "Hidden"}
                                                            >
                                                                {cmsData.content_pages?.contact?.channels_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                placeholder="Email Address"
                                                                value={cmsData.content_pages?.contact?.email || ''}
                                                                onChange={(e) => updatePages('contact', 'email', e.target.value)}
                                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                            />
                                                            <input
                                                                placeholder="Phone Number"
                                                                value={cmsData.content_pages?.contact?.phone || ''}
                                                                onChange={(e) => updatePages('contact', 'phone', e.target.value)}
                                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                            />
                                                        </div>
                                                        <textarea
                                                            placeholder="Physical Address"
                                                            value={cmsData.content_pages?.contact?.address || ''}
                                                            onChange={(e) => updatePages('contact', 'address', e.target.value)}
                                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs h-16 resize-none text-white"
                                                        />
                                                        <div className="flex justify-between items-center mt-4">
                                                            <h4 className="text-[10px] uppercase text-zinc-500 font-bold">Customer Care Hours</h4>
                                                            <button
                                                                onClick={() => updatePages('contact', 'hours_visible', cmsData.content_pages?.contact?.hours_visible === false ? true : false)}
                                                                className={cn("p-0.5 rounded transition-colors", cmsData.content_pages?.contact?.hours_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                                                title={cmsData.content_pages?.contact?.hours_visible !== false ? "Visible" : "Hidden"}
                                                            >
                                                                {cmsData.content_pages?.contact?.hours_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex gap-2 items-center">
                                                                <span className="text-[10px] text-zinc-600 w-16">Mon-Fri</span>
                                                                <input
                                                                    placeholder="9:00 AM - 6:00 PM EST"
                                                                    value={cmsData.content_pages?.contact?.hours_weekdays || ''}
                                                                    onChange={(e) => updatePages('contact', 'hours_weekdays', e.target.value)}
                                                                    className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 items-center">
                                                                <span className="text-[10px] text-zinc-600 w-16">Saturday</span>
                                                                <input
                                                                    placeholder="10:00 AM - 4:00 PM EST"
                                                                    value={cmsData.content_pages?.contact?.hours_saturday || ''}
                                                                    onChange={(e) => updatePages('contact', 'hours_saturday', e.target.value)}
                                                                    className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 items-center">
                                                                <span className="text-[10px] text-zinc-600 w-16">Sunday</span>
                                                                <input
                                                                    placeholder="Rest & Reflection"
                                                                    value={cmsData.content_pages?.contact?.hours_sunday || ''}
                                                                    onChange={(e) => updatePages('contact', 'hours_sunday', e.target.value)}
                                                                    className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {page === 'faq' && (
                                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Questions & Answers</label>
                                                            <button
                                                                onClick={() => addFaqItem()}
                                                                className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors"
                                                            >
                                                                + Add Q&A
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {(cmsData.content_pages?.faq?.items || []).map((item: any, i: number) => (
                                                                <div key={i} className="p-3 bg-zinc-900/30 rounded-lg border border-white/5 space-y-2 group">
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="text-[10px] font-mono text-zinc-600">Entry #{i + 1}</span>
                                                                        <button
                                                                            onClick={() => removeFaqItem(i)}
                                                                            className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                    <input
                                                                        value={item.question}
                                                                        onChange={(e) => updateFaqItem(i, 'question', e.target.value)}
                                                                        placeholder="Question"
                                                                        className="w-full bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-white"
                                                                    />
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold px-1">Answer</label>
                                                                        <ProductDescriptionEditor
                                                                            content={item.answer}
                                                                            onChange={(html) => updateFaqItem(i, 'answer', html)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* LEGAL TAB */}
                            {activeTab === "legal" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                                            <ShieldCheck className="w-6 h-6 text-zinc-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Legal & Privacy</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Maintain your brand's regulatory integrity and trust benchmarks.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Privacy Policy</h3>
                                        <textarea
                                            value={cmsData.content_pages?.legal?.privacy_policy || ''}
                                            onChange={(e) => updatePages('legal', 'privacy_policy', e.target.value)}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 h-64 resize-y focus:border-blue-500/50 focus:bg-zinc-900 transition-all outline-none"
                                            placeholder="HTML or Markdown content for Privacy Policy..."
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Terms of Service</h3>
                                        <textarea
                                            value={cmsData.content_pages?.legal?.terms_of_service || ''}
                                            onChange={(e) => updatePages('legal', 'terms_of_service', e.target.value)}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 h-64 resize-y focus:border-blue-500/50 focus:bg-zinc-900 transition-all outline-none"
                                            placeholder="HTML or Markdown content for Terms of Service..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* DESIGN TAB */}
                            {activeTab === "design" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                                            <Palette className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Design System</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Fine-tune the visual DNA of your digital atelier.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Global Palette</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Primary Accent</label>
                                                <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/5">
                                                    <input
                                                        type="color"
                                                        value={cmsData.content_design_system?.primary_color || '#3b82f6'}
                                                        onChange={(e) => updateDesignSystem('primary_color', e.target.value)}
                                                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                                                    />
                                                    <div className="text-[10px] font-mono text-zinc-400 uppercase">
                                                        {cmsData.content_design_system?.primary_color || '#3b82f6'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Secondary Accent</label>
                                                <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/5">
                                                    <input
                                                        type="color"
                                                        value={cmsData.content_design_system?.secondary_color || '#10b981'}
                                                        onChange={(e) => updateDesignSystem('secondary_color', e.target.value)}
                                                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                                                    />
                                                    <div className="text-[10px] font-mono text-zinc-400 uppercase">
                                                        {cmsData.content_design_system?.secondary_color || '#10b981'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Surface Color</label>
                                                <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/5">
                                                    <input
                                                        type="color"
                                                        value={cmsData.content_design_system?.surface_color || '#09090b'}
                                                        onChange={(e) => updateDesignSystem('surface_color', e.target.value)}
                                                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                                                    />
                                                    <div className="text-[10px] font-mono text-zinc-400 uppercase">
                                                        {cmsData.content_design_system?.surface_color || '#09090b'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Glass Border</label>
                                                <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/5">
                                                    <input
                                                        type="color"
                                                        value={cmsData.content_design_system?.border_color || '#ffffff'}
                                                        onChange={(e) => updateDesignSystem('border_color', e.target.value)}
                                                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                                                    />
                                                    <div className="text-[10px] font-mono text-zinc-400 uppercase">
                                                        {cmsData.content_design_system?.border_color || '#ffffff'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Typography Engine */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Typography Engine</h3>
                                            <Type className="w-3.5 h-3.5 text-zinc-600" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Heading Font</label>
                                                <select
                                                    value={cmsData.content_design_system?.heading_font || 'Outfit'}
                                                    onChange={(e) => updateDesignSystem('heading_font', e.target.value)}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                                                >
                                                    <option value="Outfit">Outfit (Modern)</option>
                                                    <option value="Inter">Inter (Swiss)</option>
                                                    <option value="Playfair Display">Playfair (Elegant)</option>
                                                    <option value="Cormorant Garamond">Cormorant (Classical)</option>
                                                    <option value="JetBrains Mono">JetBrains (Technical)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Body Font</label>
                                                <select
                                                    value={cmsData.content_design_system?.body_font || 'Inter'}
                                                    onChange={(e) => updateDesignSystem('body_font', e.target.value)}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                                                >
                                                    <option value="Inter">Inter</option>
                                                    <option value="Roboto">Roboto</option>
                                                    <option value="Open Sans">Open Sans</option>
                                                    <option value="Montserrat">Montserrat</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] uppercase font-bold">
                                                    <span className="text-zinc-500">Heading Tracking</span>
                                                    <span className="text-blue-400">{cmsData.content_design_system?.heading_spacing || '0'}em</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-0.05"
                                                    max="0.5"
                                                    step="0.01"
                                                    value={cmsData.content_design_system?.heading_spacing || 0}
                                                    onChange={(e) => updateDesignSystem('heading_spacing', parseFloat(e.target.value))}
                                                    className="w-full accent-white"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Heading Case</label>
                                                    <div className="flex bg-white/5 p-1 rounded-lg">
                                                        {['none', 'uppercase'].map((c) => (
                                                            <button
                                                                key={c}
                                                                onClick={() => updateDesignSystem('heading_case', c)}
                                                                className={cn(
                                                                    "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                                                                    (cmsData.content_design_system?.heading_case || 'none') === c ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                                                )}
                                                            >
                                                                {c === 'none' ? 'Normal' : 'ALL CAPS'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Heading Weight</label>
                                                    <select
                                                        value={cmsData.content_design_system?.heading_weight || '700'}
                                                        onChange={(e) => updateDesignSystem('heading_weight', e.target.value)}
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                                                    >
                                                        <option value="300">Light</option>
                                                        <option value="400">Regular</option>
                                                        <option value="600">Semi Bold</option>
                                                        <option value="700">Bold</option>
                                                        <option value="900">Black</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Geometry */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Geometry</h3>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Corner Roundness</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['0px', '0.5rem', '0.75rem', '1.5rem', '9999px'].map((radius, i) => {
                                                    const labels = ['Sharp', 'Small', 'Medium', 'Large', 'Full'];
                                                    return (
                                                        <button
                                                            key={radius}
                                                            onClick={() => updateDesignSystem('border_radius', radius)}
                                                            className={cn(
                                                                "p-2 text-xs border rounded-lg transition-all",
                                                                cmsData.content_design_system?.border_radius === radius
                                                                    ? "bg-white text-black border-white"
                                                                    : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600"
                                                            )}
                                                        >
                                                            {labels[i]}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Glassmorphism */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Glassmorphism</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Opacity</label>
                                                    <span className="text-[10px] text-zinc-400">{Math.round((cmsData.content_design_system?.glass_opacity || 0.1) * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={cmsData.content_design_system?.glass_opacity || 0.1}
                                                    onChange={(e) => updateDesignSystem('glass_opacity', parseFloat(e.target.value))}
                                                    className="w-full accent-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Blur Intensity</label>
                                                    <span className="text-[10px] text-zinc-400">{cmsData.content_design_system?.glass_blur || '10px'}</span>
                                                </div>
                                                <select
                                                    value={cmsData.content_design_system?.glass_blur || '10px'}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        updateDesignSystem('glass_blur', val);
                                                    }}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                >
                                                    <option value="0px">None</option>
                                                    <option value="4px">Subtle (4px)</option>
                                                    <option value="10px">Standard (10px)</option>
                                                    <option value="20px">Heavy (20px)</option>
                                                    <option value="40px">Frosted (40px)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Preview */}
                                    <div className="p-6 rounded-2xl border border-white/10 bg-[url('/mesh-gradient.png')] bg-cover relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-black/50" />
                                        <div className="relative z-10 space-y-6">
                                            <h4 className="font-bold text-center uppercase tracking-[0.2em] text-sm">Live Preview</h4>

                                            <div className="grid grid-cols-1 gap-4">
                                                {/* Button Preview */}
                                                <button
                                                    style={{
                                                        backgroundColor: cmsData.content_design_system?.primary_color || '#3b82f6',
                                                        borderRadius: cmsData.content_design_system?.border_radius || '0.75rem'
                                                    }}
                                                    className="w-full py-3 font-bold text-sm uppercase tracking-widest text-white shadow-lg"
                                                >
                                                    Primary Action
                                                </button>

                                                {/* Card Preview */}
                                                <div
                                                    style={{
                                                        backgroundColor: `rgba(255, 255, 255, ${cmsData.content_design_system?.glass_opacity || 0.1})`,
                                                        backdropFilter: `blur(${cmsData.content_design_system?.glass_blur || '10px'})`,
                                                        borderRadius: cmsData.content_design_system?.border_radius || '0.75rem',
                                                        borderColor: 'rgba(255, 255, 255, 0.1)'
                                                    }}
                                                    className="p-6 border text-center"
                                                >
                                                    <h5 className="font-bold text-lg mb-2">Glass Card</h5>
                                                    <p className="text-xs text-zinc-300">This card reflects your global glassmorphism settings.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}


                            {activeTab === "layout_spacing" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                            <Grid className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Layout & Spacing</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate the structural rhythm and spatial harmony of your digital space.</p>
                                        </div>
                                    </div>

                                    {/* Section Spacing */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Structural Rhythm</h3>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Section Padding (Y)</label>
                                                        <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_layout_spacing?.section_padding_y || '24'}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="120"
                                                        step="4"
                                                        value={cmsData.content_layout_spacing?.section_padding_y || 24}
                                                        onChange={(e) => updateLayoutSpacing('section_padding_y', parseInt(e.target.value))}
                                                        className="w-full accent-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Grid Gap</label>
                                                        <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_layout_spacing?.grid_gap || '16'}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="64"
                                                        step="4"
                                                        value={cmsData.content_layout_spacing?.grid_gap || 16}
                                                        onChange={(e) => updateLayoutSpacing('grid_gap', parseInt(e.target.value))}
                                                        className="w-full accent-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Container Width</label>
                                                    <select
                                                        value={cmsData.content_layout_spacing?.container_width || 'max-w-7xl'}
                                                        onChange={(e) => updateLayoutSpacing('container_width', e.target.value)}
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                                                    >
                                                        <option value="max-w-5xl">Narrow (5xl)</option>
                                                        <option value="max-w-6xl">Standard (6xl)</option>
                                                        <option value="max-w-7xl">Default (7xl)</option>
                                                        <option value="max-w-[1440px]">Wide (1440px)</option>
                                                        <option value="max-w-full">Full Bleed</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Content Alignment</label>
                                                    <div className="flex bg-white/5 p-1 rounded-lg">
                                                        {['left', 'center'].map((a) => (
                                                            <button
                                                                key={a}
                                                                onClick={() => updateLayoutSpacing('content_alignment', a)}
                                                                className={cn(
                                                                    "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                                                                    (cmsData.content_layout_spacing?.content_alignment || 'center') === a ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                                                )}
                                                            >
                                                                {a}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Balance Preview */}
                                    <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col gap-4">
                                        <div className="text-[10px] uppercase font-bold text-zinc-500 mb-4">Spatial Balance Preview</div>
                                        <div
                                            className={cn(
                                                "mx-auto w-full transition-all duration-500 border border-white/10 bg-black/40 rounded-lg overflow-hidden",
                                                cmsData.content_layout_spacing?.container_width || 'max-w-7xl'
                                            )}
                                        >
                                            <div
                                                className="w-full bg-blue-500/10 border-b border-blue-500/20 text-[8px] flex items-center justify-center font-mono py-1"
                                                style={{ height: `${cmsData.content_layout_spacing?.section_padding_y || 24}px` }}
                                            >
                                                PADDING-Y: {cmsData.content_layout_spacing?.section_padding_y || 24}PX
                                            </div>
                                            <div className="p-4 grid grid-cols-3" style={{ gap: `${cmsData.content_layout_spacing?.grid_gap || 16}px` }}>
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="aspect-square bg-white/5 border border-white/5 rounded flex items-center justify-center text-[8px] text-zinc-500">
                                                        GAP: {cmsData.content_layout_spacing?.grid_gap || 16}PX
                                                    </div>
                                                ))}
                                            </div>
                                            <div
                                                className="w-full bg-blue-500/10 border-t border-blue-500/20 text-[8px] flex items-center justify-center font-mono py-1"
                                                style={{ height: `${cmsData.content_layout_spacing?.section_padding_y || 24}px` }}
                                            >
                                                PADDING-Y: {cmsData.content_layout_spacing?.section_padding_y || 24}PX
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ASCENSION TAB */}
                            {activeTab === "ascension" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                            <ShieldCheck className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Ascension Control</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate the high-end digital atmosphere and biological reactions.</p>
                                        </div>
                                    </div>

                                    {/* Environmental Override */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Environmental Essence</h3>
                                            <span className="text-[9px] text-zinc-600 font-mono italic">Chrono-Shifting & Particle Physics</span>
                                        </div>

                                        {/* Sensory Vibe Selector */}
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Atmospheric Vibe</h3>
                                                <span className="text-[9px] text-zinc-600 font-mono italic">Sensory Override</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { id: 'nature', label: 'Nature', color: 'text-green-400' },
                                                    { id: 'etheric', label: 'Etheric', color: 'text-purple-400' },
                                                    { id: 'ancient', label: 'Ancient', color: 'text-amber-400' },
                                                    { id: 'digital', label: 'Digital', color: 'text-emerald-400' }
                                                ].map((vibe) => (
                                                    <button
                                                        key={vibe.id}
                                                        onClick={() => updateAscension('vibe', vibe.id)}
                                                        className={cn(
                                                            "p-3 rounded-xl border transition-all flex flex-col items-center gap-1 group",
                                                            cmsData.content_ascension?.vibe === vibe.id || (!cmsData.content_ascension?.vibe && vibe.id === 'nature')
                                                                ? "bg-white text-black border-white shadow-xl"
                                                                : "bg-white/[0.02] text-zinc-500 border-white/5 hover:border-white/20"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            (cmsData.content_ascension?.vibe === vibe.id || (!cmsData.content_ascension?.vibe && vibe.id === 'nature')) ? "bg-black" : `bg-current ${vibe.color}`
                                                        )} />
                                                        <span className="text-[8px] uppercase font-bold tracking-tighter">{vibe.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Material Refinement */}
                                        <div className="space-y-6 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Material Refinement</h3>
                                                <Layers className="w-3.5 h-3.5 text-zinc-600" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Glass Border Width</label>
                                                            <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_ascension?.glass_border_width || 1}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="4"
                                                            step="0.5"
                                                            value={cmsData.content_ascension?.glass_border_width || 1}
                                                            onChange={(e) => updateAscension('glass_border_width', parseFloat(e.target.value))}
                                                            className="w-full accent-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Material Viscosity</label>
                                                            <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_ascension?.viscosity || 1}x</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0.1"
                                                            max="3"
                                                            step="0.1"
                                                            value={cmsData.content_ascension?.viscosity || 1}
                                                            onChange={(e) => updateAscension('viscosity', parseFloat(e.target.value))}
                                                            className="w-full accent-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Reflection Intensity</label>
                                                            <span className="text-[10px] text-zinc-400 font-mono">{Math.round((cmsData.content_ascension?.reflection_intensity || 0.5) * 100)}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.05"
                                                            value={cmsData.content_ascension?.reflection_intensity || 0.5}
                                                            onChange={(e) => updateAscension('reflection_intensity', parseFloat(e.target.value))}
                                                            className="w-full accent-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Surface Finish</label>
                                                        <select
                                                            value={cmsData.content_ascension?.surface_finish || 'frosted'}
                                                            onChange={(e) => updateAscension('surface_finish', e.target.value)}
                                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                                                        >
                                                            <option value="matte">Matte</option>
                                                            <option value="frosted">Frosted</option>
                                                            <option value="crystalline">Crystalline</option>
                                                            <option value="iridescent">Iridescent</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Chrono-Mode (Manual Override)</label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {[
                                                        { id: null, label: 'Auto' },
                                                        { id: 'dawn', label: 'Dawn' },
                                                        { id: 'noon', label: 'Noon' },
                                                        { id: 'twilight', label: 'Twilight' },
                                                        { id: 'midnight', label: 'Midnight' }
                                                    ].map((mode) => (
                                                        <button
                                                            key={String(mode.id)}
                                                            onClick={() => updateAscension('manual_chrono_mode', mode.id)}
                                                            className={cn(
                                                                "p-2 text-[10px] uppercase font-bold border rounded-lg transition-all",
                                                                cmsData.content_ascension?.manual_chrono_mode === mode.id
                                                                    ? "bg-white text-black border-white shadow-lg shadow-white/10"
                                                                    : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
                                                            )}
                                                        >
                                                            {mode.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Particle Density</label>
                                                        <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_ascension?.particle_density || 1}x</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="2"
                                                        step="0.1"
                                                        value={cmsData.content_ascension?.particle_density || 1}
                                                        onChange={(e) => updateAscension('particle_density', parseFloat(e.target.value))}
                                                        className="w-full accent-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Wind Velocity</label>
                                                        <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_ascension?.wind_velocity || 1}x</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="3"
                                                        step="0.1"
                                                        value={cmsData.content_ascension?.wind_velocity || 1}
                                                        onChange={(e) => updateAscension('wind_velocity', parseFloat(e.target.value))}
                                                        className="w-full accent-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alchemical Surface Control */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Surface Shaders</h3>
                                            <span className="text-[9px] text-zinc-600 font-mono italic">Material Presence & Glow</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Shimmer Intensity</label>
                                                    <span className="text-[10px] text-zinc-400 font-mono">{Math.round((cmsData.content_ascension?.shader_intensity || 1) * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="2"
                                                    step="0.1"
                                                    value={cmsData.content_ascension?.shader_intensity || 1}
                                                    onChange={(e) => updateAscension('shader_intensity', parseFloat(e.target.value))}
                                                    className="w-full accent-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Shimmer Speed</label>
                                                    <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_ascension?.shader_speed || 1}x</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="3"
                                                    step="0.1"
                                                    value={cmsData.content_ascension?.shader_speed || 1}
                                                    onChange={(e) => updateAscension('shader_speed', parseFloat(e.target.value))}
                                                    className="w-full accent-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Bioluminescent Glow</label>
                                                <span className="text-[10px] text-zinc-400 font-mono">{Math.round((cmsData.content_ascension?.glow_intensity || 1) * 100)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1.5"
                                                step="0.1"
                                                value={cmsData.content_ascension?.glow_intensity || 1}
                                                onChange={(e) => updateAscension('glow_intensity', parseFloat(e.target.value))}
                                                className="w-full accent-amber-500"
                                            />
                                            <p className="text-[9px] text-zinc-600 italic">Controls the "breathing" intensity of GlassCards and Product Surfaces.</p>
                                        </div>
                                    </div>

                                    {/* Recursive Geometry Control */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Recursive Geometry</h3>
                                            <span className="text-[9px] text-zinc-600 font-mono italic">Sacred Fractal Depth</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Fractal Depth</label>
                                                    <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_ascension?.recursive_depth || 3} Levels</span>
                                                </div>
                                                <select
                                                    value={cmsData.content_ascension?.recursive_depth || 3}
                                                    onChange={(e) => updateAscension('recursive_depth', parseInt(e.target.value))}
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                >
                                                    <option value="1">1 (Basic)</option>
                                                    <option value="2">2 (Standard)</option>
                                                    <option value="3">3 (Deep)</option>
                                                    <option value="4">4 (Microscopic)</option>
                                                    <option value="5">5 (Quantum)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Evolution Speed</label>
                                                    <span className="text-[10px] text-zinc-400 font-mono">{cmsData.content_ascension?.recursive_speed || 1}x</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="4"
                                                    step="0.1"
                                                    value={cmsData.content_ascension?.recursive_speed || 1}
                                                    onChange={(e) => updateAscension('recursive_speed', parseFloat(e.target.value))}
                                                    className="w-full accent-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Global Animation Regulator */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Animation Regulator</h3>
                                            <span className="text-[9px] text-zinc-600 font-mono italic">Global Intensity Scaling</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Global Intensity</label>
                                                <span className="text-[10px] text-zinc-400 font-mono">{Math.round((cmsData.content_ascension?.animation_intensity || 1) * 100)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="2.5"
                                                step="0.1"
                                                value={cmsData.content_ascension?.animation_intensity || 1}
                                                onChange={(e) => updateAscension('animation_intensity', parseFloat(e.target.value))}
                                                className="w-full accent-green-500"
                                            />
                                            <p className="text-[9px] text-zinc-600 italic">Scales duration and magnitude of all kinetic elements site-wide.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* NAVIGATION TAB */}
                            {activeTab === "nav" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                                            <Navigation className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Menu Builder</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate the primary and secondary navigation paths for your visitors.</p>
                                        </div>
                                    </div>

                                    {/* Header Menu */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Header Navigation</label>
                                            <button onClick={() => addNavItem('header')} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors">
                                                + Add Link
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(cmsData.content_navigation?.header || []).map((item: any, i: number) => (
                                                <div key={i} className="flex gap-2 items-center bg-zinc-900/30 p-2 rounded-lg border border-white/5">
                                                    <span className="text-zinc-500 font-mono text-xs w-6">{i + 1}.</span>
                                                    <input
                                                        value={item.label}
                                                        onChange={(e) => updateNavItem('header', i, 'label', e.target.value)}
                                                        placeholder="Label"
                                                        className="flex-1 bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-white"
                                                    />
                                                    <input
                                                        value={item.href}
                                                        onChange={(e) => updateNavItem('header', i, 'href', e.target.value)}
                                                        placeholder="URL / Path"
                                                        className="flex-1 bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-zinc-400 font-mono"
                                                    />
                                                    <button onClick={() => removeNavItem('header', i)} className="text-zinc-600 hover:text-red-400 p-1">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(cmsData.content_navigation?.header || []).length === 0 && (
                                                <div className="text-center py-4 text-zinc-600 text-xs italic">No links in header</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Menu */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Footer Menu</h3>
                                            <button onClick={() => addNavItem('footer')} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors">
                                                + Add Link
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(cmsData.content_navigation?.footer || []).map((item: any, i: number) => (
                                                <div key={i} className="flex gap-2 items-center bg-zinc-900/30 p-2 rounded-lg border border-white/5">
                                                    <span className="text-zinc-500 font-mono text-xs w-6">{i + 1}.</span>
                                                    <input
                                                        value={item.label}
                                                        onChange={(e) => updateNavItem('footer', i, 'label', e.target.value)}
                                                        placeholder="Label"
                                                        className="flex-1 bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-white"
                                                    />
                                                    <input
                                                        value={item.href}
                                                        onChange={(e) => updateNavItem('footer', i, 'href', e.target.value)}
                                                        placeholder="URL / Path"
                                                        className="flex-1 bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-zinc-400 font-mono"
                                                    />
                                                    <button onClick={() => removeNavItem('footer', i)} className="text-zinc-600 hover:text-red-400 p-1">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(cmsData.content_navigation?.footer || []).length === 0 && (
                                                <div className="text-center py-4 text-zinc-600 text-xs italic">No links in footer</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "marketing" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                                            <Megaphone className="w-6 h-6 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Growth & SEO</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Enhance your brand's visibility and manage conversion-focused tools.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Announcement Bar</h3>

                                        <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border border-white/5">
                                            <label className="text-xs text-zinc-400">Enable Bar</label>
                                            <button
                                                onClick={() => updateMarketing('announcement_bar', 'enabled', !cmsData.content_marketing?.announcement_bar?.enabled)}
                                                className="text-zinc-400 hover:text-white transition-colors"
                                            >
                                                {cmsData.content_marketing?.announcement_bar?.enabled ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Message</label>
                                            <input
                                                value={cmsData.content_marketing?.announcement_bar?.text || ''}
                                                onChange={(e) => updateMarketing('announcement_bar', 'text', e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                placeholder="e.g., Free Shipping on Orders Over $100"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Link URL</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    value={cmsData.content_marketing?.announcement_bar?.link || ''}
                                                    onChange={(e) => updateMarketing('announcement_bar', 'link', e.target.value)}
                                                    className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                    placeholder="/shop"
                                                />
                                                <ExternalLink className="w-4 h-4 text-zinc-600" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Background Color</label>
                                            <div className="flex gap-4 items-center">
                                                <input
                                                    type="color"
                                                    value={cmsData.content_marketing?.announcement_bar?.color || '#000000'}
                                                    onChange={(e) => updateMarketing('announcement_bar', 'color', e.target.value)}
                                                    className="w-12 h-12 rounded-lg bg-transparent cursor-pointer border-none"
                                                />
                                                <div className="text-xs font-mono text-zinc-400 uppercase">
                                                    {cmsData.content_marketing?.announcement_bar?.color || '#000000'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Global SEO & Meta */}
                                    <div className="space-y-4 pt-8 border-t border-white/5">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Global SEO & Meta</h3>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Title Template</label>
                                            <input
                                                value={cmsData.content_marketing?.seo?.titleTemplate || ''}
                                                onChange={(e) => updateMarketing('seo', 'titleTemplate', e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                placeholder="%s | We Naturals"
                                            />
                                            <p className="text-[10px] text-zinc-600 italic">Use %s to represent the page title.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Default Meta Description</label>
                                            <textarea
                                                value={cmsData.content_marketing?.seo?.defaultDescription || ''}
                                                onChange={(e) => updateMarketing('seo', 'defaultDescription', e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white min-h-[80px] resize-none"
                                                placeholder="Describe your brand for search engines..."
                                            />
                                        </div>

                                        {/* Google Preview */}
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                            <label className="text-[10px] uppercase text-blue-400 font-bold tracking-widest">Google Search Preview</label>
                                            <div className="bg-white rounded-lg p-4 font-sans text-left">
                                                <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
                                                    {cmsData.content_marketing?.seo?.titleTemplate?.replace('%s', 'Home') || 'Home | We Naturals'}
                                                </div>
                                                <div className="text-[#006621] text-sm truncate flex items-center gap-1">
                                                    https://wenaturals.com <span className="text-[10px] transform rotate-90">›</span>
                                                </div>
                                                <div className="text-[#4d5156] text-sm line-clamp-2 mt-1 leading-normal">
                                                    {cmsData.content_marketing?.seo?.defaultDescription || 'Discover the fusion of molecular science and botanical purity...'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Favicon URL (.ico/.png)</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        value={cmsData.content_marketing?.seo?.favicon || ''}
                                                        onChange={(e) => updateMarketing('seo', 'favicon', e.target.value)}
                                                        className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                        placeholder="https://..."
                                                    />
                                                    <ImageIcon className="w-4 h-4 text-zinc-600" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Apple Touch Icon URL</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        value={cmsData.content_marketing?.seo?.appleTouchIcon || ''}
                                                        onChange={(e) => updateMarketing('seo', 'appleTouchIcon', e.target.value)}
                                                        className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                        placeholder="https://..."
                                                    />
                                                    <ImageIcon className="w-4 h-4 text-zinc-600" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Default Social Image URL</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    value={cmsData.content_marketing?.seo?.defaultImage || ''}
                                                    onChange={(e) => updateMarketing('seo', 'defaultImage', e.target.value)}
                                                    className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                                    placeholder="https://..."
                                                />
                                                <ImageIcon className="w-4 h-4 text-zinc-600" />
                                            </div>
                                        </div>

                                        {/* Social Preview */}
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                            <label className="text-[10px] uppercase text-blue-400 font-bold tracking-widest">Social Card Preview (X/Twitter)</label>
                                            <div className="bg-black rounded-2xl border border-[#2f3336] overflow-hidden max-w-sm mx-auto">
                                                <div className="aspect-[1.91/1] bg-zinc-900 relative">
                                                    {cmsData.content_marketing?.seo?.defaultImage ? (
                                                        <img src={cmsData.content_marketing.seo.defaultImage} className="w-full h-full object-cover" alt="Social" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-800 text-xs">Preview Image</div>
                                                    )}
                                                </div>
                                                <div className="p-3 border-t border-[#2f3336] text-left">
                                                    <div className="text-zinc-500 text-[11px] uppercase tracking-wider">wenaturals.com</div>
                                                    <div className="text-white text-sm font-bold mt-0.5 line-clamp-1">
                                                        {cmsData.content_marketing?.seo?.titleTemplate?.replace('%s', 'Home') || 'Home | We Naturals'}
                                                    </div>
                                                    <div className="text-zinc-500 text-xs line-clamp-2 mt-0.5">
                                                        {cmsData.content_marketing?.seo?.defaultDescription || 'No description provided.'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "performance" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                            <Zap className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Performance & Eco</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Optimize site speed and visual clarity. Disable heavy animations for a smoother experience.</p>
                                        </div>
                                    </div>

                                    {/* Global Eco Mode */}
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4" />
                                                    Global Eco Mode
                                                </h4>
                                                <p className="text-[10px] text-zinc-400 mt-1">Instantly disable all heavy animations for maximum performance.</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-[8px] font-bold text-green-500/50 uppercase tracking-tighter">Active State Engine</span>
                                                <button
                                                    onClick={() => updatePerformance('eco_mode', !cmsData.content_performance?.eco_mode)}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative overflow-hidden",
                                                        cmsData.content_performance?.eco_mode ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-zinc-800"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                                        cmsData.content_performance?.eco_mode ? "left-7" : "left-1"
                                                    )} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Granular Controls</h3>

                                            {[
                                                { id: 'particles_enabled', label: 'Atmosphere Particles', desc: 'Floating ambient particles (Canvas)' },
                                                { id: 'recursive_geometry_enabled', label: 'Recursive Geometry', desc: 'Background SVG fractal patterns' },
                                                { id: 'smooth_scroll_enabled', label: 'Smooth Scrolling', desc: 'Lenis inertial scroll smoothing' },
                                                { id: 'parallax_enabled', label: 'Parallax Effects', desc: 'Layered background depth shifts' },
                                                { id: 'custom_cursor_enabled', label: 'Custom Cursor', desc: 'Mouse-following interactive cursor' },
                                                { id: 'tilt_enabled', label: 'Interactive Tilt', desc: 'GSAP hover tilt on primary assets' },
                                                { id: 'marquee_enabled', label: 'Infinite Marquees', desc: 'Auto-scrolling video galleries' }
                                            ].map((toggle) => (
                                                <div key={toggle.id} className="flex items-center justify-between group">
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors">{toggle.label}</p>
                                                        <p className="text-[10px] text-zinc-400 italic mt-0.5">{toggle.desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => updatePerformance(toggle.id, !cmsData.content_performance?.[toggle.id])}
                                                        className={cn(
                                                            "w-10 h-5 rounded-full transition-all relative",
                                                            cmsData.content_performance?.[toggle.id] ? "bg-blue-500" : "bg-zinc-800"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                                                            cmsData.content_performance?.[toggle.id] ? "left-5.5" : "left-0.5"
                                                        )} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                            <p className="text-[10px] text-orange-400 font-medium leading-relaxed">
                                                <b>Note:</b> These settings are applied in real-time to your storefront. Eco Mode overrides granular choices.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "layout" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                            <ListOrdered className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Section Order</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Drag and reorder the visual sequence of your homepage sections.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Active Sequence</h3>
                                        <div className="space-y-2">
                                            {(cmsData.homepage_layout || []).map((sectionKey: string, i: number) => {
                                                const isVisible = getSectionVisibility(sectionKey);
                                                return (
                                                    <div key={sectionKey} className={cn(
                                                        "flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border transition-colors group",
                                                        isVisible ? "border-white/5 hover:border-white/10" : "border-red-500/20 bg-red-500/5 opacity-60"
                                                    )}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-[10px] text-zinc-500 font-mono">
                                                                {i + 1}
                                                            </div>
                                                            <span className={cn("text-sm font-medium", isVisible ? "text-zinc-300" : "text-zinc-500 line-through")}>
                                                                {SECTION_LABELS[sectionKey] || sectionKey}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleSectionVisibility(sectionKey)}
                                                                className={cn(
                                                                    "p-1.5 rounded-md transition-all",
                                                                    isVisible ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5"
                                                                )}
                                                                title={isVisible ? "Visible" : "Hidden"}
                                                            >
                                                                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                            </button>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-white/5">
                                                                <button
                                                                    onClick={() => moveSection(i, 'up')}
                                                                    disabled={i === 0}
                                                                    className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-all hover:text-blue-400"
                                                                >
                                                                    <ChevronDown className="w-4 h-4 rotate-180" />
                                                                </button>
                                                                <button
                                                                    onClick={() => moveSection(i, 'down')}
                                                                    disabled={i === (cmsData.homepage_layout?.length || 0) - 1}
                                                                    className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-all hover:text-blue-400"
                                                                >
                                                                    <ChevronDown className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-zinc-500 italic max-w-xs">
                                            Note: The "Hero" section is usually best kept at the top.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "system" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                                            <Settings className="w-6 h-6 text-zinc-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">System Settings</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Configure global platform behavior and infrastructure states.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6 flex items-center justify-between hover:bg-white/[0.04] transition-all duration-300 group">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                                                    Maintenance Mode
                                                    {cmsData.content_system?.maintenance_mode && (
                                                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                                    )}
                                                </h4>
                                                <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                                    Disable public access to the platform and show an animated maintenance screen.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setCmsData({
                                                    ...cmsData,
                                                    content_system: {
                                                        ...cmsData.content_system,
                                                        maintenance_mode: !cmsData.content_system?.maintenance_mode
                                                    }
                                                })}
                                                className={cn(
                                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black",
                                                    cmsData.content_system?.maintenance_mode ? "bg-amber-600 shadow-[0_0_15px_-3px_rgba(217,119,6,0.5)]" : "bg-zinc-800"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm",
                                                        cmsData.content_system?.maintenance_mode ? "translate-x-6" : "translate-x-1"
                                                    )}
                                                />
                                            </button>
                                        </div>

                                        {cmsData.content_system?.maintenance_mode && (
                                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    <Shield className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <p className="text-[11px] text-amber-400/80 leading-relaxed font-medium">
                                                    Maintenance Mode is currently active. The public storefront will be hidden.
                                                    Administrative panels remain accessible for you to continue development.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Live Preview Panel - Right */}
                <div className={cn(
                    "flex-1 bg-[#050505] lg:border-l border-white/10 flex flex-col overflow-hidden relative shadow-2xl transition-all duration-300",
                    activeView === "edit" ? "hidden lg:flex" : "flex"
                )}>
                    <div className="h-10 bg-[#0A0A0A] border-b border-white/5 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="bg-black/50 px-4 py-1 rounded-lg text-[10px] text-zinc-600 font-mono flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                wenaturals.shop
                            </div>
                        </div>
                    </div>
                    <div className={`flex-1 flex justify-center bg-zinc-900 overflow-hidden transition-all duration-500 relative`}>
                        <iframe
                            ref={iframeRef}
                            src={`/?admin_preview=true&refresh=${refreshKey}`}
                            onLoad={handleIframeLoad}
                            className={`h-full border-none shadow-2xl transition-all duration-500 bg-black ${previewMode === 'mobile' ? 'w-[375px] my-4 rounded-[2rem] border-4 border-zinc-800' : 'w-full'}`}
                            title="Live Preview"
                        />
                    </div>
                </div>
            </div >
        </div >
    );
}
