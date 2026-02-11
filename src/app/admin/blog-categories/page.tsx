"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Tag } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createClient();

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('blog_categories')
            .select('*')
            .order('name', { ascending: true });
        if (data) setCategories(data);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setIsLoading(true);
        const slug = newCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const { error } = await supabase
            .from('blog_categories')
            .insert([{ name: newCategory, slug }]);

        if (error) {
            alert("Error creating category: " + error.message);
        } else {
            setNewCategory("");
            fetchCategories();
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category?")) return;

        const { error } = await supabase
            .from('blog_categories')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Error deleting category: " + error.message);
        } else {
            setCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Blog Categories</h1>
                    <p className="text-zinc-500 text-sm mt-1">Organize your stories.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Form */}
                <GlassCard className="p-6 border-white/5 h-fit">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-400" />
                        Add New Category
                    </h2>
                    <form onSubmit={handleAdd} className="flex gap-4">
                        <input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Category Name"
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-sm"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
                        >
                            {isLoading ? "..." : "Add"}
                        </button>
                    </form>
                </GlassCard>

                {/* List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {categories.map((category) => (
                            <motion.div
                                key={category.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <GlassCard className="p-4 border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <Tag className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{category.name}</p>
                                            <p className="text-xs text-zinc-500 font-mono">/{category.slug}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))}
                        {categories.length === 0 && (
                            <div className="text-center py-12 text-zinc-500 text-sm">
                                No categories yet. Add one to get started.
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
