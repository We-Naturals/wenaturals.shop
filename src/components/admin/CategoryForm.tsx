"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    initialData?: { name: string } | null;
}

export function CategoryForm({ isOpen, onClose, onSubmit, initialData }: CategoryFormProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
        } else {
            setName("");
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

        try {
            if (initialData) {
                // Update
                const { error } = await supabase
                    .from('categories')
                    .update({ name, slug })
                    .eq('name', initialData.name);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('categories')
                    .insert([{ name, slug }]);
                if (error) throw error;
            }
            onSubmit();
            onClose();
        } catch (error: any) {
            console.error("Error saving category:", error);
            alert(`Error saving category: ${error.message || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md glass rounded-3xl border-white/10 overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 glass rounded-lg text-blue-400">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold uppercase tracking-widest">
                                    {initialData ? "Edit Category" : "New Category"}
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Category Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter category name..."
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-4 px-4 outline-none focus:border-blue-500/50 transition-all font-geist"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                            >
                                {loading ? "Saving..." : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {initialData ? "Apply Changes" : "Create Category"}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
