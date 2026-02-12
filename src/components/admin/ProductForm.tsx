"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Box, Sparkles, Wand2, Package, Globe, Tag, Trash2, Plus, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { MediaManager } from "./MediaManager";
import { ProductDescriptionEditor } from "./ProductDescriptionEditor";

interface Variant {
    weight: string;
    unit: string;
    price: string;
    stock: string;
}

interface BundleItem {
    name: string;
    quantity: number;
    price: number;
}

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    categories: string[];
}

export function ProductForm({ isOpen, onClose, onSubmit, initialData, categories }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "description" | "media" | "variants" | "bundle">("details");
    const supabase = createClient();

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        categories: [] as string[],
        price: "0",
        stock: 0,
        description: "",
        media: [] as string[],
        variants: [] as Variant[],
        is_bundle: false,
        bundle_items: [] as BundleItem[],
        rarity_level: "Common",
        alchemical_properties: {} as any,
        related_blogs: [] as string[],
        amazon_link: "",
        flipkart_link: "",
        meesho_link: "",
        status: "Active",
        currency: "INR"
    });

    const [availableBlogs, setAvailableBlogs] = useState<any[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                name: initialData.name || "",
                slug: initialData.slug || "",
                categories: initialData.categories || (initialData.category ? [initialData.category] : []) || [],
                price: initialData.price || "0",
                stock: initialData.stock || 0,
                description: initialData.description || "",
                media: initialData.media || [],
                variants: initialData.variants || [],
                bundle_items: initialData.bundle_items || [],
                alchemical_properties: initialData.alchemical_properties || {},
                related_blogs: initialData.alchemical_properties?.related_blogs || [],
                amazon_link: initialData.amazon_link || "",
                flipkart_link: initialData.flipkart_link || "",
                meesho_link: initialData.meesho_link || "",
                status: initialData.status || "Active",
                rarity_level: initialData.rarity_level || "Common",
                currency: initialData.currency || "INR"
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                categories: [],
                price: "0",
                stock: 0,
                description: "",
                media: [],
                is_bundle: false,
                bundle_items: [],
                rarity_level: "Common",
                alchemical_properties: {},
                related_blogs: [],
                amazon_link: "",
                flipkart_link: "",
                meesho_link: "",
                status: "Active",
                currency: "INR",
                variants: [{ weight: "", unit: "ml", price: "", stock: "0" }] // Default variant
            });
        }
    }, [initialData, isOpen, categories]);

    // Fetch blogs for selection
    useEffect(() => {
        if (!isOpen) return;
        const fetchBlogs = async () => {
            const { data } = await supabase.from('blogs').select('id, title').order('created_at', { ascending: false });
            if (data) setAvailableBlogs(data);
        };
        fetchBlogs();
    }, [isOpen]);

    // Auto-slug generation logic
    useEffect(() => {
        if (!isOpen) return;

        const nameSlug = formData.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Auto-update slug if it's a new product and slug is empty
        if (!initialData && (!formData.slug || formData.slug === "")) {
            setFormData(prev => ({ ...prev, slug: nameSlug }));
        }
    }, [formData.name, isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleMediaChange = (media: string[]) => {
        setFormData(prev => ({ ...prev, media }));
    };

    const handleDescriptionChange = (description: string) => {
        setFormData(prev => ({ ...prev, description }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: At least 1 variant is mandatory
        if (formData.variants.length === 0) {
            alert("At least one variant (e.g., 50ml) is mandatory with its price.");
            setActiveTab("variants");
            return;
        }

        setLoading(true);

        // Sync top-level price and stock from variants
        const syncedData = {
            ...formData,
            price: formData.variants[0]?.price || formData.price,
            stock: formData.variants.reduce((total, v) => total + (parseInt(v.stock) || 0), 0)
        };

        // Prepare payload with related_blogs inside alchemical_properties
        const payload = {
            ...syncedData,
            alchemical_properties: {
                ...formData.alchemical_properties,
                related_blogs: formData.related_blogs
            }
        };

        // Remove related_blogs from top level to avoid schema error if column missing
        delete (payload as any).related_blogs;
        // Remove generated columns that cannot be updated
        delete (payload as any).fts;
        delete (payload as any).created_at;
        delete (payload as any).updated_at;

        try {
            if (initialData) {
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([payload]);
                if (error) throw error;
            }
            onSubmit(payload);
            onClose();
        } catch (error: any) {
            console.error("Full Error Object:", JSON.stringify(error, null, 2));
            console.error("Error details:", {
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code
            });
            alert(`Error saving product: ${error?.message || "Unknown error. Check console."}`);
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
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="relative w-full max-w-6xl glass rounded-3xl md:rounded-[2.5rem] border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row h-full md:h-auto md:max-h-[90vh]"
                    >
                        {/* Sidebar */}
                        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-row md:flex-col gap-2 bg-white/[0.01] overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
                            <div className="hidden md:flex items-center gap-3 mb-8 px-2 mt-2">
                                <div className="p-2.5 glass rounded-xl text-blue-400">
                                    <Box className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest leading-none">Alchemist</h2>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">Foundry v1.2</p>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 min-w-max md:min-w-0">
                                <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")} icon={<Package className="w-4 h-4" />} label="Basic" />
                                <TabButton active={activeTab === "description"} onClick={() => setActiveTab("description")} icon={<Wand2 className="w-4 h-4" />} label="Lore" />
                                <TabButton active={activeTab === "media"} onClick={() => setActiveTab("media")} icon={<Globe className="w-4 h-4" />} label="Manifest" />
                                <TabButton active={activeTab === "variants"} onClick={() => setActiveTab("variants")} icon={<Sparkles className="w-4 h-4" />} label="Refract" />
                                <TabButton active={activeTab === "bundle"} onClick={() => setActiveTab("bundle")} icon={<Box className="w-4 h-4" />} label="Ritual" />
                            </div>

                            <div className="hidden md:block mt-auto pt-6">
                                <button
                                    onClick={onClose}
                                    type="button"
                                    className="w-full py-4 glass rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-12">
                                <AnimatePresence mode="wait">
                                    {activeTab === "details" && (
                                        <motion.div
                                            key="details"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-10"
                                        >
                                            <SectionTitle title="Product Essence" subtitle="Define the core physical and metaphysical properties." />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <InputField label="Relic Name" name="name" value={formData.name} onChange={handleChange} placeholder="Celestial Silk Serum..." />
                                                <InputField label="Cipher Slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="celestial-silk-serum" />

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Ethereal Categories</label>
                                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-2 bg-white/[0.03] border border-white/5 rounded-2xl">
                                                        {categories.map(cat => (
                                                            <label
                                                                key={cat}
                                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.categories.includes(cat)
                                                                    ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                                                                    : "glass border-white/5 hover:border-white/10"
                                                                    }`}
                                                            >
                                                                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${formData.categories.includes(cat) ? "bg-blue-500" : "border border-white/20"
                                                                    }`}>
                                                                    {formData.categories.includes(cat) && <Plus className="w-2.5 h-2.5 text-white" />}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={formData.categories.includes(cat)}
                                                                    onChange={() => {
                                                                        const current = formData.categories;
                                                                        if (current.includes(cat)) {
                                                                            setFormData(prev => ({ ...prev, categories: current.filter(c => c !== cat) }));
                                                                        } else {
                                                                            setFormData(prev => ({ ...prev, categories: [...current, cat] }));
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">{cat}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Currency</label>
                                                    <select
                                                        name="currency"
                                                        value={formData.currency}
                                                        onChange={handleChange}
                                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-xs font-bold appearance-none cursor-pointer"
                                                    >
                                                        <option value="INR" className="bg-zinc-900">INR (₹)</option>
                                                        <option value="USD" className="bg-zinc-900">USD ($)</option>
                                                        <option value="EUR" className="bg-zinc-900">EUR (€)</option>
                                                        <option value="GBP" className="bg-zinc-900">GBP (£)</option>
                                                        <option value="JPY" className="bg-zinc-900">JPY (¥)</option>
                                                    </select>
                                                </div>
                                            </div>


                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                                                <LinkField label="Amazon Hub" name="amazon_link" value={formData.amazon_link} onChange={handleChange} />
                                                <LinkField label="Flipkart Node" name="flipkart_link" value={formData.flipkart_link} onChange={handleChange} />
                                                <LinkField label="Meesho Stream" name="meesho_link" value={formData.meesho_link} onChange={handleChange} />
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "description" && (
                                        <motion.div
                                            key="description"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <SectionTitle title="Alchemical Records" subtitle="Weave the story and properties of this creation." />
                                            <ProductDescriptionEditor content={formData.description} onChange={handleDescriptionChange} />

                                            <div className="pt-10 space-y-6">
                                                <SectionTitle title="Connected Scrolls" subtitle="Attach related journal entries to this relic." />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {availableBlogs.map(blog => (
                                                        <label
                                                            key={blog.id}
                                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${formData.related_blogs?.includes(blog.id)
                                                                ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                                                                : "glass border-white/5 hover:border-white/10"
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${formData.related_blogs?.includes(blog.id) ? "bg-blue-500" : "border border-white/20"
                                                                }`}>
                                                                {formData.related_blogs?.includes(blog.id) && <Plus className="w-3 h-3 text-white rotate-45" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={formData.related_blogs?.includes(blog.id)}
                                                                onChange={() => {
                                                                    const current = formData.related_blogs || [];
                                                                    if (current.includes(blog.id)) {
                                                                        setFormData(prev => ({ ...prev, related_blogs: current.filter(id => id !== blog.id) }));
                                                                    } else {
                                                                        setFormData(prev => ({ ...prev, related_blogs: [...current, blog.id] }));
                                                                    }
                                                                }}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-zinc-200 truncate max-w-[200px]">{blog.title}</span>
                                                                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">Journal Entry</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "media" && (
                                        <motion.div
                                            key="media"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-10"
                                        >
                                            <SectionTitle title="Visual Manifestation" subtitle="Project the relic into the digital realm." />
                                            <MediaManager media={formData.media} onChange={handleMediaChange} />
                                        </motion.div>
                                    )}

                                    {activeTab === "variants" && (
                                        <motion.div
                                            key="variants"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <SectionTitle title="Refractions" subtitle="Define physical variations and pricing scales." />

                                            <div className="space-y-4">
                                                {formData.variants.map((variant, idx) => (
                                                    <div key={idx} className="glass p-6 rounded-[2rem] border-white/5 flex flex-wrap items-end gap-6 relative group">
                                                        <div className="flex-1 min-w-[120px]">
                                                            <InputField
                                                                label="Weight/Qty"
                                                                value={variant.weight}
                                                                onChange={(e: any) => {
                                                                    const newVariants = [...formData.variants];
                                                                    newVariants[idx].weight = e.target.value;
                                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                                }}
                                                                placeholder="50"
                                                            />
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Unit</label>
                                                            <select
                                                                value={variant.unit}
                                                                onChange={(e) => {
                                                                    const newVariants = [...formData.variants];
                                                                    newVariants[idx].unit = e.target.value;
                                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                                }}
                                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-xs font-bold appearance-none cursor-pointer"
                                                            >
                                                                <option value="ml">ml</option>
                                                                <option value="g">g</option>
                                                                <option value="kg">kg</option>
                                                                <option value="pcs">pcs</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1 min-w-[120px]">
                                                            <InputField
                                                                label="Price (INR/ETH)"
                                                                value={variant.price}
                                                                onChange={(e: any) => {
                                                                    const newVariants = [...formData.variants];
                                                                    newVariants[idx].price = e.target.value;
                                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                                }}
                                                                placeholder="499"
                                                            />
                                                        </div>
                                                        <div className="w-24">
                                                            <InputField
                                                                label="Stock"
                                                                value={variant.stock}
                                                                onChange={(e: any) => {
                                                                    const newVariants = [...formData.variants];
                                                                    newVariants[idx].stock = e.target.value;
                                                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                                                }}
                                                                placeholder="10"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newVariants = formData.variants.filter((_, i) => i !== idx);
                                                                setFormData(prev => ({ ...prev, variants: newVariants }));
                                                            }}
                                                            className="p-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, variants: [...prev.variants, { weight: "", unit: "ml", price: "", stock: "0" }] }))}
                                                    className="w-full py-6 border-2 border-dashed border-white/5 rounded-[2rem] text-zinc-500 hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-3 group"
                                                >
                                                    <div className="p-2 glass rounded-xl group-hover:scale-110 transition-transform">
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add New Refraction</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "bundle" && (
                                        <motion.div
                                            key="bundle"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="flex items-center justify-between">
                                                <SectionTitle title="Ritual Assembler" subtitle="Combine multiple essences into a singular bundle." />
                                                <div className="flex items-center gap-3 glass px-4 py-2 rounded-xl border-white/5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Is Bundle</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, is_bundle: !prev.is_bundle }))}
                                                        className={`w-12 h-6 rounded-full transition-all relative ${formData.is_bundle ? "bg-blue-500" : "bg-white/10"}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_bundle ? "left-7" : "left-1"}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            {formData.is_bundle ? (
                                                <div className="space-y-4">
                                                    {formData.bundle_items.map((item, idx) => (
                                                        <div key={idx} className="glass p-6 rounded-[2rem] border-white/5 flex flex-wrap items-end gap-6 relative group">
                                                            <div className="flex-[2] min-w-[200px]">
                                                                <InputField
                                                                    label="Component Name"
                                                                    value={item.name}
                                                                    onChange={(e: any) => {
                                                                        const newItems = [...formData.bundle_items];
                                                                        newItems[idx].name = e.target.value;
                                                                        setFormData(prev => ({ ...prev, bundle_items: newItems }));
                                                                    }}
                                                                    placeholder="Hydration Mist..."
                                                                />
                                                            </div>
                                                            <div className="w-24">
                                                                <InputField
                                                                    label="Qty"
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={(e: any) => {
                                                                        const newItems = [...formData.bundle_items];
                                                                        newItems[idx].quantity = parseInt(e.target.value);
                                                                        setFormData(prev => ({ ...prev, bundle_items: newItems }));
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-[100px]">
                                                                <InputField
                                                                    label="Value Basis"
                                                                    type="number"
                                                                    value={item.price}
                                                                    onChange={(e: any) => {
                                                                        const newItems = [...formData.bundle_items];
                                                                        newItems[idx].price = parseFloat(e.target.value);
                                                                        setFormData(prev => ({ ...prev, bundle_items: newItems }));
                                                                    }}
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newItems = formData.bundle_items.filter((_, i) => i !== idx);
                                                                    setFormData(prev => ({ ...prev, bundle_items: newItems }));
                                                                }}
                                                                className="p-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, bundle_items: [...prev.bundle_items, { name: "", quantity: 1, price: 0 }] }))}
                                                        className="w-full py-6 border-2 border-dashed border-white/5 rounded-[2rem] text-zinc-500 hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-3 group"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Component</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-48 text-zinc-500 glass border-white/5 rounded-[2rem]">
                                                    <Box className="w-10 h-10 mb-4 opacity-10" />
                                                    <p className="text-[10px] uppercase tracking-widest font-black">Singularity Mode Active</p>
                                                    <p className="text-[10px] mt-1 text-zinc-600">Toggle "Is Bundle" to start assembly.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 md:pb-0">
                                    <div className="flex items-center gap-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Core Logic
                                        </div>
                                        <div className="w-px h-3 bg-white/10" />
                                        <div className="text-blue-400">Ready</div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 sm:hidden px-6 py-5 glass text-zinc-400 rounded-[1.25rem] font-bold text-[10px] uppercase tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] sm:flex-none px-8 md:px-12 py-5 bg-white text-black rounded-[1.25rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/10"
                                        >
                                            {loading ? "Saving..." : initialData ? "Update" : "Create"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{title}</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{subtitle}</p>
        </div>
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

function LinkField({ label, value, ...props }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                <Tag className="w-3 h-3" />
                {label}
            </label>
            <input
                {...props}
                value={value ?? ""}
                className="w-full bg-white/[0.015] border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-zinc-500/50 transition-all text-[10px] font-mono"
            />
        </div>
    );
}
