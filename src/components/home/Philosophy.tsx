"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, Leaf, Droplets } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { MediaSlider } from "@/components/ui/MediaSlider";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function Philosophy(props: { initialContent?: any }) {
    const searchParams = useSearchParams();
    const isAdminPreview = searchParams.get('admin_preview') === 'true';

    const handleSelect = () => {
        if (isAdminPreview) {
            window.parent.postMessage({ type: 'SELECT_SECTION', section: 'philosophy' }, '*');
        }
    };

    const content = useContent('content_philosophy', props.initialContent) || {};
    if (content.visible === false) return null;

    const {
        title_top = "", title_highlight = "", title_bottom = "", description = "",
        media = [], stat_number = "", stat_text_highlight = "", stat_text = "", points = []
    } = content;

    const ICONS = [
        <Sparkles key="1" className="w-6 h-6 text-blue-400" />,
        <Leaf key="2" className="w-6 h-6 text-emerald-400" />,
        <Droplets key="3" className="w-6 h-6 text-purple-400" />
    ];

    return (
        <section
            onClick={handleSelect}
            className={cn(
                "py-20 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-background transition-colors duration-300",
                isAdminPreview && "cursor-pointer hover:ring-4 hover:ring-blue-500/50 hover:ring-inset transition-all z-50"
            )}
        >
            {/* Background Media */}
            {content.bg_media && content.bg_media.length > 0 && (
                <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none">
                    <MediaSlider media={content.bg_media} className="h-full w-full" objectFit="cover" overlay />
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {content.header_visible !== false && (
                            <ScrollReveal direction="up" delay={0.1}>
                                <h2 className="text-[clamp(1.75rem,8vw,4rem)] font-bold mb-6 md:mb-8 leading-[1.2] text-zinc-900 dark:text-white">
                                    {title_top} <br className="hidden sm:block" />
                                    <span className="text-gradient">{title_highlight}</span> {title_bottom}
                                </h2>
                            </ScrollReveal>
                        )}
                        {content.description_visible !== false && (
                            <ScrollReveal direction="up" delay={0.3}>
                                <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-12 max-w-lg">
                                    {description}
                                </p>
                            </ScrollReveal>
                        )}

                        <div className="space-y-8">
                            {points?.filter((point: any) => point.visible !== false).map((point: any, i: number) => (
                                <ScrollReveal key={i} direction="right" delay={0.4 + (i * 0.1)}>
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 glass dark:glass rounded-2xl flex items-center justify-center shrink-0 border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
                                            {ICONS[i % ICONS.length]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">{point.title}</h3>
                                            <p className="text-zinc-500 dark:text-zinc-400">{point.description}</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </motion.div>

                    <div className="relative">
                        {content.media_visible !== false && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                className="rounded-[2rem] overflow-hidden relative w-full group"
                            >
                                {/* Dark Mode Aura Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/10 dark:bg-purple-600/15 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                <div className="relative w-full min-h-[400px] md:min-h-[500px]">
                                    <MediaSlider media={media} objectFit="cover" />
                                </div>
                            </motion.div>
                        ) || null}

                        {content.stat_visible !== false && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, y: 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="absolute -bottom-8 -right-4 md:-bottom-12 md:-right-12 w-48 h-48 sm:w-64 sm:h-64 glass dark:glass rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border-zinc-200 dark:border-white/20 flex flex-col justify-center shadow-2xl shadow-blue-500/10 overflow-hidden group bg-white/80 dark:bg-white/5 z-20"
                            >
                                {/* Inner Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />

                                <div className="relative">
                                    <span className="text-4xl sm:text-6xl font-black block mb-3 sm:mb-4 tracking-tighter text-gradient leading-tight">
                                        {stat_number}
                                    </span>
                                    <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-transparent mb-6" />
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                                        <span className="text-zinc-900 dark:text-white font-bold">{stat_text_highlight}</span> {stat_text}
                                    </p>
                                </div>

                                {/* Decorative Corner */}
                                <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-blue-500/40" />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
