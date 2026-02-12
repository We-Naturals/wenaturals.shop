"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitText } from "@/components/ui/SplitText";
import { LiquidText } from "@/components/ui/LiquidText";
import { KineticTypography } from "@/components/ui/KineticTypography";
import { useContent } from "@/hooks/useContent";
import { MediaSlider } from "@/components/ui/MediaSlider";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { AlchemicalSurface } from "@/components/ui/AlchemicalSurface";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

export function Hero(props: { initialContent?: any }) {
    const { performance, theme } = useEnvironment();
    const isAnimationEnabled = !performance.eco_mode && theme.animationIntensity > 0;
    const searchParams = useSearchParams();
    const isAdminPreview = searchParams.get('admin_preview') === 'true';

    const handleSelect = () => {
        if (isAdminPreview) {
            window.parent.postMessage({ type: 'SELECT_SECTION', section: 'home' }, '*');
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Parallax Effects - Gated by performance setting
    const isParallaxEnabled = performance?.parallax_enabled !== false;

    const y1 = useTransform(scrollY, [0, 500], [0, isParallaxEnabled ? 200 : 0]);
    const y2 = useTransform(scrollY, [0, 500], [0, isParallaxEnabled ? -150 : 0]);
    const rotate = useTransform(scrollY, [0, 500], [0, isParallaxEnabled ? 5 : 0]);
    const opacity = useTransform(scrollY, [0, 300], [1, isParallaxEnabled ? 0 : 1]);

    const content = useContent('content_homepage', props.initialContent);
    if (content?.visible === false) return null;

    const hero = content?.hero || {};
    const {
        title_part_1 = "", title_part_2 = "", title_part_3 = "", title_part_4 = "",
        subtext = "", cta_primary_text = "", cta_primary_link = "",
        cta_secondary_text = "", cta_secondary_link = "",
        media = []
    } = hero;

    return (
        <section
            ref={containerRef}
            onClick={handleSelect}
            className={cn(
                "relative min-h-[100dvh] md:min-h-[110vh] flex items-center pt-40 sm:pt-48 pb-16 md:pb-20 px-4 sm:px-6 overflow-hidden perspective-1000 bg-background transition-colors duration-300",
                isAdminPreview && "cursor-pointer hover:ring-4 hover:ring-blue-500/50 hover:ring-inset transition-all z-50"
            )}
        >

            {/* Background Media */}
            {hero.bg_media && hero.bg_media.length > 0 ? (
                <div className="absolute inset-0 z-0">
                    <MediaSlider media={hero.bg_media} className="h-full w-full" objectFit="cover" overlay />
                </div>
            ) : (
                /* AMBIENT AURORA BACKGROUND (Deity Level) */
                performance?.parallax_enabled !== false && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                x: [0, 50, 0],
                                y: [0, -30, 0],
                                rotate: [0, 10, 0]
                            }}
                            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] bg-blue-600/20 dark:bg-blue-700/10 rounded-full blur-[140px] mix-blend-screen dark:mix-blend-lighten"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 1],
                                x: [0, -40, 0],
                                y: [0, 60, 0],
                                rotate: [0, -15, 0]
                            }}
                            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute top-[20%] -right-[5%] w-[60vw] h-[60vw] bg-purple-600/20 dark:bg-purple-700/10 rounded-full blur-[160px] mix-blend-screen dark:mix-blend-lighten"
                        />
                        <motion.div
                            animate={{
                                scale: [0.8, 1.2, 0.8],
                                x: [0, 30, 0],
                                y: [0, 40, 0]
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                            className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] bg-emerald-500/10 dark:bg-emerald-600/5 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-lighten"
                        />
                    </div>
                )
            )}

            <div className="max-w-7xl mx-auto px-0 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10 w-full">

                {/* HERO TEXT CONTENT (Left - 7 Cols) */}
                <motion.div
                    className="lg:col-span-7 order-2 lg:order-1 relative"
                >
                    {/* Floating "New Arrival" Pill */}
                    {hero.top_pill_visible !== false && (
                        <motion.div
                            initial={isAnimationEnabled ? { opacity: 0, y: 20, filter: "blur(10px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: isAnimationEnabled ? 0.5 : 0, duration: 0.8 }}
                            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm"
                        >
                            <Sparkles className="w-3 h-3 text-yellow-500 dark:text-yellow-300 animate-pulse" />
                            <span className="text-xs font-medium tracking-widest uppercase text-zinc-600 dark:text-white/80">{hero.top_pill_text || "Reimagining Nature"}</span>
                        </motion.div>
                    )}

                    <h1 className="font-medium leading-[1.1] mb-6 md:mb-8 font-display tracking-tighter text-balance text-zinc-900 dark:text-white" style={{ fontSize: 'var(--font-size-display)' }}>
                        <LiquidText text={title_part_1} delay={0.1} className="py-1 md:py-2" />
                        <div className="block">
                            <LiquidText text={title_part_2} className="text-gradient leading-[1.1] py-2 md:py-4" delay={0.4} />
                        </div>
                        <div className="flex gap-[0.2em] flex-wrap items-center py-1 md:py-2">
                            <span className="font-serif italic font-light text-zinc-500 dark:text-white/80" style={{ fontSize: 'var(--font-size-4xl)' }}>
                                <LiquidText text={title_part_3} delay={0.7} />
                            </span>
                            <LiquidText text={title_part_4} delay={0.9} />
                        </div>
                    </h1>

                    {hero.subtext_visible !== false && (
                        <motion.p
                            initial={isAnimationEnabled ? { opacity: 0, x: -10, filter: "blur(10px)" } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            transition={{ delay: isAnimationEnabled ? 1 : 0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed mb-8 md:mb-10 border-l-2 border-blue-500/30 dark:border-blue-400/20 pl-6"
                            style={{ fontSize: 'var(--font-size-lg)' }}
                        >
                            {subtext}
                        </motion.p>
                    )}

                    <motion.div
                        initial={isAnimationEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: isAnimationEnabled ? 1.2 : 0, duration: 0.8 }}
                        className="flex flex-wrap gap-4"
                    >
                        {hero.cta_primary_visible !== false && (
                            <Magnetic>
                                <a href={cta_primary_link} className="block group w-full sm:w-auto">
                                    <AlchemicalSurface type="blue-essence" className="rounded-full shadow-xl shadow-blue-500/20 dark:shadow-white/10">
                                        <div className="px-6 md:px-8 py-3.5 md:py-4 font-bold text-sm tracking-wide flex items-center justify-center sm:justify-start gap-2 transition-all active:scale-95">
                                            {cta_primary_text}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </AlchemicalSurface>
                                </a>
                            </Magnetic>
                        )}
                        {hero.cta_secondary_visible !== false && (
                            <Magnetic>
                                <a href={cta_secondary_link} className="px-6 md:px-8 py-3.5 md:py-4 glass dark:glass rounded-full font-bold text-sm tracking-wide hover:bg-zinc-100 dark:hover:bg-white/10 transition-all border border-zinc-200 dark:border-white/20 text-zinc-900 dark:text-white w-full sm:w-auto text-center">
                                    {cta_secondary_text}
                                </a>
                            </Magnetic>
                        )}
                    </motion.div>
                </motion.div>

                {/* HERO VISUAL (Right - 5 Cols) */}
                <motion.div
                    className="lg:col-span-5 order-1 lg:order-2 relative"
                >
                    <ViewportAwareTilt media={media} hero={hero} />
                </motion.div>
            </div>
        </section>
    );
}

function ViewportAwareTilt({ media, hero }: { media: any[], hero: any }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { margin: "0px 0px -20% 0px" });
    const gsapRef = useRef<any>(null);

    const { performance, theme } = useEnvironment();
    const isAnimationEnabled = !performance.eco_mode && theme.animationIntensity > 0;

    useEffect(() => {
        if (isInView && !gsapRef.current && performance?.tilt_enabled !== false) {
            import("gsap").then((gsap) => {
                gsapRef.current = gsap.default;
            });
        }
    }, [isInView, performance?.tilt_enabled]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isInView || !gsapRef.current || performance?.tilt_enabled === false) return;

        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        gsapRef.current.to(".hero-image", {
            rotateY: x * 20,
            rotateX: -y * 20,
            duration: 1,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = () => {
        if (!gsapRef.current) return;

        gsapRef.current.to(".hero-image", {
            rotateY: 0,
            rotateX: 0,
            duration: 1,
            ease: "elastic.out(1, 0.3)"
        });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="hero-image relative w-full z-10 transition-transform preserve-3d cursor-pointer group"
        >
            {/* Dark Mode Aura Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 dark:bg-blue-600/20 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative w-full rounded-[2rem] overflow-hidden">
                <MediaSlider media={media} objectFit="contain" />
            </div>

            {/* Floating Glass Elements (3D Feel - Parallaxed) */}
            {hero.purity_visible !== false && (
                <motion.div
                    className="absolute top-[10%] -right-2 lg:-right-12 z-20 translate-z-20 scale-75 md:scale-100"
                    animate={isAnimationEnabled ? { y: [0, -15, 0] } : { y: 0 }}
                    transition={isAnimationEnabled ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
                >
                    <GlassCard className="p-3 md:p-4 backdrop-blur-xl border-zinc-200 dark:border-white/10 shadow-xl bg-white/80 dark:bg-white/5">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div className="flex flex-col gap-0 md:gap-1">
                                <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{hero.purity_label || "Purity"}</p>
                                <p className="text-sm md:text-lg font-bold text-zinc-900 dark:text-white">{hero.purity_value || "100% Organic"}</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {hero.result_visible !== false && (
                <motion.div
                    className="absolute bottom-[20%] -left-2 lg:-left-12 z-20 translate-z-10 scale-75 md:scale-100"
                    animate={isAnimationEnabled ? { y: [0, 20, 0] } : { y: 0 }}
                    transition={isAnimationEnabled ? { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } : {}}
                >
                    <GlassCard className="p-3 md:p-4 backdrop-blur-xl border-zinc-200 dark:border-white/10 shadow-xl bg-white/80 dark:bg-white/5">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex flex-col gap-0 md:gap-1">
                                <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{hero.result_label || "Result"}</p>
                                <p className="text-sm md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">{hero.result_value || "Clinically Proven"}</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-ping" />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}
        </div>
    );
}
