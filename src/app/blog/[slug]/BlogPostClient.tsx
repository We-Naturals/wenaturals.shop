"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";

interface BlogPostClientProps {
    blog: any;
    relatedProducts: any[];
}

const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.endsWith(ext)) || lowerUrl.includes('cloudinary.com') && lowerUrl.includes('/video/upload/');
};

export default function BlogPostClient({ blog, relatedProducts }: BlogPostClientProps) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const mediaItems = blog.media || [blog.coverImage];

    useEffect(() => {
        setIsHydrated(true);
        const bookmarks = JSON.parse(localStorage.getItem("we-naturals-bookmarks") || "[]");
        if (blog && bookmarks.includes(blog.id)) {
            setIsBookmarked(true);
        }
    }, [blog]);

    // Auto-swipe for multimedia covers
    useEffect(() => {
        if (!isHydrated || mediaItems.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isHydrated, mediaItems.length]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.excerpt,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const handleBookmark = () => {
        const bookmarks = JSON.parse(localStorage.getItem("we-naturals-bookmarks") || "[]");
        let newBookmarks;

        if (isBookmarked) {
            newBookmarks = bookmarks.filter((id: string) => id !== blog.id);
        } else {
            newBookmarks = [...bookmarks, blog.id];
        }

        localStorage.setItem("we-naturals-bookmarks", JSON.stringify(newBookmarks));
        setIsBookmarked(!isBookmarked);
    };

    if (!isHydrated) return null;

    return (
        <main className="min-h-screen bg-mesh pb-20">


            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] w-full pt-20 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMediaIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                    >
                        {isVideo(mediaItems[currentMediaIndex]) ? (
                            <video
                                src={mediaItems[currentMediaIndex]}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Image
                                src={mediaItems[currentMediaIndex] || "/placeholder.jpg"}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

                {mediaItems.length > 1 && (
                    <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-2 z-20">
                        {mediaItems.map((_: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentMediaIndex(idx)}
                                className={`w-1 h-8 rounded-full transition-all duration-500 ${currentMediaIndex === idx ? "bg-blue-400 scale-y-125" : "bg-white/20 hover:bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] mb-8">
                                <ChevronLeft className="w-4 h-4" />
                                Back to Archives
                            </Link>

                            <h1 className="text-[clamp(2rem,8vw,4rem)] font-bold mb-6 md:mb-8 tracking-tighter leading-[1.1]">
                                {blog.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-8 border-t border-white/10 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full glass flex items-center justify-center font-bold text-blue-400 border-white/10">
                                        {blog.author[0]}
                                    </div>
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-black">Author</p>
                                        <p className="text-xs font-bold">{blog.author}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 h-10 border-l border-white/10 pl-8">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-black">Published</p>
                                        <p className="text-xs font-bold">{blog.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-black">Reading Time</p>
                                        <p className="text-xs font-bold text-blue-400">{blog.readTime}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 md:-mt-32 relative z-10 pb-20">
                <GlassCard className="p-6 md:p-16 border-white/5 shadow-2xl shadow-black overflow-hidden backdrop-blur-3xl">
                    {/* Short Excerpt */}
                    {blog.excerpt && (
                        <div className="mb-8 font-serif text-xl md:text-2xl text-zinc-300 italic leading-relaxed border-l-2 border-blue-500 pl-6 my-8">
                            {blog.excerpt}
                        </div>
                    )}

                    {relatedProducts.length > 0 && (
                        <div className="mb-12 pb-12 border-b border-white/5">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-8 text-zinc-500">Shop the Story</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {relatedProducts.map(product => (
                                    <Link key={product.id} href={`/shop/${product.slug}`} className="group block">
                                        <div className="glass rounded-2xl p-4 flex items-center gap-6 hover:bg-white/5 transition-all">
                                            <div className="w-20 h-20 rounded-xl bg-black/20 overflow-hidden relative flex-shrink-0">
                                                <Image
                                                    src={product.media?.[0] || "/placeholder.jpg"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{product.name}</h4>
                                                <p className="text-zinc-500 text-sm mt-1">{product.currency === 'USD' ? '$' : '₹'}{product.price}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div
                        className="prose prose-invert prose-blue max-w-none text-zinc-300 leading-relaxed font-sans text-lg 
                            break-words overflow-wrap-anywhere
                            prose-headings:font-bold prose-headings:tracking-tighter prose-headings:text-white
                            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                            prose-p:mb-8 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-2 prose-blockquote:rounded-r-xl
                            prose-strong:text-white prose-img:rounded-3xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-12
                            prose-hr:border-white/10
                            [&_iframe]:rounded-3xl [&_iframe]:border [&_iframe]:border-white/10 [&_iframe]:shadow-2xl [&_iframe]:my-12 [&_iframe]:w-full [&_iframe]:aspect-video"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    <div className="mt-16 pt-16 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-6 py-3 glass rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all outline-none active:scale-95"
                            >
                                <Share2 className="w-4 h-4" />
                                Share Story
                            </button>
                            <button
                                onClick={handleBookmark}
                                className={`p-3 glass rounded-xl border-white/5 transition-all outline-none active:scale-95 ${isBookmarked ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 'hover:text-blue-400'}`}
                            >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}
