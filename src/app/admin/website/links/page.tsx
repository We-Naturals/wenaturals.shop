"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { Save, Plus, Trash2, Youtube, Instagram, Mail, Link as LinkIcon, ExternalLink } from "lucide-react";
import { AmazonLogo, FlipkartLogo, MeeshoLogo } from "@/components/icons/MarketplaceIcons";
import Image from "next/image";

interface SocialLinks {
    instagram: string;
    youtube: string;
    mail: string;
    amazon: string;
    flipkart: string;
    meesho: string;
}

interface YoutubeShort {
    id: number;
    title: string;
    views: string;
    thumbnail: string;
    url: string;
}

export default function WebsiteLinksPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({
        instagram: "",
        youtube: "",
        mail: "",
        amazon: "",
        flipkart: "",
        meesho: ""
    });

    const [shorts, setShorts] = useState<YoutubeShort[]>([]);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        const { data: socialData } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'social_links')
            .single();

        const { data: shortsData } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'youtube_shorts')
            .single();

        if (socialData) setSocialLinks(socialData.value);
        if (shortsData) {
            const val = shortsData.value;
            setShorts(Array.isArray(val) ? val : (val.items || []));
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);

        const { error: socialError } = await supabase
            .from('site_config')
            .upsert({ key: 'social_links', value: socialLinks });

        if (socialError) {
            alert(`Error saving social links: ${socialError.message}`);
            setSaving(false);
            return;
        }

        // Fetch current shorts config to preserve other fields
        const { data: currentShortsData } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'youtube_shorts')
            .single();

        const updatedShortsValue = currentShortsData?.value ? {
            ...currentShortsData.value,
            items: shorts
        } : {
            items: shorts,
            visible: true,
            title: "Visual Alchemy.",
            header_visible: true,
            marquee_visible: true,
            media: []
        };

        const { error: shortsError } = await supabase
            .from('site_config')
            .upsert({ key: 'youtube_shorts', value: updatedShortsValue });

        if (shortsError) {
            alert(`Error saving shorts: ${shortsError.message}`);
            setSaving(false);
            return;
        }

        setSaving(false);
        alert("Configuration saved successfully!");
    };

    const addShort = () => {
        const newId = shorts.length > 0 ? Math.max(...shorts.map(s => s.id)) + 1 : 1;
        setShorts([...shorts, {
            id: newId,
            title: "",
            views: "",
            thumbnail: "/placeholder.jpg",
            url: ""
        }]);
    };

    const removeShort = (id: number) => {
        setShorts(shorts.filter(s => s.id !== id));
    };

    const updateShort = (id: number, field: keyof YoutubeShort, value: string) => {
        let updatedShorts = shorts.map(s => s.id === id ? { ...s, [field]: value } : s);

        // Auto-generate thumbnail if URL changes
        if (field === "url") {
            const videoIdMatch = value.match(/(?:youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/watch\?v=)([^?&/]+)/);
            if (videoIdMatch && videoIdMatch[1]) {
                const videoId = videoIdMatch[1];
                updatedShorts = updatedShorts.map(s => s.id === id ? {
                    ...s,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                } : s);
            }
        }

        setShorts(updatedShorts);
    };

    if (loading) return <div className="p-12 text-center text-zinc-500">Loading configuration...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-heading mb-2">Website Management</h1>
                    <p className="text-zinc-400">Manage external links and homepage content.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Social & Marketplace Links */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold border-b border-white/10 pb-4">Social & Marketplace Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Social Media</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                                </label>
                                <input
                                    type="text"
                                    value={socialLinks.instagram}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 outline-none"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Youtube className="w-4 h-4 text-red-500" /> YouTube
                                </label>
                                <input
                                    type="text"
                                    value={socialLinks.youtube}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 outline-none"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Mail className="w-4 h-4 text-zinc-400" /> Support Email
                                </label>
                                <input
                                    type="text"
                                    value={socialLinks.mail}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, mail: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 outline-none"
                                    placeholder="mailto:..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Marketplaces</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <AmazonLogo className="w-4 h-4 text-yellow-500" /> Amazon Store
                                </label>
                                <input
                                    type="text"
                                    value={socialLinks.amazon}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, amazon: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 outline-none"
                                    placeholder="https://amazon.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <FlipkartLogo className="w-4 h-4 text-blue-500" /> Flipkart Store
                                </label>
                                <input
                                    type="text"
                                    value={socialLinks.flipkart}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, flipkart: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 outline-none"
                                    placeholder="https://flipkart.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <MeeshoLogo className="w-4 h-4 text-pink-500" /> Meesho Store
                                </label>
                                <input
                                    type="text"
                                    value={socialLinks.meesho}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, meesho: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 outline-none"
                                    placeholder="https://meesho.com/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* YouTube Shorts Management */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-xl font-bold">YouTube Shorts</h2>
                        <p className="text-xs text-zinc-500">Paste your video links here.</p>
                    </div>
                    <button
                        onClick={addShort}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-bold transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Link
                    </button>
                </div>

                <div className="space-y-3">
                    {shorts.map((short, index) => (
                        <motion.div
                            key={short.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-3 rounded-xl border-white/5 flex flex-col md:flex-row gap-3 items-center group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden relative flex-shrink-0">
                                {(() => {
                                    const getThumbnail = (s: any) => {
                                        if (s.thumbnail && s.thumbnail !== "/placeholder.jpg" && s.thumbnail !== "") return s.thumbnail;
                                        const match = s.url?.match(/(?:youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/watch\?v=)([^?&/]+)/);
                                        if (match && match[1]) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
                                        return null;
                                    };
                                    const thumb = getThumbnail(short);

                                    if (thumb) {
                                        return <Image src={thumb} alt="Thumbnail" fill className="object-cover" />;
                                    }
                                    return (
                                        <div className="w-full h-full flex items-center justify-center bg-red-500/10 text-red-500">
                                            <Youtube className="w-5 h-5" />
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex-1 w-full md:w-auto">
                                <input
                                    type="text"
                                    value={short.url}
                                    onChange={(e) => updateShort(short.id, "url", e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-blue-400 focus:border-blue-500/50 outline-none"
                                    placeholder="Paste YouTube Share Link..."
                                />
                            </div>

                            <button
                                onClick={() => removeShort(short.id)}
                                className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-colors"
                                title="Remove Link"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}

                    {shorts.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-zinc-500">
                            No shorts added yet. Click "Add Link" to start.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
