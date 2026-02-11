"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, User, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/lib/supabase";


export default function BlogIndex() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const fetchBlogs = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('blogs')
                .select(`
                    *,
                    profiles:author_id (full_name)
                `)
                .order('created_at', { ascending: false });

            if (data) {
                const getValidUrl = (url: any) => {
                    if (!url || typeof url !== 'string') return "/placeholder.jpg";
                    if (url.startsWith('/')) return url;
                    if (url.startsWith('http')) return url;
                    return "/placeholder.jpg";
                };

                const mapped = data.map((b: any) => {
                    const validImage = getValidUrl(b.image);
                    return {
                        ...b,
                        coverImage: validImage,
                        author: b.profiles?.full_name || "Admin",
                        readTime: "5 min",
                        date: new Date(b.created_at).toLocaleDateString()
                    };
                });
                console.log("Blog data loaded:", mapped);
                setBlogs(mapped);
            }
            setIsHydrated(true);
        };
        fetchBlogs();
    }, []);

    if (!isHydrated) return null;

    return (
        <main className="min-h-screen bg-mesh pt-24 md:pt-32 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 glass rounded-full border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6"
                    >
                        The Chronicles
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-[clamp(2.5rem,10vw,4.5rem)] font-bold mb-6 tracking-tighter leading-[1.1]"
                    >
                        Whispers of <span className="text-gradient">Nature</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 max-w-2xl mx-auto text-lg"
                    >
                        Insights into the alchemy of wellness, molecular science, and the art of intentional living.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {blogs.map((blog, i) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link href={`/blog/${blog.slug}`}>
                                    <GlassCard className="p-0 border-white/5 overflow-hidden group h-full flex flex-col hover:border-blue-500/30 transition-all duration-500">
                                        <div className="relative h-64 w-full overflow-hidden">
                                            <Image
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60" />
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {blog.date}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-blue-400">
                                                    <Clock className="w-3 h-3" />
                                                    {blog.readTime}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors leading-tight line-clamp-2">
                                                {blog.title}
                                            </h2>
                                            <p className="text-zinc-500 text-sm mb-8 line-clamp-3 leading-relaxed">
                                                {blog.excerpt}
                                            </p>
                                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full glass flex items-center justify-center font-bold text-blue-400 border-white/10 text-[10px]">
                                                        {blog.author[0]}
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">{blog.author}</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full glass border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
