"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, FileText, Globe, Image as ImageIcon, Sparkles, Link as LinkIcon, Package } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { ProductDescriptionEditor } from "./ProductDescriptionEditor";
import { MediaManager } from "./MediaManager";

interface BlogFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data?: any) => void;
    initialData?: any;
}

export function BlogForm({ isOpen, onClose, onSubmit, initialData }: BlogFormProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        image: "",
        excerpt: "",
        category: "General",
        author: "Admin",
        status: "Draft",
        media: [] as string[],
        related_products: [] as string[],
        read_time: "5 min"
    });

    const [activeTab, setActiveTab] = useState("details");
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [catRes, prodRes] = await Promise.all([
                supabase.from('blog_categories').select('*').order('name'),
                supabase.from('products').select('id, name, media, price, currency, slug').order('name')
            ]);
            if (catRes.data) setCategories(catRes.data);
            if (prodRes.data) setProducts(prodRes.data);
        };
        fetchData();

        if (initialData) {
            setFormData({
                ...initialData,
                title: initialData.title || "",
                slug: initialData.slug || "",
                content: initialData.content || "",
                image: initialData.image || "",
                excerpt: initialData.excerpt || "",
                category: initialData.category || "General",
                author: initialData.author || "Admin",
                status: initialData.status || "Draft",
                media: initialData.alchemical_properties?.media || (initialData.image ? [initialData.image] : []),
                related_products: initialData.alchemical_properties?.related_products || [],
                read_time: initialData.alchemical_properties?.read_time || "5 min"
            });
        } else {
            setFormData({
                title: "",
                slug: "",
                content: "",
                image: "",
                excerpt: "",
                category: "General",
                author: "Admin",
                status: "Draft",
                media: [],
                related_products: [],
                read_time: "5 min"
            });
        }
    }, [initialData, isOpen]);

    // Auto-slug generation logic
    useEffect(() => {
        if (!isOpen) return; // Only run when form is active

        const titleSlug = formData.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // If we are creating a new blog OR the slug is currently empty, 
        // AND the user hasn't manually diverged significantly (simple heuristic: if slug is empty or matches a slugified version of some part of title)
        // More robust: Only auto-update if slug is empty or if we are in "auto" mode.
        // For simplicity: If it's a new blog and slug is empty or matches the *previous* auto-generated slug.
        // But let's just do it if it's a new blog and slug is empty for now, or if they match.
        if (!initialData && (!formData.slug || formData.slug === "")) {
            setFormData(prev => ({ ...prev, slug: titleSlug }));
        }
    }, [formData.title, isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const cleanSlug = (formData.slug || formData.title)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const payload = {
            ...formData,
            slug: cleanSlug,
            image: formData.media[0] || formData.image, // Main image for back-compat
            alchemical_properties: {
                ...initialData?.alchemical_properties,
                media: formData.media,
                related_products: formData.related_products,
                read_time: formData.read_time
            }
        };

        // Remove non-schema fields to avoid "column not found" errors
        const { media, related_products, read_time, coverImage, author, readTime, date, profiles, ...dbPayload } = payload as any;

        try {
            if (initialData) {
                const { error } = await supabase
                    .from('blogs')
                    .update(dbPayload)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('blogs')
                    .insert([dbPayload]);
                if (error) throw error;
            }
            onSubmit(dbPayload);
            onClose();
        } catch (error: any) {
            console.error("Error saving blog:", error);
            alert(`Error saving blog: ${error.message || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 min-h-screen overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="relative w-full max-w-5xl glass rounded-3xl md:rounded-[2rem] border-white/10 overflow-hidden shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex gap-4 border-b border-white/5 px-8 pt-4">
                            {["details", "media", "connections"].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? "text-blue-400" : "text-zinc-500 hover:text-white"
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-10 custom-scrollbar">
                            {activeTab === "details" && (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <InputField label="Article Title" name="title" value={formData.title} onChange={handleChange} placeholder="The Alchemy of Sound..." />
                                            <InputField label="Cipher Slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="alchemy-of-sound" />

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Category</label>
                                                    <select
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-xs font-bold appearance-none cursor-pointer"
                                                    >
                                                        <option value="General">General</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Status</label>
                                                    <select
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleChange}
                                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-xs font-bold appearance-none cursor-pointer"
                                                    >
                                                        <option value="Draft">Draft</option>
                                                        <option value="Published">Published</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <InputField label="Featured Quote/Summary" name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="The resonance of nature..." />
                                            <InputField label="Reading Time" name="read_time" value={formData.read_time} onChange={handleChange} placeholder="5 min" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Full Article Lore</label>
                                        <ProductDescriptionEditor content={formData.content} onChange={handleContentChange} />
                                    </div>
                                </div>
                            )}

                            {activeTab === "media" && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest mb-2">Multimedia Cover Gallery</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6">Add images or videos that will cycle in the main header.</p>
                                        <MediaManager
                                            media={formData.media}
                                            onChange={(media) => setFormData(prev => ({ ...prev, media }))}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "connections" && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest mb-2">Shop the Story</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6">Select products featured or mentioned in this article.</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {products.map(prod => {
                                                const isSelected = formData.related_products.includes(prod.id);
                                                return (
                                                    <div
                                                        key={prod.id}
                                                        onClick={() => {
                                                            const newRelated = isSelected
                                                                ? formData.related_products.filter(id => id !== prod.id)
                                                                : [...formData.related_products, prod.id];
                                                            setFormData(prev => ({ ...prev, related_products: newRelated }));
                                                        }}
                                                        className={`p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4 ${isSelected ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "glass border-white/5 hover:border-white/20"
                                                            }`}
                                                    >
                                                        <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                                                            <img src={prod.media?.[0] || "/placeholder.jpg"} alt={prod.name} className="object-cover w-full h-full" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-[10px] font-black uppercase tracking-wider truncate mb-0.5">{prod.name}</h4>
                                                            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{prod.currency || '₹'}{prod.price}</p>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? "bg-blue-500 border-blue-500" : "border-white/20"
                                                            }`}>
                                                            {isSelected && <Sparkles className="w-2 h-2 text-white" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 md:pb-0">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                    Ready
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full sm:hidden px-6 py-4 glass text-zinc-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full sm:w-auto px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                                    >
                                        {loading ? "Saving..." : initialData ? "Update Story" : "Publish"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function InputField({ label, value, ...props }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
            <input
                {...props}
                value={value ?? ""}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-xs font-medium font-geist"
            />
        </div>
    );
}
