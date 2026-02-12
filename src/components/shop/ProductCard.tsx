"use client";

import Image from "next/image";
import { ShoppingCart, Plus, X, Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useCart } from "@/hooks/useCart";
import { Magnetic } from "@/components/ui/Magnetic";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useSensory } from "@/components/providers/SensoryProvider";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";
import { ExplodedViewModal } from "./ExplodedViewModal";
import Link from "next/link";
import { PrefetchLink } from "@/components/ui/PrefetchLink";
import { AlchemicalSurface } from "@/components/ui/AlchemicalSurface";

interface ProductCardProps {
    id: string;
    name: string;
    price: string | number;
    category: string;
    image: string;
    description?: string;
    slug?: string;
    priority?: boolean;
    isPeerHovered?: boolean;
    onHoverChange?: (isHovered: boolean) => void;
    alchemyConfig?: {
        material?: string;
        glow?: boolean;
        intensity?: number;
    };
    variants?: any[];
    media?: string[];
    marketplace?: any;
    currency?: string;
}

// 1. Move static helper outside component to prevent re-renders (Hardening Phase)
const ContentWrapperHelper = ({ alchemyConfig, children }: { alchemyConfig?: any, children: React.ReactNode }) => {
    if (alchemyConfig?.material && alchemyConfig.material !== 'none') {
        return (
            <AlchemicalSurface type={alchemyConfig.material as any} className="h-full rounded-[2rem] p-1">
                {children}
            </AlchemicalSurface>
        );
    }
    return <>{children}</>;
};

export function ProductCard({
    id, name, price, category, image, description, slug, priority = false,
    isPeerHovered = false, onHoverChange, alchemyConfig,
    variants = [], media = [], marketplace = {}, currency = 'USD'
}: ProductCardProps) {
    const { addItem, toggleCart, triggerFly } = useCart();
    const { playChime } = useSensory();
    const { performance, theme } = useEnvironment();
    const isAnimationEnabled = !performance.eco_mode && theme.animationIntensity > 0;

    const [isExplodedOpen, setIsExplodedOpen] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isSelfHovered, setIsSelfHovered] = useState(false);

    // Fallback slug generation if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const [showDetails, setShowDetails] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !performance.tilt_enabled || performance.eco_mode) return;
        const rect = cardRef.current.getBoundingClientRect();

        // Tilt Safety: Avoid division by zero or NaN (Hardening Phase)
        if (rect.width === 0 || rect.height === 0) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        // Holographic Tilt Logic (Phase 6.2)
        const tiltIntensity = 15 * theme.animationIntensity;
        const tiltX = (x / rect.width - 0.5) * tiltIntensity;
        const tiltY = (y / rect.height - 0.5) * -tiltIntensity;

        // Final Safety Check
        if (isNaN(tiltX) || isNaN(tiltY)) return;

        setTilt({ x: tiltX, y: tiltY });
    };

    const handleAddToCart = (e?: React.MouseEvent) => {
        if (e && isAnimationEnabled) {
            triggerFly(e.clientX, e.clientY, image);
        }
        addItem({ id, name, price, image });
    };

    const handleMouseEnter = () => {
        // playChime(0.6); // Removed per user request
        setIsSelfHovered(true);
        onHoverChange?.(true);
    };

    const handleMouseLeave = () => {
        setIsSelfHovered(false);
        onHoverChange?.(false);
        setTilt({ x: 0, y: 0 }); // Reset tilt on leave
    };

    const toggleExploded = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExplodedOpen(!isExplodedOpen);
    };

    return (
        <ContentWrapperHelper alchemyConfig={alchemyConfig}>
            <PrefetchLink href={`/shop/${productSlug}`} slug={productSlug} className="block group cursor-pointer">
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    initial={isAnimationEnabled ? { opacity: 0, y: 40, filter: "blur(10px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1.2 / Math.max(0.1, theme.animationIntensity), ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    {/* Bio-Luminescent "Essence" Layer (Batch 9.1 & 10.2) */}
                    {isAnimationEnabled && (
                        <motion.div
                            className="absolute -inset-8 pointer-events-none z-0 rounded-[2rem]"
                            animate={{
                                opacity: isSelfHovered
                                    ? (0.4 * (alchemyConfig?.intensity ?? 1))
                                    : (alchemyConfig?.glow || isPeerHovered ? [0.05 * (alchemyConfig?.intensity ?? 1), 0.15 * (alchemyConfig?.intensity ?? 1), 0.05 * (alchemyConfig?.intensity ?? 1)] : 0),
                                scale: isSelfHovered ? 1.1 : (isPeerHovered || alchemyConfig?.glow ? [1, 1.05, 1] : 1),
                                filter: isSelfHovered ? 'blur(40px)' : 'blur(60px)',
                            }}
                            transition={{
                                opacity: (isPeerHovered || alchemyConfig?.glow) ? { duration: 4 / (alchemyConfig?.intensity ?? 1), repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 },
                                scale: (isPeerHovered || alchemyConfig?.glow) ? { duration: 4 / (alchemyConfig?.intensity ?? 1), repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 },
                            }}
                            style={{
                                background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.2) 30%, transparent 70%)',
                                mixBlendMode: 'screen'
                            }}
                        />
                    )}

                    <SpotlightCard
                        disableTilt
                        className={cn(
                            "relative overflow-hidden",
                            isSelfHovered ? "shadow-[0_20px_50px_rgba(59,130,246,0.2)]" : (isPeerHovered ? "shadow-[0_10px_30px_rgba(59,130,246,0.1)]" : "")
                        )}>
                        <motion.div
                            className="relative overflow-hidden rounded-xl mb-4 bg-zinc-100 dark:bg-white/5 aspect-[3/4]"
                            style={{ perspective: 1000 }}
                            animate={{ rotateX: tilt.y, rotateY: tilt.x }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            onMouseEnter={() => setShowDetails(true)}
                            onMouseLeave={() => setShowDetails(false)}
                        >
                            <div ref={imageRef} className="absolute inset-0 overflow-hidden">
                                <div className="w-full h-full relative">
                                    {typeof image === 'string' && image.endsWith('.mp4') ? (
                                        <video
                                            src={image}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Image
                                            src={typeof image === 'string' ? image : "/placeholder.jpg"}
                                            alt={name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={priority}
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    )}

                                    {/* Sub-surface Scattering Bloom (Batch 9.1) */}
                                    <motion.div
                                        className="absolute inset-0 z-10 pointer-events-none mix-blend-color-dodge opacity-0"
                                        animate={{
                                            opacity: isSelfHovered ? 0.3 : (isPeerHovered ? 0.1 : 0),
                                            filter: isSelfHovered ? 'blur(10px) brightness(1.2)' : 'blur(20px) brightness(1)'
                                        }}
                                        style={{
                                            background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, transparent 80%)'
                                        }}
                                    />
                                </div>

                                {/* Refractive Light Leak Hover */}
                                <motion.div
                                    className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.15) 0%, transparent 40%)`,
                                        mixBlendMode: "overlay"
                                    }}
                                />

                                {/* Organic Prismatic Shimmer */}
                                <motion.div
                                    className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                                    style={{
                                        background: `linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.2) 20%, rgba(139, 92, 246, 0.2) 40%, transparent 60%)`,
                                        backgroundSize: "200% 200%",
                                        x: mousePos.x * 0.1,
                                        y: mousePos.y * 0.1,
                                        mixBlendMode: "color-dodge"
                                    }}
                                />

                                {/* Glass Shine Sweep */}
                                <motion.div
                                    className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100"
                                    initial={{ x: '-100%', skewX: -20 }}
                                    whileHover={{ x: '200%', skewX: -20 }}
                                    transition={{ duration: 1.2, ease: "easeInOut" }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
                                </motion.div>
                            </div>
                            {/* overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                <Magnetic>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
                                        className="w-full py-3 bg-white text-black dark:bg-zinc-900 dark:text-white rounded-lg font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 active:scale-95 shadow-xl"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                </Magnetic>
                            </div>
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <Magnetic>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
                                        className="p-2 glass dark:glass rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all active:scale-90 border border-white/10"
                                        aria-label="Quick Add"
                                    >
                                        <Plus className="w-4 h-4 text-zinc-900 dark:text-white" />
                                    </button>
                                </Magnetic>
                                <Magnetic>
                                    <button
                                        onClick={toggleExploded}
                                        className="p-2 glass dark:glass rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all active:scale-90 border border-white/10"
                                        aria-label="Quick View"
                                    >
                                        <Eye className="w-4 h-4 text-zinc-900 dark:text-white" />
                                    </button>
                                </Magnetic>
                            </div>
                        </motion.div>

                        <div className="space-y-2 p-4">
                            <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wider uppercase">
                                {category}
                            </span>
                            <div className="flex justify-between items-center text-zinc-900 dark:text-white mt-1">
                                <div>
                                    <h3 className="text-lg font-bold leading-tight">{name}</h3>
                                    <span className="text-md font-medium opacity-80">
                                        {/* Currency Fix: Ensure INR is displayed */}
                                        {typeof price === 'number' || !isNaN(Number(price))
                                            ? `₹${price}`
                                            : price.toString().replace('$', '₹')}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddToCart(e);
                                    }}
                                    className="p-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-110 active:scale-95 transition-all shadow-lg flex items-center justify-center z-20 relative"
                                    aria-label="Add to cart"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </SpotlightCard>
                </motion.div>
            </PrefetchLink >

            <ExplodedViewModal
                isOpen={isExplodedOpen}
                onClose={() => setIsExplodedOpen(false)}
                product={{
                    id,
                    name,
                    image,
                    description: description || "",
                    price,
                    variants,
                    media: media.length > 0 ? media : [image],
                    marketplace,
                    currency,
                    category,
                    slug: productSlug
                }}
            />
        </ContentWrapperHelper >
    );
}
