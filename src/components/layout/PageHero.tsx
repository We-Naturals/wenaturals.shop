"use client";

import { motion } from "framer-motion";
import { MediaSlider, MediaItem } from "@/components/ui/MediaSlider";
import { cn } from "@/lib/utils";

interface PageHeroProps {
    title: string;
    description?: string;
    media?: MediaItem[];
    className?: string;
}

export function PageHero({ title, description, media = [], className }: PageHeroProps) {
    return (
        <section className={cn("relative flex items-center pt-24 md:pt-32 pb-16 md:pb-20 px-4 sm:px-6 overflow-hidden", className)}>
            {/* Background Media */}
            {media.length > 0 ? (
                <div className="absolute inset-0 z-0">
                    <MediaSlider media={media} className="h-full w-full" objectFit="cover" overlay />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background dark:from-black dark:via-black/40 dark:to-black" />
                </div>
            ) : (
                <div className="absolute inset-0 z-0 bg-background">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background dark:from-black dark:via-transparent dark:to-black" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
                </div>
            )}

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl"
                >
                    <h1 className="text-[clamp(2.25rem,10vw,4rem)] font-bold mb-4 md:mb-6 tracking-tight leading-[1.1]">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-base md:text-xl text-zinc-400 leading-relaxed font-medium max-w-2xl">
                            {description}
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
