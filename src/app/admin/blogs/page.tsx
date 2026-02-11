"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink, FileText, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { BlogForm } from "@/components/admin/BlogForm";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";


export default function BlogsPage() {
    const [search, setSearch] = useState("");
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    // Fetch blogs from Supabase
    const fetchBlogs = async () => {
        const { data, error } = await supabase
            .from('blogs')
            .select(`
                *,
                profiles:author_id (full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching blogs:", error);
        } else if (data) {
            const getValidUrl = (url: any) => {
                if (!url || typeof url !== 'string') return "/placeholder.jpg";
                if (url.startsWith('/')) return url;
                if (url.startsWith('http')) return url;
                return "/placeholder.jpg";
            };

            // Map DB fields to UI fields if necessary, but schema is close.
            // UI expects: id, title, excerpt, coverImage, author, readTime, date, status, slug, content
            // DB has: id, title, slug, content, image, author_id, created_at
            const mappedBlogs = data.map((blog: any) => ({
                id: blog.id,
                title: blog.title,
                excerpt: blog.content?.substring(0, 100).replace(/<[^>]*>?/gm, "") + "...", // Auto-excerpt
                coverImage: getValidUrl(blog.image),
                author: blog.profiles?.full_name || "Admin",
                readTime: "5 min", // Mock read time for now
                date: new Date(blog.created_at).toLocaleDateString(),
                status: "Published", // defaulting for now
                slug: blog.slug,
                content: blog.content
            }));
            setBlogs(mappedBlogs);
        }
        setIsHydrated(true);
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleAdd = () => {
        setEditingBlog(null);
        setIsFormOpen(true);
    };

    const handleEdit = (blog: any) => {
        setEditingBlog(blog);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this story?")) {
            const { error } = await supabase.from('blogs').delete().eq('id', id);
            if (!error) {
                setBlogs(prev => prev.filter(b => b.id !== id));
            } else {
                alert("Error deleting blog: " + error.message);
            }
        }
    };

    const handleFormSubmit = (data: any) => {
        // Form handles DB internally now, just refresh
        fetchBlogs();
        setIsFormOpen(false);
    };

    const filteredBlogs = blogs.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase())
    );

    if (!isHydrated) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Editorial Manager</h1>
                    <p className="text-zinc-500 text-sm mt-1">Craft and manage your brand stories.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/blog-categories"
                        className="flex items-center gap-2 px-6 py-3 glass rounded-xl font-bold hover:bg-white/5 transition-all active:scale-95 text-sm"
                    >
                        <Tag className="w-4 h-4 text-zinc-400" />
                        Categories
                    </Link>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 w-full sm:w-auto justify-center text-sm shadow-xl shadow-white/5"
                    >
                        <Plus className="w-4 h-4" />
                        New Story
                    </button>
                </div>
            </div>

            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Stories..."
                    className="bg-[#050505] border border-white/5 rounded-lg py-2 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-all text-xs w-full"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredBlogs.map((blog, i) => (
                        <motion.div
                            key={blog.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <GlassCard className="p-0 overflow-hidden border-white/5 group h-full flex flex-col">
                                <div className="relative h-48 w-full overflow-hidden">
                                    <Image
                                        src={blog.coverImage}
                                        alt={blog.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(blog)}
                                            className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(blog.id)}
                                            className="p-2 bg-red-500/10 backdrop-blur-md rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="text-[8px] uppercase tracking-widest font-black bg-blue-500 px-2 py-1 rounded">
                                            {blog.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">
                                        <span>{blog.date}</span>
                                        <span>•</span>
                                        <span>{blog.readTime}</span>
                                    </div>
                                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-zinc-500 text-xs line-clamp-3 mb-6">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full glass flex items-center justify-center text-[10px] font-bold text-blue-400">
                                                {blog.author[0]}
                                            </div>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{blog.author}</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-zinc-600" />
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <BlogForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingBlog}
            />
        </div>
    );
}
