"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { useContent } from "@/hooks/useContent";
import { useSearchParams } from "next/navigation";
import { MediaSlider } from "@/components/ui/MediaSlider";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function RitualJournal(props: { initialContent?: any }) {
    const searchParams = useSearchParams();
    const isAdminPreview = searchParams.get('admin_preview') === 'true';

    const handleSelect = () => {
        if (isAdminPreview) {
            window.parent.postMessage({ type: 'SELECT_SECTION', section: 'sections' }, '*');
        }
    };

    const content = useContent('content_journal', props.initialContent);
    const [posts, setPosts] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    if (content?.visible === false) return null;

    useEffect(() => {
        setIsMounted(true);
        const fetchRecentBlogs = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('blogs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(7);

            if (data) {
                const getValidUrl = (url: any) => {
                    if (!url || typeof url !== 'string') return "/placeholder.jpg";
                    if (url.startsWith('/')) return url;
                    if (url.startsWith('http')) return url;
                    return "/placeholder.jpg";
                };

                setPosts(data.map((post: any) => ({
                    ...post,
                    coverImage: getValidUrl(post.image),
                    readTime: "5 min",
                })));
            }
        };
        fetchRecentBlogs();
    }, []);

    // Auto-rotate
    useEffect(() => {
        if (posts.length < 2) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % posts.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [posts.length]);

    // Helper to determine position relative to active index
    const getCardStyle = (index: number) => {
        const total = posts.length;
        if (total === 0) return {};

        // Calculate circular distance
        let offset = (index - activeIndex + total) % total;
        // Adjust for shortest path
        if (offset > total / 2) offset -= total;

        const isMobile = window.innerWidth < 768;

        // Styles based on offset
        if (offset === 0) {
            return { x: "0%", scale: 1, zIndex: 50, opacity: 1, rotateY: 0 };
        } else if (offset === 1) {
            return { x: isMobile ? "45%" : "60%", scale: 0.8, zIndex: 40, opacity: 0.7, rotateY: -20 };
        } else if (offset === -1) {
            return { x: isMobile ? "-45%" : "-60%", scale: 0.8, zIndex: 40, opacity: 0.7, rotateY: 20 };
        } else if (offset === 2) {
            return { x: isMobile ? "80%" : "110%", scale: 0.6, zIndex: 30, opacity: 0.5, rotateY: -35 };
        } else if (offset === -2) {
            return { x: isMobile ? "-80%" : "-110%", scale: 0.6, zIndex: 30, opacity: 0.5, rotateY: 35 };
        } else {
            return { x: "0%", scale: 0.5, zIndex: 10, opacity: 0, display: "none" };
        }
    };

    const { heading_start, heading_highlight, subheading, cta_text } = content;

    if (!isMounted) return null; // Simplified server render

    return (
        <section
            onClick={handleSelect}
            className={cn(
                "py-20 md:py-32 px-4 sm:px-6 bg-background overflow-hidden relative transition-colors duration-300",
                isAdminPreview && "cursor-pointer hover:ring-4 hover:ring-blue-500/50 hover:ring-inset transition-all z-50"
            )}
        >
            {/* Background Media */}
            {content.media && content.media.length > 0 && (
                <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none">
                    <MediaSlider media={content.media} className="h-full w-full" objectFit="cover" overlay />
                </div>
            )}

            <div className="max-w-[1920px] mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 max-w-7xl mx-auto">
                    <div>
                        {content.header_visible !== false && (
                            <ScrollReveal direction="left">
                                <h2 className="text-[clamp(1.75rem,8vw,4rem)] font-bold mb-4 md:mb-6 text-zinc-900 dark:text-white leading-tight">
                                    {heading_start} <span className="text-gradient">{heading_highlight}</span>
                                </h2>
                            </ScrollReveal>
                        )}
                        {content.subheading_visible !== false && (
                            <ScrollReveal direction="left" delay={0.2}>
                                <p className="text-zinc-600 dark:text-zinc-500 max-w-lg text-sm md:text-base">{subheading}</p>
                            </ScrollReveal>
                        )}
                    </div>
                    {content.cta_visible !== false && (
                        <ScrollReveal direction="right" className="w-full sm:w-auto">
                            <Link href="/blog" className="block">
                                <button className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto glass dark:glass rounded-full font-bold hover:bg-zinc-200 dark:hover:bg-white/10 transition-all text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 group text-sm">
                                    {cta_text} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </ScrollReveal>
                    )}
                </div>

                <div className="relative h-[450px] md:h-[600px] flex items-center justify-center" style={{ perspective: "1000px" }}>
                    {posts.length > 0 && posts.map((post, i) => (
                        <motion.div
                            key={post.id || i}
                            animate={getCardStyle(i)}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute w-[220px] md:w-[320px] h-[300px] md:h-[450px] rounded-[2.5rem] shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden"
                            onClick={() => setActiveIndex(i)}
                        >
                            <Link href={post.slug !== "#" ? `/blog/${post.slug}` : "/blog"} className="block h-full cursor-pointer">
                                <div className="p-0 overflow-hidden h-full flex flex-col bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-[2.5rem]">
                                    <div className="h-3/5 overflow-hidden relative">
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-[#050505] to-transparent opacity-80" />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-end">
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                                            {content.tag_visible !== false && (
                                                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                                                    {content.tag_label || "Editorial"}
                                                </span>
                                            )}
                                            {post.date && (
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {post.date}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-zinc-900 dark:text-white shadow-none dark:shadow-black dark:drop-shadow-lg">{post.title}</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-xs line-clamp-2 md:line-clamp-3">{post.excerpt}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-zinc-500">No journal entries yet.</div>
                    )}
                </div>
            </div>
        </section>
    );
}
