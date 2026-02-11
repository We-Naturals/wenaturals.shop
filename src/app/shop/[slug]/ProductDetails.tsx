"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { ArrowLeft, ShoppingCart, Star, PlayCircle, ExternalLink, Share2, Package } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { AmazonLogo, FlipkartLogo, MeeshoLogo } from "@/components/icons/MarketplaceIcons";
import { cn } from "@/lib/utils";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|quicktime)$/i) || (url.includes("cloudinary.com") && url.includes("/video/"));
};

// Video-aware Media Viewer
const MediaViewer = ({ src, alt, className, onVideoEnd, onClick, isFullscreen = false }: {
    src: string,
    alt: string,
    className?: string,
    onVideoEnd?: () => void,
    onClick?: () => void,
    isFullscreen?: boolean
}) => {
    if (isVideo(src)) {
        return (
            <video
                src={src}
                controls={isFullscreen}
                className={cn(className, onClick && "cursor-pointer")}
                playsInline
                loop={false}
                muted={!isFullscreen}
                autoPlay
                onEnded={onVideoEnd}
                onClick={onClick}
            />
        );
    }
    return (
        <div className={cn("relative w-full h-full", onClick && "cursor-pointer")} onClick={onClick}>
            <Image
                src={src}
                alt={alt}
                fill
                className={cn(className, "object-contain")}
                priority
            />
            {!isFullscreen && (
                <div className="absolute top-4 right-4 p-2 rounded-full glass bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
};

const MediaThumb = ({ src, alt, isActive, onClick }: { src: string, alt: string, isActive: boolean, onClick: () => void }) => {
    const isVid = isVideo(src);
    return (
        <button
            onClick={onClick}
            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 group ${isActive ? "border-blue-400 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
        >
            {isVid ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
                    <video src={src} className="absolute inset-0 w-full h-full object-cover opacity-50" muted />
                </div>
            ) : (
                <Image src={src} alt={alt} fill className="object-cover" />
            )}
        </button>
    );
}

export default function ProductDetails({
    product,
    relatedBlogs,
    recommendedProducts = []
}: {
    product: any,
    relatedBlogs: any[],
    recommendedProducts?: any[]
}) {
    const router = useRouter();
    const { addItem, toggleCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);

    // Set default variant
    useEffect(() => {
        if (product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product.variants]);

    // Intelligent Auto-swipe logic
    useEffect(() => {
        if (!product.media || product.media.length <= 1) return;

        // If current media is a video, don't set a timer. 
        // We'll use the onVideoEnd callback to progress.
        if (isVideo(product.media[selectedImage])) return;

        const interval = setInterval(() => {
            setSelectedImage((prev) => (prev + 1) % product.media.length);
        }, 8000); // 8 seconds for static images

        return () => clearInterval(interval);
    }, [product.media?.length, selectedImage]);

    const handleVideoEnd = () => {
        if (product.media.length > 1) {
            setSelectedImage((prev) => (prev + 1) % product.media.length);
        }
    };

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out ${product.name} on We Naturals`,
                    text: `I found this amazing ${product.name} on We Naturals!`,
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

    if (!product) return null;

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Shop
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Media Gallery (Left Column) */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-square relative rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-white/10 glass dark:bg-white/5 group"
                        >
                            <MediaViewer
                                src={product.media[selectedImage] || "/placeholder.jpg"}
                                alt={product.name}
                                className="object-cover w-full h-full"
                                onVideoEnd={handleVideoEnd}
                                onClick={() => setIsFullscreen(true)}
                            />
                        </motion.div>

                        {product.media.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {product.media.map((img: string, idx: number) => (
                                    <MediaThumb
                                        key={idx}
                                        src={img}
                                        alt={`${product.name} ${idx + 1}`}
                                        isActive={selectedImage === idx}
                                        onClick={() => setSelectedImage(idx)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Moved: Select Size / Add to Cart below images & links */}
                        <div className="pt-8 border-t border-zinc-200 dark:border-white/10 space-y-6">
                            {product.variants && product.variants.length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold block">Select Size</label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((variant: any, idx: number) => {
                                            const isSelected = selectedVariant && selectedVariant.weight === variant.weight && selectedVariant.unit === variant.unit;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedVariant(variant)}
                                                    className={cn(
                                                        "px-4 py-3 rounded-xl text-sm font-bold border transition-all",
                                                        isSelected
                                                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-lg"
                                                            : "bg-white dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10"
                                                    )}
                                                >
                                                    {variant.weight}{variant.unit}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    const cartItem = selectedVariant ? {
                                        id: `${product.id}-${selectedVariant.weight}${selectedVariant.unit}`,
                                        name: `${product.name} - ${selectedVariant.weight}${selectedVariant.unit}`,
                                        price: parseFloat(selectedVariant.price),
                                        image: product.media?.[0] || "/placeholder.jpg",
                                        quantity: 1
                                    } : {
                                        id: product.id,
                                        name: product.name,
                                        price: parseFloat(product.price),
                                        image: product.media?.[0] || "/placeholder.jpg",
                                        quantity: 1
                                    };
                                    addItem(cartItem);
                                    toggleCart();
                                }}
                                className="w-full py-4 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                        </div>

                        {/* Marketplace Links */}
                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <span className="w-8 h-px bg-zinc-300 dark:bg-zinc-800" />
                                Available On
                                <span className="flex-1 h-px bg-zinc-300 dark:bg-zinc-800" />
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {product.marketplace?.amazon && (
                                    <a
                                        href={product.marketplace.amazon}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 glass rounded-xl group hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all border-black/5 dark:border-white/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-yellow-500/10 transition-colors">
                                                <AmazonLogo className="w-6 h-6 text-zinc-600 dark:text-zinc-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">Amazon</span>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400">Official Store</span>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    </a>
                                )}
                                {product.marketplace?.flipkart && (
                                    <a
                                        href={product.marketplace.flipkart}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 glass rounded-xl group hover:border-blue-500/30 hover:bg-blue-500/5 transition-all border-black/5 dark:border-white/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                                                <FlipkartLogo className="w-6 h-6 text-zinc-600 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">Flipkart</span>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400">Official Store</span>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    </a>
                                )}
                                {product.marketplace?.meesho && (
                                    <a
                                        href={product.marketplace.meesho}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 glass rounded-xl group hover:border-pink-500/30 hover:bg-pink-500/5 transition-all border-black/5 dark:border-white/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                                                <MeeshoLogo className="w-6 h-6 text-zinc-600 dark:text-zinc-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">Meesho</span>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400">Official Store</span>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Info (Right Column) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <span className="px-3 py-1 rounded-full glass border-black/5 dark:border-white/10 text-[10px] uppercase tracking-widest font-bold text-zinc-600 dark:text-zinc-400">
                                    {product.category}
                                </span>
                                {product.rarity_level && product.rarity_level !== "Common" && (
                                    <span className={cn(
                                        "px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest font-black",
                                        product.rarity_level === "Rare" && "border-blue-500/50 text-blue-400 bg-blue-500/10",
                                        product.rarity_level === "Epic" && "border-purple-500/50 text-purple-400 bg-purple-500/10",
                                        product.rarity_level === "Legendary" && "border-amber-500/50 text-amber-400 bg-amber-500/10",
                                        product.rarity_level === "Transcendent" && "border-cyan-400 text-cyan-400 bg-cyan-400/20 animate-pulse"
                                    )}>
                                        {product.rarity_level}
                                    </span>
                                )}
                                {product.status === "Low Stock" && (
                                    <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                                        Low Stock
                                    </span>
                                )}
                            </div>

                            <h1 className="text-[clamp(2rem,8vw,3.5rem)] font-bold mb-4 text-zinc-900 dark:text-white leading-[1.1]">{product.name}</h1>

                            <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 text-sm">
                                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-zinc-500 ml-1">(5.0)</span>
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="ml-2 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors group"
                                    title="Share this product"
                                >
                                    <Share2 className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                                {product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : product.currency === 'INR' ? '₹' : product.currency === 'JPY' ? '¥' : ''}{currentPrice}
                            </div>
                            {product.batch_info && (
                                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">
                                    Batch Ref: <span className="text-zinc-600 dark:text-zinc-400">{product.batch_info}</span>
                                </div>
                            )}
                        </div>

                        <div
                            className="prose prose-sm md:prose-lg prose-zinc dark:prose-invert text-zinc-600 dark:text-zinc-400 leading-relaxed
                                [&_iframe]:rounded-2xl [&_iframe]:border [&_iframe]:border-black/5 dark:[&_iframe]:border-white/10 [&_iframe]:shadow-xl [&_iframe]:w-full [&_iframe]:aspect-video"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />

                        {product.is_bundle && product.bundle_items && product.bundle_items.length > 0 && (
                            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Included in this Ritual</h3>
                                </div>
                                <div className="space-y-3">
                                    {product.bundle_items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-xs border-b border-black/5 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider">{item.name}</span>
                                            <span className="text-zinc-500 font-mono">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold pt-2">
                                    Total Value: ${product.bundle_items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Related Story Section */}
                {relatedBlogs && relatedBlogs.length > 0 && (
                    <div className="mt-20 md:mt-32 border-t border-zinc-200 dark:border-white/10 pt-16 md:pt-24">
                        <h2 className="text-[clamp(1.75rem,6vw,2.5rem)] font-bold mb-10 md:mb-12 text-zinc-900 dark:text-white">The Story Behind</h2>

                        <div className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                            {relatedBlogs.map((relatedBlog: any) => (
                                <div
                                    key={relatedBlog.id}
                                    onClick={() => router.push(`/blog/${relatedBlog.slug}`)}
                                    className="min-w-[85vw] md:min-w-[600px] snap-center group cursor-pointer relative aspect-[16/9] rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-white/10 flex-shrink-0 bg-black"
                                >
                                    <Image
                                        src={relatedBlog.coverImage || "/placeholder.jpg"}
                                        alt={relatedBlog.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                    <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="px-3 py-1 rounded-full glass border-white/10 text-[10px] uppercase tracking-widest font-bold text-white">
                                                Editorial
                                            </span>
                                            <span className="text-xs font-bold text-zinc-400">
                                                {relatedBlog.readTime || "5 min"} Read
                                            </span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">
                                            {relatedBlog.title}
                                        </h3>
                                        <p className="text-zinc-400 line-clamp-2 text-sm md:text-base">
                                            {relatedBlog.excerpt}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Products Section */}
                {recommendedProducts && recommendedProducts.length > 0 && (
                    <div className="mt-20 md:mt-32 border-t border-zinc-200 dark:border-white/10 pt-16 md:pt-24">
                        <div className="flex items-end justify-between mb-10 md:mb-12">
                            <div>
                                <h2 className="text-[clamp(1.75rem,6vw,2.5rem)] font-bold text-zinc-900 dark:text-white">You May Also Like</h2>
                                <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest font-bold">Curated selections just for you</p>
                            </div>
                            <button
                                onClick={() => router.push('/shop')}
                                className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:opacity-70 transition-opacity"
                            >
                                View All
                            </button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {recommendedProducts.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    onClick={() => router.push(`/shop/${p.slug}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[4/5] relative rounded-3xl overflow-hidden mb-4 border border-zinc-200 dark:border-white/5 glass">
                                        <Image
                                            src={p.media?.[0] || p.image || "/placeholder.jpg"}
                                            alt={p.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full glass bg-white/20 text-[8px] font-black uppercase tracking-widest text-white shadow-xl">
                                            {p.category}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm line-clamp-1">{p.name}</h3>
                                    <p className="text-blue-600 dark:text-blue-400 font-mono text-xs mt-1">
                                        {p.currency === 'USD' ? '$' : p.currency === 'INR' ? '₹' : ''}{p.price}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen Media Viewer Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                    <button
                        onClick={() => {
                            setIsFullscreen(false);
                            setZoomScale(1);
                        }}
                        className="absolute top-8 right-8 p-3 rounded-full glass border-white/10 text-white hover:bg-white/20 transition-all z-[110]"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 glass p-4 rounded-2xl border-white/10 z-[110]">
                        <button onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.5))} className="p-2 text-white hover:text-blue-400 transition-colors"><ZoomOut className="w-5 h-5" /></button>
                        <span className="text-white font-mono text-sm w-12 text-center">{Math.round(zoomScale * 100)}%</span>
                        <button onClick={() => setZoomScale(Math.min(3, zoomScale + 0.5))} className="p-2 text-white hover:text-blue-400 transition-colors"><ZoomIn className="w-5 h-5" /></button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full h-full flex items-center justify-center overflow-hidden"
                    >
                        <motion.div
                            style={{ scale: zoomScale }}
                            className="w-full h-full flex items-center justify-center"
                            drag={zoomScale > 1}
                            dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                        >
                            <MediaViewer
                                src={product.media[selectedImage] || "/placeholder.jpg"}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                                isFullscreen={true}
                            />
                        </motion.div>
                    </motion.div>

                    {product.media.length > 1 && (
                        <div className="absolute bottom-32 left-0 w-full flex justify-center gap-4 px-4 overflow-x-auto scrollbar-hide">
                            {product.media.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedImage(idx);
                                        setZoomScale(1);
                                    }}
                                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === idx ? "border-blue-500 scale-110" : "border-white/20 opacity-50 hover:opacity-100"}`}
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
                </div>
            )}

            <Footer />
            <CartSidebar />
        </main>
    );
}
