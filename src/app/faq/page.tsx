"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { useContent } from "@/hooks/useContent";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FaqItem = ({ question, answer, isOpen, onToggle, index }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-4"
        >
            <button
                onClick={onToggle}
                className={cn(
                    "w-full text-left p-6 rounded-2xl border transition-all duration-500 flex justify-between items-center group",
                    isOpen
                        ? "bg-white dark:bg-white/10 border-zinc-200 dark:border-white/20 shadow-xl dark:shadow-2xl"
                        : "bg-white/50 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10"
                )}
            >
                <div className="flex gap-4 items-center">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isOpen ? "bg-blue-600 dark:bg-blue-500 text-white" : "bg-zinc-100 dark:bg-white/5 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-white"
                    )}>
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">{question}</span>
                </div>
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                    isOpen ? "bg-zinc-900 dark:bg-white text-white dark:text-black rotate-180" : "bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-white"
                )}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden"
                    >
                        <div
                            className="p-8 pt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg border-x border-b border-zinc-200 dark:border-white/5 rounded-b-2xl ml-4 mr-4 bg-zinc-100 dark:bg-zinc-900/40 prose dark:prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: answer }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function FAQPage() {
    const faqContent = useContent('content_pages')?.faq || {};
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const items = faqContent.items || [];

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80\u0026w=2564\u0026auto=format\u0026fit=crop')] bg-cover opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-50/80 dark:via-[#050505]/80 to-zinc-50 dark:to-[#050505]" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Assistance Center</span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-white/50">
                            {faqContent.title || "Biological FAQ"}
                        </h1>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {faqContent.description || "Common inquiries about molecular purity and delivery."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Items */}
            <section className="pb-32">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        {items.length > 0 ? (
                            items.map((item: any, i: number) => (
                                <FaqItem
                                    key={i}
                                    index={i}
                                    question={item.question}
                                    answer={item.answer}
                                    isOpen={openIndex === i}
                                    onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-zinc-100 dark:bg-white/5 rounded-3xl border border-zinc-200 dark:border-white/5 border-dashed">
                                <HelpCircle className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-500 italic font-mono">No wisdom found yet in this archive.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Support CTA */}
            <section className="pb-32">
                <div className="container mx-auto px-6">
                    <GlassCard className="max-w-5xl mx-auto p-12 text-center relative overflow-hidden group border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <h2 className="text-3xl font-bold mb-4 relative z-10 text-zinc-900 dark:text-white">Still have questions?</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto relative z-10"> Our molecular specialists are available for direct consultation regarding specific skin profiles and rituals.</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-zinc-900 text-white dark:bg-white dark:text-black font-bold rounded-full text-sm uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white transition-all relative z-10"
                            onClick={() => window.location.href = '/contact'}
                        >
                            Contact Support
                        </motion.button>
                    </GlassCard>
                </div>
            </section>

            <Footer />
        </main>
    );
}
