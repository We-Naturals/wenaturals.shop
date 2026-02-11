"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
    const [isLoading, setIsLoading] = useState(true);
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Check if we've already shown the loader this session
        const hasLoaded = sessionStorage.getItem("hasLoaded");
        if (hasLoaded) {
            setIsLoading(false);
            return;
        }

        // Lock scroll
        document.body.style.overflow = "hidden";

        // Counter Logic
        const interval = setInterval(() => {
            setCount(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Randomize increment for "realistic" load feel
                return prev + Math.floor(Math.random() * 10) + 1;
            });
        }, 100);

        // Completion Logic
        const timer = setTimeout(() => {
            setIsLoading(false);
            document.body.style.overflow = "auto";
            sessionStorage.setItem("hasLoaded", "true");
        }, 2500);

        return () => {
            document.body.style.overflow = "auto";
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden origin-top"
                    exit={{
                        scaleY: 0,
                        transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }
                    }}
                >
                    {/* Atmospheric Glow Layer */}
                    <div className="absolute inset-0 z-0">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/10 blur-[200px] rounded-full"
                        />
                    </div>

                    <div className="relative z-10 flex flex-col items-center w-full px-6">
                        <div className="overflow-hidden mb-8 md:mb-12">
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-[0.2em] md:tracking-[0.4em] uppercase mix-blend-difference font-heading text-gradient text-center">
                                    We Naturals
                                </h1>
                            </motion.div>
                        </div>

                        {/* Cinematic Laser Loading Bar */}
                        <div className="w-[80vw] max-w-sm h-[2px] bg-white/5 relative overflow-hidden rounded-full mb-4">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400"
                                initial={{ width: "0%" }}
                                animate={{ width: `${count}%` }}
                                transition={{ type: "spring", stiffness: 40, damping: 20 }}
                            />
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-white/30 blur-md"
                                initial={{ width: "0%" }}
                                animate={{ width: `${count}%` }}
                                transition={{ type: "spring", stiffness: 40, damping: 20 }}
                            />
                        </div>

                        <div className="flex justify-between w-[80vw] max-w-sm">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] md:tracking-[0.3em] font-mono"
                            >
                                Initializing Core
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] md:tracking-[0.3em] font-mono"
                            >
                                {Math.min(count, 100)}%
                            </motion.p>
                        </div>
                    </div>

                    {/* Reveal Background (Pre-cache feel) */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-20">
                        <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 animate-pulse">
                            Synthetic Biology meets Botanical Purity
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
