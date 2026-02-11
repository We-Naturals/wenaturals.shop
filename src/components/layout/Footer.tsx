"use client";

import { motion, Variants, AnimatePresence } from "framer-motion";
import { Instagram, Youtube, Mail, Heart } from "lucide-react";
import { AmazonLogo, FlipkartLogo, MeeshoLogo } from "@/components/icons/MarketplaceIcons";
import { createClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
    {
        title: "Knowledge",
        links: [
            { name: "Blog", href: "/blog" },
            { name: "Shop", href: "/shop" },
            { name: "FAQ", href: "/faq" },
        ],
    },
    {
        title: "Service",
        links: [
            { name: "Contact Us", href: "/contact" },
            { name: "Privacy Policy", href: "/legal/privacy-policy" },
            { name: "Terms of Service", href: "/legal/terms-of-service" },
        ],
    },
];

export function Footer() {
    const [socialLinks, setSocialLinks] = useState({
        instagram: "#",
        youtube: "#",
        mail: "#",
        amazon: "#",
        flipkart: "#",
        meesho: "#"
    });

    const [email, setEmail] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const handleJoin = () => {
        if (email.includes("@")) {
            setShowSuccess(true);
            setEmail("");
            setTimeout(() => setShowSuccess(false), 3000);
        } else {
            alert("Please enter a valid email address containing @");
        }
    };

    useEffect(() => {
        const fetchLinks = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('site_config')
                .select('value')
                .eq('key', 'social_links')
                .single();

            if (data) {
                setSocialLinks(data.value);
            }
        };
        fetchLinks();
    }, []);

    const content = useContent('content_global');
    const { newsletter_title, newsletter_text, copyright_text } = content?.footer || {};

    const navContent = useContent('content_navigation');
    const footerLinks = (navContent?.footer && navContent.footer.length > 0)
        ? navContent.footer
        : FOOTER_LINKS.flatMap(group => group.links.map(l => ({ label: l.name, href: l.href })));

    const midPoint = Math.ceil(footerLinks.length / 2);
    const col1Links = footerLinks.slice(0, midPoint);
    const col2Links = footerLinks.slice(midPoint);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="relative pt-20 md:pt-32 pb-12 px-4 sm:px-6 overflow-hidden bg-zinc-50 dark:bg-black transition-colors duration-300">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="max-w-4xl mx-auto space-y-12 relative z-10"
            >
                {/* LOGO */}
                <div className="flex justify-center">
                    <button
                        onClick={scrollToTop}
                        className="relative w-40 h-12 opacity-80 hover:opacity-100 transition-all duration-500 hover:scale-105 active:scale-95"
                    >
                        <img
                            src={content?.footer?.logo_url || "/we_naturals_logo.png"}
                            alt="We Naturals"
                            className="object-contain w-full h-full dark:invert-0 invert"
                        />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative">
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-black/5 dark:bg-white/10 -translate-x-1/2" />

                    {/* LINKS */}
                    <div className="order-2 lg:order-1 flex justify-center w-full">
                        <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-[200px] mx-auto lg:mx-0 lg:max-w-none text-center lg:text-left">
                            <motion.div variants={itemVariants} className="space-y-4">
                                <ul className="space-y-2 text-sm">
                                    {col1Links.map((link: any) => (
                                        <li key={link.label}>
                                            <a href={link.href} className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors relative group">
                                                {link.label}
                                                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-full" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div variants={itemVariants} className="space-y-4">
                                <ul className="space-y-2 text-sm">
                                    {col2Links.map((link: any) => (
                                        <li key={link.label}>
                                            <a href={link.href} className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors relative group">
                                                {link.label}
                                                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-full" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>

                    {/* NEWSLETTER */}
                    <motion.div variants={itemVariants} className="text-center lg:text-left order-1 lg:order-2 pl-0 lg:pl-12">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2 font-heading text-zinc-900 dark:text-white">
                            {newsletter_title ? (
                                <span dangerouslySetInnerHTML={{ __html: newsletter_title.replace("Glow.", "<span class='text-gradient'>Glow.</span>") }} />
                            ) : (
                                <>Stay in the <span className="text-gradient">Glow.</span></>
                            )}
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-500 text-sm mb-4">
                            {newsletter_text || "Join our ethical circle for exclusive alchemy releases."}
                        </p>

                        <div className="h-16 w-full flex items-center justify-center lg:justify-start relative">
                            <AnimatePresence mode="wait">
                                {!showSuccess ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="flex flex-col sm:flex-row gap-2 w-full max-w-sm relative z-10"
                                    >
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email"
                                            className="flex-1 glass px-4 py-2 text-sm outline-none rounded-lg bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 focus:border-blue-500/50 transition-all"
                                        />
                                        <button
                                            onClick={handleJoin}
                                            className="px-6 py-3 sm:py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg font-bold text-sm hover:opacity-80 transition-all active:scale-95 shadow-lg group relative overflow-hidden"
                                        >
                                            <span className="relative z-10">Join</span>
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                initial={false}
                                            />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className="relative"
                                    >
                                        {/* Particle Explosion Aura */}
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: [0, 1.5, 2], opacity: [0, 0.5, 0] }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl"
                                        />

                                        <motion.div
                                            className="text-zinc-900 dark:text-white font-medium italic flex items-center gap-3 relative z-10"
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ staggerChildren: 0.05 }}
                                            >
                                                {"Thank you, we love you and care about you".split(" ").map((word, i) => (
                                                    <motion.span
                                                        key={i}
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="inline-block mr-1"
                                                    >
                                                        {word}
                                                    </motion.span>
                                                ))}
                                            </motion.span>
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    rotate: [0, 5, -5, 0]
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <Heart className="w-5 h-5 text-red-500 fill-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                            </motion.div>
                                        </motion.div>

                                        {/* Alchemical Dust Particles */}
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                                                initial={{ x: 0, y: 0, opacity: 0 }}
                                                animate={{
                                                    x: (i - 2.5) * 40,
                                                    y: [0, -40, -60],
                                                    opacity: [0, 1, 0],
                                                    scale: [0, 1, 0]
                                                }}
                                                transition={{
                                                    duration: 2 + Math.random(),
                                                    repeat: Infinity,
                                                    delay: Math.random()
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex gap-4 items-center justify-center lg:justify-start mt-4">
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-pink-500 transition-all hover:scale-110">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-red-500 transition-all hover:scale-110">
                                <Youtube className="w-4 h-4" />
                            </a>
                            <a href={`mailto:${socialLinks.mail}`} className="text-zinc-500 hover:text-black dark:hover:text-white transition-all hover:scale-110">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* BOTTOM */}
                <motion.div variants={itemVariants} className="pt-8 border-t border-black/5 dark:border-white/5 text-center">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-600 font-heading tracking-widest uppercase mb-2">
                        {copyright_text || `© ${new Date().getFullYear()} WE NATURALS`}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-serif italic">
                        <span>Ethically Crafted with</span>
                        <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                        <span>by</span>
                        <a
                            href="https://billionaire-coder.github.io/Its-Me/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            Saif Qadri
                        </a>
                    </div>
                </motion.div>
            </motion.div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-96 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </footer>
    );
}
