"use client";

import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Leaf, FlaskConical } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHero } from "@/components/layout/PageHero";
import { useContent } from "@/hooks/useContent";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

export function AboutClient({ initialContent }: { initialContent?: any }) {
    // Falls back to hook if initialContent is missing (e.g. during transitions)
    const content = useContent('content_pages', initialContent ? { content_pages: initialContent } : undefined);

    // If the hook is used, it returns the whole object. 
    // If initialContent is passed directly, we use it.
    // Let's standardize: pass the specific page content.

    const aboutContent = initialContent?.about || content?.about || {
        title: "Behind the Glass",
        description: "Merging ancient biological wisdom with modern molecular science.",
        heading: "Our Story",
        media: []
    };

    return (
        <main className="min-h-screen bg-background pb-20 transition-colors duration-300">
            <Navbar />

            <PageHero
                title={aboutContent.title}
                description={aboutContent.description}
                media={aboutContent.media}
            />

            {aboutContent.blocks && aboutContent.blocks.length > 0 ? (
                <BlockRenderer blocks={aboutContent.blocks} />
            ) : (
                <>
                    {/* The Philosophy Grid */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="relative aspect-[4/5] rounded-2xl overflow-hidden"
                                >
                                    <Image
                                        src="https://images.unsplash.com/photo-1556228578-8d89cb2563f6?auto=format&fit=crop&q=80&w=1000"
                                        alt="Laboratory formulations"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-8"
                                >
                                    <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-blue-400 mb-6">
                                        <FlaskConical className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-4xl font-bold">Clinical <span className="text-gradient">Precision</span></h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                                        Our formulations are not accidents. They are the result of rigorous scientific inquiry, testing, and refinement. We isolate the most potent active compounds from nature and deliver them in bio-available structures that your skin recognizes and welcomes.
                                    </p>
                                    <ul className="space-y-4">
                                        {["Molecular Distillation", "Bio-Active Delivery Systems", "Clean Clinical Validation"].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-8 order-2 md:order-1"
                                >
                                    <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-green-400 mb-6">
                                        <Leaf className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-4xl font-bold">Earth <span className="text-gradient-green">Sourced</span></h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                                        We believe the earth provides everything we need to heal. Our responsibility is to harvest it with respect. We partner with small-scale, regenerative farms that prioritize soil health and biodiversity.
                                    </p>
                                    <ul className="space-y-4">
                                        {["Regeneratiive Farming Parsing", "Wild-Crafted Botanicals", "Zero-Waste Extraction"].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="relative aspect-[4/5] rounded-2xl overflow-hidden order-1 md:order-2"
                                >
                                    <Image
                                        src="https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&q=80&w=1000"
                                        alt="Ethical sourcing"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Values Banner */}
                    <section className="py-24 px-6 bg-zinc-50 dark:bg-white/[0.02] border-y border-zinc-200 dark:border-white/5">
                        <div className="max-w-7xl mx-auto text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl md:text-5xl font-bold mb-12">Built on <span className="text-gradient">Transparent Values</span></h2>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { title: "No Compromise", desc: "We never use fillers, parabens, or synthetic fragrances. Only active, potent ingredients." },
                                    { title: "Radical Honesty", desc: "We disclose every ingredient and its source. You deserve to know what touches your skin." },
                                    { title: "Cyclical Living", desc: "Our products act in harmony with your body's natural rhythms and the earth's seasons." }
                                ].map((card, i) => (
                                    <GlassCard key={i} className="p-8 hover:bg-white/5 transition-colors">
                                        <Sparkles className="w-8 h-8 text-blue-400 mb-6 mx-auto" />
                                        <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                                        <p className="text-zinc-500">{card.desc}</p>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            <Footer />
            <CartSidebar />
        </main>
    );
}
