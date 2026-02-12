"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";


import { useState, useEffect } from "react";

import { createClient } from "@/lib/supabase";

import { MediaSlider } from "@/components/ui/MediaSlider";
import { useSearchParams } from "next/navigation";
import { useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function CategorySpotlight(props: { initialContent?: any }) {
    const searchParams = useSearchParams();
    const isAdminPreview = searchParams.get('admin_preview') === 'true';

    const handleSelect = () => {
        if (isAdminPreview) {
            window.parent.postMessage({ type: 'SELECT_SECTION', section: 'sections' }, '*');
        }
    };

    const [categories, setCategories] = useState<any[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    const content = useContent('content_categories', props.initialContent);

    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createClient();
            // Fetch categories
            const { data: cats } = await supabase.from('categories').select('name');

            // Fetch one product image per category for the background
            const { data: products } = await supabase.from('products').select('image, categories');

            if (cats && products) {
                const mappedCats = cats.map((cat: any, i: number) => {
                    const prod = products.find((p: any) =>
                        (p.categories && p.categories.includes(cat.name)) && p.image
                    );
                    return {
                        title: cat.name,
                        tag: "Curated Collection",
                        image: prod?.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1000",
                        color: i % 3 === 0 ? "from-blue-500/20" : i % 3 === 1 ? "from-purple-500/20" : "from-emerald-500/20"
                    };
                });
                setCategories(mappedCats);
            }
            setIsHydrated(true);
        };
        fetchCategories();
    }, []);

    if (!isHydrated) return null;
    if (content?.visible === false) return null;

    return (
        <section
            id="categories"
            onClick={handleSelect}
            className={cn(
                "py-20 md:py-32 px-4 sm:px-6 scroll-mt-20 relative overflow-hidden bg-background transition-colors duration-300",
                isAdminPreview && "cursor-pointer hover:ring-4 hover:ring-blue-500/50 hover:ring-inset transition-all z-50"
            )}
        >
            {/* Background Media */}
            {content.media && content.media.length > 0 && (
                <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none">
                    <MediaSlider media={content.media} className="h-full w-full" objectFit="cover" overlay />
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                {content?.header_visible !== false && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 md:mb-16 gap-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
                            {content?.title_start || "The"} <span className="text-gradient">{content?.title_highlight || "Collections"}</span>
                        </h2>
                        <button className="px-6 py-2 glass dark:glass rounded-full text-xs md:text-sm font-bold uppercase tracking-widest border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all text-zinc-900 dark:text-white w-full sm:w-auto">
                            View All
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {categories.map((cat, i) => (
                        <ScrollReveal
                            key={cat.title}
                            direction="up"
                            delay={i * 0.2}
                        >
                            <div className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-white/10 hover:-translate-y-2 transition-all duration-500">
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-60`} />

                                {/* Overlay Gradient for consistency */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 mb-2 relative z-10">
                                        {cat.tag}
                                    </span>
                                    <div className="flex justify-between items-end relative z-10">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white shadow-black drop-shadow-md">{cat.title}</h3>
                                        <Magnetic>
                                            <button className="w-10 h-10 md:w-12 md:h-12 glass rounded-full flex items-center justify-center border-white/20 hover:bg-white hover:text-black transition-all text-white">
                                                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </Magnetic>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
