"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Star } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { MediaSlider } from "@/components/ui/MediaSlider";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const TESTIMONIALS: any[] = [];

export function ClientRituals(props: { initialContent?: any }) {
    const searchParams = useSearchParams();
    const isAdminPreview = searchParams.get('admin_preview') === 'true';

    const handleSelect = () => {
        if (isAdminPreview) {
            window.parent.postMessage({ type: 'SELECT_SECTION', section: 'testimonials' }, '*');
        }
    };

    const content = useContent('content_testimonials', props.initialContent);

    if (content?.visible === false) return null;
    const items = content?.items || [];
    if (items.length === 0 && !isAdminPreview) return null;

    return (
        <section
            onClick={handleSelect}
            className={cn(
                "py-20 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-background transition-colors duration-300",
                isAdminPreview && "cursor-pointer hover:ring-4 hover:ring-blue-500/50 hover:ring-inset transition-all z-50"
            )}
        >
            {/* Background Media */}
            {content.media && content.media.length > 0 && (
                <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
                    <MediaSlider media={content.media} className="h-full w-full" objectFit="cover" overlay />
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                {content.header_visible !== false && (
                    <div className="text-center mb-20">
                        <ScrollReveal direction="up">
                            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">{content.subheading || "The Echoes"}</span>
                        </ScrollReveal>
                        <ScrollReveal direction="up" delay={0.1}>
                            <h2 className="text-[clamp(1.75rem,8vw,4rem)] font-bold text-zinc-900 dark:text-white leading-tight">
                                {content.heading || "Client Rituals"}
                            </h2>
                        </ScrollReveal>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.filter((t: any) => t.visible !== false).map((t: any, i: number) => (
                        <ScrollReveal
                            key={t.author}
                            direction="up"
                            delay={0.2 + (i * 0.1)}
                        >
                            <GlassCard className="h-full flex flex-col justify-between group hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-500 bg-white/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:-translate-y-2">
                                <div>
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400" />
                                        ))}
                                    </div>
                                    <p className="text-lg text-zinc-600 dark:text-zinc-300 italic mb-8 leading-relaxed">
                                        "{t.content}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full glass dark:glass border-zinc-200 dark:border-white/10 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-white/5">
                                        {t.author[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-widest text-xs">{t.author}</h4>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase tracking-widest font-bold">{t.role}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
