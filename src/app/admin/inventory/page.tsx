"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useRouter } from "next/navigation";


export default function InventoryPage() {
    const [search, setSearch] = useState("");
    const [inventory, setInventory] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCatFormOpen, setIsCatFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
    const [isHydrated, setIsHydrated] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    // Fetch data from Supabase
    const fetchData = async () => {
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (products) setInventory(products);
        if (prodError) console.error("Error fetching products:", prodError);

        const { data: cats, error: catError } = await supabase
            .from('categories')
            .select('name')
            .order('name');

        if (cats) setCategories(cats.map((c: any) => c.name));
        if (catError) console.error("Error fetching categories:", catError);

        setIsHydrated(true);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Refresh data after updates
    const handleRefresh = () => {
        fetchData();
    };

    // Remove legacy localStorage effects

    const handleAdd = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setIsCatFormOpen(true);
    };

    const handleEditCategory = (name: string) => {
        setEditingCategory({ name });
        setIsCatFormOpen(true);
    };

    const handleCategorySubmit = (name: string) => {
        if (editingCategory) {
            const oldName = editingCategory.name;
            setCategories(prev => prev.map(c => c === oldName ? name : c));
            setCategories(prev => prev.map(c => c === oldName ? name : c));
            setInventory(prev => prev.map(p => {
                const newCategories = p.categories ? p.categories.map((c: string) => c === oldName ? name : c) : [];
                // Handle legacy category field update as well if it matches
                const newCategory = p.category === oldName ? name : p.category;
                return { ...p, category: newCategory, categories: newCategories.length ? newCategories : (p.category === oldName ? [name] : []) };
            }));
        } else {
            if (!categories.includes(name)) {
                setCategories(prev => [...prev, name]);
            }
        }
    };

    const handleDeleteCategory = async (name: string) => {
        const count = inventory.filter(p => p.categories?.includes(name) || p.category === name).length;
        if (confirm(`Deleting this category will leave ${count} producs uncategorized. Proceed?`)) {
            // Real deletion logic needed for DB, for now we just UI update but ideally we delete row
            // But category deletion is complex due to FK.
            // Simplification: We only delete from UI state for now, but implementation below
            const { error } = await supabase.from('categories').delete().eq('name', name);
            if (!error) handleRefresh();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) {
                setInventory(prev => prev.filter(p => p.id !== id));
            } else {
                console.error("Delete error:", error);
                alert(`Error deleting product: ${error.message}`);
            }
        }
    };

    const handleFormSubmit = (data: any) => {
        // Form now handles submission internally via prop, but we need to refresh
        handleRefresh();
        setIsFormOpen(false);
    };

    const handleCategoryFormSubmit = () => {
        handleRefresh();
        setIsCatFormOpen(false);
    }

    const filteredInventory = inventory.filter(p =>
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())) &&
        (selectedCategory === "All" || p.categories?.includes(selectedCategory) || p.category === selectedCategory)
    );

    const filteredCategories = categories.filter(c => c.toLowerCase().includes(search.toLowerCase()));

    if (!isHydrated) return null; // Prevent hydration mismatch

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Inventory Manager</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage your product catalog and categories.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveTab("products")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                                activeTab === "products" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab("categories")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                                activeTab === "categories" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            Categories
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={activeTab === "products" ? "Search Products..." : "Filter Categories..."}
                            className="bg-[#050505] border border-white/5 rounded-lg py-2 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-all text-xs w-full sm:w-64"
                        />
                    </div>
                    {activeTab === "products" && (
                        <div className="relative flex-1 sm:flex-initial">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-[#050505] border border-white/5 rounded-lg py-2 pl-10 pr-8 outline-none focus:border-blue-500/50 transition-all text-[10px] font-bold uppercase tracking-widest appearance-none"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <button
                    onClick={activeTab === "products" ? handleAdd : handleAddCategory}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 w-full sm:w-auto justify-center text-sm shadow-xl shadow-white/5"
                >
                    <Plus className="w-4 h-4" />
                    {activeTab === "products" ? "New Product" : "New Category"}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "products" ? (
                    <motion.div
                        key="products"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <GlassCard className="p-0 overflow-hidden border-white/5">
                            {/* Table Header */}
                            <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 bg-white/[0.02] border-b border-white/5">
                                <div className="col-span-1">Image</div>
                                <div className="col-span-4">Product Name</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-1">Stock</div>
                                <div className="col-span-2">Price</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-1 text-right">Actions</div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filteredInventory.map((item, i) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex flex-col lg:grid lg:grid-cols-12 gap-4 px-6 md:px-8 py-6 lg:py-5 items-start lg:items-center hover:bg-white/[0.03] transition-colors group relative"
                                        >
                                            <div className="lg:col-span-1 flex items-center justify-between w-full lg:w-auto">
                                                <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-white/5">
                                                    {item.image ? (
                                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-[8px] text-zinc-600 font-bold uppercase text-center">No Imagery</div>
                                                    )}
                                                </div>
                                                <div className="lg:hidden flex items-center gap-1">
                                                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-blue-400 transition-all"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <div className="lg:col-span-4 w-full">
                                                <p className="text-sm md:text-base lg:text-sm font-bold group-hover:text-blue-400 transition-colors uppercase tracking-wider">{item.name}</p>
                                                <p className="text-[10px] text-zinc-500 tracking-widest mt-1 font-mono">{item.id}</p>
                                            </div>
                                            <div className="lg:col-span-2 flex items-center gap-4 lg:gap-0 w-full lg:w-auto text-[10px] font-bold uppercase tracking-widest">
                                                <span className="lg:hidden text-zinc-500 w-16">Category:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.categories && item.categories.length > 0 ? (
                                                        item.categories.map((c: string) => (
                                                            <span key={c} className="glass px-3 py-1 rounded-full border-white/5 text-zinc-300">{c}</span>
                                                        ))
                                                    ) : (
                                                        <span className="glass px-3 py-1 rounded-full border-white/5 text-zinc-300">{item.category || "Uncategorized"}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="lg:col-span-1 flex items-center gap-4 lg:gap-0 w-full lg:w-auto font-mono text-xs">
                                                <span className="lg:hidden text-[10px] text-zinc-500 font-bold uppercase tracking-widest w-16">Stock:</span>
                                                {item.stock}
                                            </div>
                                            <div className="lg:col-span-2 flex items-center gap-4 lg:gap-0 w-full lg:w-auto font-bold text-blue-400 text-sm">
                                                <span className="lg:hidden text-[10px] text-zinc-500 font-bold uppercase tracking-widest w-16">Price:</span>
                                                {item.currency === 'USD' ? '$' : item.currency === 'EUR' ? '€' : item.currency === 'INR' ? '₹' : ''}{item.price}
                                            </div>
                                            <div className="lg:col-span-1 flex items-center gap-4 lg:gap-0 w-full lg:w-auto">
                                                <span className="lg:hidden text-[10px] text-zinc-500 font-bold uppercase tracking-widest w-16">Status:</span>
                                                <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]", item.status === "Active" ? "text-emerald-400" : item.status === "Low Stock" ? "text-amber-400" : "text-red-400")}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", item.status === "Active" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : item.status === "Low Stock" ? "bg-amber-400" : "bg-red-400")} />
                                                    {item.status}
                                                </div>
                                            </div>
                                            <div className="hidden lg:flex lg:col-span-1 text-right space-x-1 justify-end">
                                                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div
                        key="categories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredCategories.map((cat, i) => {
                                const prodCount = inventory.filter(p => p.categories?.includes(cat) || p.category === cat).length;
                                const totalVal = inventory.filter(p => p.categories?.includes(cat) || p.category === cat).reduce((sum, p) => sum + parseFloat(p.price), 0);
                                return (
                                    <motion.div
                                        key={cat}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <GlassCard className="p-6 border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors uppercase tracking-wider">{cat}</h3>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Global Category</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleEditCategory(cat)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteCategory(cat)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Products</p>
                                                    <p className="text-xl font-mono">{prodCount} <span className="text-[10px] text-zinc-600 font-sans tracking-normal font-normal">Units</span></p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Total Value</p>
                                                    <p className="text-xl font-mono text-blue-400">${totalVal.toFixed(0)}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => { setSelectedCategory(cat); setActiveTab("products"); }}
                                                className="w-full mt-6 py-3 rounded-xl glass border-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                            >
                                                View Category Products
                                                <ExternalLink className="w-3 h-3" />
                                            </button>

                                            {/* Decorative Gradient */}
                                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProductForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingProduct}
                categories={categories}
            />

            <CategoryForm
                isOpen={isCatFormOpen}
                onClose={() => setIsCatFormOpen(false)}
                onSubmit={handleCategoryFormSubmit}
                initialData={editingCategory}
            />
        </div>
    );
}
