"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Leaf, Droplets, ShoppingCart, Star, PlayCircle, ExternalLink, Share2, Package, ArrowRight, Eye, Plus } from "lucide-react";
import Image from "next/image";
import { Magnetic } from "@/components/ui/Magnetic";
import { useSensory } from "@/components/providers/SensoryProvider";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface ExplodedViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        image: string;
        description: string;
        price: string | number;
        variants?: any[];
        media?: string[];
        marketplace?: any;
        currency?: string;
        category?: string;
        slug?: string;
    };
}

// Reuse isVideo helper
const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|quicktime)$/i) || (url.includes("cloudinary.com") && url.includes("/video/"));
};

export function ExplodedViewModal({ isOpen, onClose, product }: ExplodedViewModalProps) {
    const { addItem, toggleCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product.variants]);

    if (!mounted) return null;

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const mediaList = product.media && product.media.length > 0 ? product.media : [product.image];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 lg:p-12">
                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Decorative Exploded Fragments */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[
                            { x: -15, y: -20, rotate: 12, size: 300, color: "from-blue-500/10" },
                            { x: 20, y: -15, rotate: -8, size: 250, color: "from-purple-500/10" },
                            { x: -10, y: 25, rotate: 45, size: 200, color: "from-emerald-500/10" }
                        ].map((orb, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1, x: `${orb.x}vw`, y: `${orb.y}vh`, rotate: orb.rotate }}
                                transition={{ delay: 0.2 + i * 0.1, duration: 1, ease: "easeOut" }}
                                className={`absolute w-${orb.size} h-${orb.size} rounded-full bg-gradient-to-tr ${orb.color} to-transparent blur-3xl`}
                                style={{ width: orb.size, height: orb.size }}
                            />
                        ))}
                    </div>

                    {/* Main Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-6xl h-full max-h-[90vh] glass rounded-[2rem] lg:rounded-[3rem] border border-white/10 overflow-hidden flex flex-col md:row shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-zinc-900/50"
                    >
                        {/* Split Layout for Desktop */}
                        <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">

                            {/* Media Section */}
                            <div className="w-full md:w-[55%] h-1/2 md:h-full relative bg-black/20 flex flex-col border-b md:border-b-0 md:border-r border-white/5">
                                <div className="relative flex-1 group overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedImage}
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute inset-0"
                                        >
                                            {isVideo(mediaList[selectedImage]) ? (
                                                <video
                                                    src={mediaList[selectedImage]}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Image
                                                    src={mediaList[selectedImage]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                    priority
                                                />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Mini Thumbnails Overlay (Desktop Bottom / Mobile Right) */}
                                    {mediaList.length > 1 && (
                                        <div className="absolute bottom-6 left-6 right-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide z-10 p-2 glass mx-4 rounded-2xl border-white/5">
                                            {mediaList.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedImage(idx)}
                                                    className={cn(
                                                        "relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                                                        selectedImage === idx ? "border-blue-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-white/10 opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    {isVideo(img) ? (
                                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><PlayCircle className="w-6 h-6 text-white/50" /></div>
                                                    ) : (
                                                        <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Category Tag */}
                                    <div className="absolute top-6 left-6">
                                        <span className="px-3 py-1 rounded-full glass border-white/10 text-[10px] uppercase tracking-widest font-black text-white/60 bg-black/20">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="w-full md:w-[45%] h-1/2 md:h-full flex flex-col p-6 lg:p-12 overflow-y-auto scrollbar-hide bg-zinc-900/40 backdrop-blur-md">
                                <div className="flex-1 space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">{product.name}</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-1 text-amber-500/80">
                                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                                            </div>
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] pt-0.5">Veda Verified</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-blue-400 font-mono tracking-tighter">
                                                {product.currency === 'INR' ? '₹' : product.currency === 'USD' ? '$' : ''}{currentPrice}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Inclusive of all alchemical taxes</span>
                                        </div>

                                        <div className="prose prose-invert prose-sm">
                                            <div
                                                className="text-zinc-400 text-sm leading-relaxed max-h-40 overflow-y-auto scrollbar-hide pr-4"
                                                dangerouslySetInnerHTML={{ __html: product.description }}
                                            />
                                        </div>
                                    </div>

                                    {/* Variants Selector */}
                                    {product.variants && product.variants.length > 0 && (
                                        <div className="space-y-4 pt-4">
                                            <label className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-black block">Select Potency / Size</label>
                                            <div className="flex flex-wrap gap-2">
                                                {product.variants.map((v, idx) => {
                                                    const isSelected = selectedVariant?.weight === v.weight && selectedVariant?.unit === v.unit;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSelectedVariant(v)}
                                                            className={cn(
                                                                "px-4 py-2.5 rounded-xl text-[10px] font-bold border transition-all duration-300",
                                                                isSelected
                                                                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                                                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                                                            )}
                                                        >
                                                            {v.weight}{v.unit}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-8 space-y-4 pt-8 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            const cartItem = selectedVariant ? {
                                                id: `${product.id}-${selectedVariant.weight}${selectedVariant.unit}`,
                                                name: `${product.name} - ${selectedVariant.weight}${selectedVariant.unit}`,
                                                price: parseFloat(selectedVariant.price),
                                                image: mediaList?.[0] || product.image || "/placeholder.jpg",
                                                quantity: 1
                                            } : {
                                                id: product.id,
                                                name: product.name,
                                                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                                                image: mediaList?.[0] || product.image || "/placeholder.jpg",
                                                quantity: 1
                                            };
                                            addItem(cartItem);
                                            toggleCart();
                                            onClose();
                                        }}
                                        className="w-full py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-blue-400 transition-all duration-500 flex items-center justify-center gap-2 group"
                                    >
                                        <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Synthesize into Cart
                                    </button>

                                    <a
                                        href={`/shop/${product.slug}`}
                                        className="w-full py-4 glass border-white/10 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Full Alchemical Profile
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full glass border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-50 bg-black/20"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
