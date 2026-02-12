"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { fetchProducts } from "@/app/shop/actions";
import { ProductFilterBar } from "./ProductFilterBar";

interface ProductGridProps {
    initialProducts: any[];
    allCategories?: string[];
}

function GridContent({ initialProducts, allCategories = [] }: ProductGridProps) {
    const searchParams = useSearchParams();
    const [allProducts, setAllProducts] = useState<any[]>(initialProducts);
    const [displayedProducts, setDisplayedProducts] = useState<any[]>(initialProducts);
    const [activeCategory, setActiveCategory] = useState("Everyone");
    const [searchQuery, setSearchQuery] = useState("");
    const [isHydrated, setIsHydrated] = useState(false);

    // Categories: Use passed categories OR derive from products if empty
    const categories = useMemo(() => {
        if (allCategories.length > 0) return ["Everyone", ...allCategories];
        const unique = Array.from(new Set(allProducts.map((p: any) => p.category)));
        return ["Everyone", ...unique.sort() as string[]];
    }, [allProducts, allCategories]);

    useEffect(() => {
        setIsHydrated(true);
        // Check URL param for initial category
        const catParam = searchParams.get('category');
        if (catParam && categories.includes(catParam)) {
            setActiveCategory(catParam);
        }
    }, [categories, searchParams]);

    // Filtering Logic
    useEffect(() => {
        let filtered = allProducts;

        if (activeCategory !== "Everyone") {
            // Updated filtering to support multi-category array
            filtered = filtered.filter(p =>
                p.category === activeCategory ||
                (p.categories && p.categories.includes(activeCategory))
            );
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            );
        }

        setDisplayedProducts(filtered);
    }, [activeCategory, searchQuery, allProducts]);

    const handleLoadMore = async () => {
        // Simple client-side pagination simulation or fetch-all strategy?
        // For now, let's fetch ALL remaining products from server if not already fetched?
        // Or if we want real pagination, we keep appending.
        // Given the requirement "Advanced Search & Pagination", we should probably implement true pagination 
        // OR infinite scroll.
        // However, mixing client-side filtering with server-side pagination is tricky without full URL state.
        // Implementation Plan Strategy: Load *more* into the client cache, then filter locally.

        // Fetch next batch (naive implementation assuming simplistic sequential IDs or page numbers)
        // Actually, let's just fetch everything remaining for a smooth client-side search experience (for small catalogs < 1000 items)
        if (allProducts.length < 100) { // Safety limit
            try {
                const newProducts = await fetchProducts(Math.floor(allProducts.length / 10) + 1);
                if (newProducts.length > 0) {
                    setAllProducts(prev => {
                        // Dedup just in case
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = newProducts.filter((p: any) => !existingIds.has(p.id));
                        return [...prev, ...uniqueNew];
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (!isHydrated) return null;

    return (
        <section className="py-12 px-6 relative overflow-hidden bg-mesh min-h-screen">
            <div className="max-w-7xl mx-auto">

                <ProductFilterBar
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    onSearchChange={setSearchQuery}
                />

                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {displayedProducts.map((product, index) => (
                            <motion.div
                                layout
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    slug={product.slug}
                                    price={product.price}
                                    currency={product.currency}
                                    category={product.category}
                                    image={product.media?.[0] || product.image || "/placeholder.jpg"}
                                    media={product.media}
                                    variants={product.variants}
                                    marketplace={product.marketplace}
                                    description={product.description}
                                    priority={index < 8}
                                    alchemyConfig={product.alchemy_config}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {displayedProducts.length === 0 && (
                    <div className="py-20 text-center text-zinc-500">
                        <p>No rituals found matching your criteria.</p>
                        <button
                            onClick={() => { setActiveCategory("Everyone"); setSearchQuery(""); }}
                            className="mt-4 text-blue-400 underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Decorative Blob */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        </section>
    );
}

export function ProductGrid({ initialProducts, allCategories }: ProductGridProps) {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-white/5" />}>
            <GridContent initialProducts={initialProducts} allCategories={allCategories} />
        </Suspense>
    );
}
