"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Microscope } from "lucide-react";

export const MaintenanceMode = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-50 dark:bg-[#050505] flex items-center justify-center overflow-hidden font-sans transition-colors duration-300">
            {/* Animated Molecular Background */}
            <div className="absolute inset-0 z-0 opacity-20 dark:opacity-20 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-500 rounded-full"
                        initial={{
                            x: Math.random() * 2000 - 1000,
                            y: Math.random() * 2000 - 1000,
                            scale: Math.random() * 2,
                            opacity: Math.random() * 0.5
                        }}
                        animate={{
                            x: Math.random() * 2000 - 1000,
                            y: Math.random() * 2000 - 1000,
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: Math.random() * 20 + 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 dark:bg-blue-500/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-400/5 dark:bg-indigo-500/5 blur-[100px] rounded-full animate-bounce pointer-events-none" />

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 max-w-2xl px-8 text-center"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-200/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 mb-8 backdrop-blur-md">
                    <Microscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 font-bold">Molecular Refinement in Progress</span>
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                </div>

                <h1 className="text-5xl md:text-7xl font-light text-zinc-900 dark:text-white mb-6 tracking-tight leading-tight">
                    Preserving the <span className="font-serif italic text-blue-600 dark:text-blue-400">Alchemy.</span>
                </h1>

                <p className="text-zinc-600 dark:text-zinc-500 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed mb-12">
                    We are currently distilling new innovations and refining our botanical purity.
                    The We Naturals platform will be restored shortly.
                </p>

                <div className="flex flex-col items-center gap-6">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    <div className="flex items-center gap-6 text-zinc-500 dark:text-zinc-600">
                        <span className="text-[10px] uppercase tracking-widest font-bold">Science</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-white/10" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Nature</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-white/10" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Purity</span>
                    </div>
                </div>

                {/* Secure Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-24 inline-flex items-center gap-2 group cursor-help"
                >
                    <Shield className="w-4 h-4 text-zinc-400 dark:text-zinc-700 group-hover:text-blue-500/50 transition-colors" />
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-800 group-hover:text-zinc-600 transition-colors">Encrypted Maintenance Node Alpha-7</span>
                </motion.div>
            </motion.div>

            {/* Decorative Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};
