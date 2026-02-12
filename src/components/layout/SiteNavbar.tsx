"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Search, Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { Magnetic } from "@/components/ui/Magnetic";
import { createClient } from "@/lib/supabase";
import { useContent } from "@/hooks/useContent";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSensory } from "@/components/providers/SensoryProvider";
import { GlobalSearch } from "./GlobalSearch";

const DEFAULT_CATEGORIES: string[] = [];

export function SiteNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const { items, toggleCart } = useCart();
    const { playLiquid, initialize, isPlaying } = useSensory();

    const globalContent = useContent('content_global');
    const navContent = useContent('content_navigation');

    // Robust multi-layer fallback
    // 1. Try Navigation Engine (Header)
    // 2. Fallback to Legacy Navbar Links
    // 3. Absolute system defaults as a fail-safe
    const links = (navContent?.header && navContent.header.length > 0)
        ? navContent.header
        : (globalContent?.navbar?.links?.length > 0)
            ? globalContent.navbar.links.filter((link: any) => link.visible !== false)
            : [
                { label: "Shop", href: "/shop" },
                { label: "About", href: "/#about" },
                { label: "Journal", href: "/blog" }
            ];

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

        const fetchData = async () => {
            const supabase = createClient();

            // Parallel fetching
            const [catRes, prodRes] = await Promise.all([
                supabase.from('categories').select('name').order('name'),
                supabase.from('products')
                    .select('id, name, slug, category, media, price, variants, currency')
                    .eq('status', 'Active')
                    .order('created_at', { ascending: false })
            ]);

            if (catRes.data) {
                setCategories(catRes.data.map((c: any) => c.name));
            }
            if (prodRes.data) {
                setProducts(prodRes.data);
            }
            setIsHydrated(true);
        };
        fetchData();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close search on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Prevent scroll when search/menu is open
    useEffect(() => {
        if (isSearchOpen || isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSearchOpen, isMobileMenuOpen]);

    // Filter products for mega menu
    const displayProducts = activeCategory
        ? products.filter(p => p.category === activeCategory).slice(0, 4)
        : products.slice(0, 4);

    const marketingContent = useContent('content_marketing');
    const showAnnouncement = marketingContent?.announcement_bar?.enabled && marketingContent?.announcement_bar?.text;

    return (
        <>
            <nav
                className={cn(
                    "fixed left-0 right-0 z-50 transition-all duration-700",
                    isScrolled ? "py-2 px-6 md:px-12 backdrop-blur-xl" : "py-4 px-6",
                    showAnnouncement ? "top-8 md:top-9" : "top-0"
                )}
                onMouseLeave={() => {
                    setHoveredLink(null);
                    setActiveCategory(null);
                }}
            >
                <div className={cn(
                    "max-w-7xl mx-auto flex items-center justify-between transition-all duration-700 relative z-50",
                    "glass px-4 md:px-8 py-3 md:py-4",
                    isScrolled ? "rounded-2xl shadow-premium border-white/10 dark:border-white/10" : "rounded-none border-transparent bg-transparent"
                )}>
                    <div className="flex items-center gap-2 cursor-pointer relative z-50">
                        <Link href="/">
                            <div className="relative w-24 md:w-32 h-8 md:h-10 transition-all duration-300">
                                <Image
                                    src={globalContent?.navbar?.logo_url || "/we_naturals_logo.png"}
                                    alt="We Naturals"
                                    fill
                                    className="object-contain dark:invert-0 invert"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium relative z-50">
                        {links.map((link: any) => {
                            const isMegaMenuTrigger = link.label === "Shop" || link.label === "Categories";

                            return (
                                <div
                                    key={link.label}
                                    className="relative group py-4"
                                    onMouseEnter={() => {
                                        if (isMegaMenuTrigger) {
                                            setHoveredLink(link.label);
                                        } else {
                                            setHoveredLink(null);
                                        }
                                    }}
                                >
                                    <Magnetic>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "hover:text-blue-500 transition-colors uppercase tracking-widest text-[10px] font-bold flex items-center gap-1",
                                                hoveredLink && isMegaMenuTrigger ? "text-blue-500" : "text-zinc-600 dark:text-zinc-300"
                                            )}
                                        >
                                            {link.label}
                                            {isMegaMenuTrigger && (
                                                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", hoveredLink === link.label && "rotate-180")} />
                                            )}
                                        </Link>
                                    </Magnetic>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 relative z-50">

                        <ThemeToggle />
                        <button
                            onClick={async () => {
                                const supabase = createClient();
                                const { data: { session } } = await supabase.auth.getSession();
                                if (session) {
                                    window.location.href = "/account";
                                } else {
                                    await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo: `${window.location.origin}/auth/callback`
                                        }
                                    });
                                }
                            }}
                            className="text-zinc-600 dark:text-zinc-300 hover:text-blue-500 transition-colors"
                            aria-label="Account"
                        >
                            <User className="w-5 h-5" />
                        </button>
                        <button
                            className="text-zinc-600 dark:text-zinc-300 hover:text-blue-500 transition-colors"
                            onClick={() => setIsSearchOpen(true)}
                            aria-label="Open Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <div
                            className="relative cursor-pointer group p-1 cart-icon-target"
                            onClick={() => {
                                toggleCart();
                                // playLiquid(); // Removed per user request
                            }}
                            role="button"
                            aria-label="Open Cart"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && toggleCart()}
                        >
                            <ShoppingCart className="w-5 h-5 text-zinc-600 dark:text-zinc-300 group-hover:text-blue-500 transition-colors" />
                            {isHydrated && itemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-lg"
                                >
                                    {itemCount}
                                </motion.span>
                            )}
                        </div>
                        <button
                            className="p-2 md:hidden hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-600 dark:text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Mega Menu Overlay */}
                <AnimatePresence>
                    {(hoveredLink === "Shop" || hoveredLink === "Categories") && (
                        <motion.div
                            initial={{ opacity: 0, clipPath: 'circle(0% at 50% 0%)' }}
                            animate={{ opacity: 1, clipPath: 'circle(150% at 50% 0%)' }}
                            exit={{ opacity: 0, clipPath: 'circle(0% at 50% 0%)' }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute top-full left-0 right-0 pt-4 px-6 md:px-12 pointer-events-none"
                            style={{ pointerEvents: 'auto' }}
                            onMouseLeave={() => {
                                setHoveredLink(null);
                                setActiveCategory(null);
                            }}
                        >
                            <div
                                className="max-w-7xl mx-auto bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden relative"
                                style={{ filter: hoveredLink ? 'url(#biomorphic-filter)' : 'none' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                                <div className="grid grid-cols-12 gap-8 relative z-10">
                                    {/* Sidebar Categories */}
                                    <div className="col-span-3 border-r border-zinc-200 dark:border-white/5 pr-8 space-y-2">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-4">Browse by Category</h3>
                                        <button
                                            onMouseEnter={() => setActiveCategory(null)}
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-between group",
                                                activeCategory === null ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                                            )}
                                        >
                                            All Products
                                            <ChevronDown className={cn("w-3 h-3 -rotate-90 opacity-0 transition-all", activeCategory === null ? "opacity-100" : "group-hover:opacity-50")} />
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onMouseEnter={() => setActiveCategory(cat)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-between group",
                                                    activeCategory === cat ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                                                )}
                                            >
                                                {cat}
                                                <ChevronDown className={cn("w-3 h-3 -rotate-90 opacity-0 transition-all", activeCategory === cat ? "opacity-100" : "group-hover:opacity-50")} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Product Grid */}
                                    <div className="col-span-9">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                                                {activeCategory ? activeCategory : "Featured Products"}
                                            </h3>
                                            <Link
                                                href="/shop"
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex items-center gap-1 uppercase tracking-wider font-bold"
                                            >
                                                View All <ChevronDown className="w-3 h-3 -rotate-90" />
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-4 gap-6">
                                            {displayProducts.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/shop/${product.slug}`}
                                                    className="group block"
                                                >
                                                    <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-zinc-100 dark:bg-white/5">
                                                        {product.variants && product.variants.length > 0 && (
                                                            <div className="absolute top-2 right-2 bg-white/60 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[9px] uppercase tracking-wider font-bold text-zinc-900 dark:text-white z-10 border border-black/5 dark:border-white/10">
                                                                {product.variants.length} Sizes
                                                            </div>
                                                        )}
                                                        <Image
                                                            src={product.media[0] || "/placeholder.jpg"}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{product.name}</h4>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                                                        {product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : product.currency === 'INR' ? '₹' : product.currency === 'JPY' ? '¥' : ''}{product.price}
                                                    </p>
                                                </Link>
                                            ))}
                                            {displayProducts.length === 0 && (
                                                <div className="col-span-4 py-12 text-center text-zinc-500 text-xs uppercase tracking-widest">
                                                    No products found in this category.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-zinc-50/90 dark:bg-black/90 backdrop-blur-2xl flex flex-col p-6 md:hidden h-[100dvh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="relative w-28 h-8">
                                <Image
                                    src={globalContent?.navbar?.logo_url || "/we_naturals_logo.png"}
                                    alt="We Naturals"
                                    fill
                                    className="object-contain dark:invert-0 invert"
                                    priority
                                />
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-zinc-900 dark:text-white" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-8">
                            {links.map((link: any, i: number) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    transition={{
                                        delay: 0.1 + (i * 0.1),
                                        duration: 0.8,
                                        ease: [0.16, 1, 0.3, 1]
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-4xl font-display font-medium text-zinc-900 dark:text-white hover:text-blue-500 transition-colors tracking-tighter"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-8 border-t border-zinc-200 dark:border-white/10">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsSearchOpen(true);
                                }}
                                className="flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white"
                            >
                                <Search className="w-4 h-4" />
                                Search
                            </button>
                            <button
                                onClick={async () => {
                                    setIsMobileMenuOpen(false);
                                    const supabase = createClient();
                                    const { data: { session } } = await supabase.auth.getSession();
                                    if (session) {
                                        window.location.href = "/account";
                                    } else {
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${window.location.origin}/auth/callback`
                                            }
                                        });
                                    }
                                }}
                                className="flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Search Component */}
            <GlobalSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />


            {/* Biomorphic Filter Definition */}
            <svg className="hidden">
                <defs>
                    <filter id="biomorphic-filter">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>
        </>
    );
}
