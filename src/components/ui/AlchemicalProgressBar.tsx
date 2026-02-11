"use client";

import { motion } from "framer-motion";

interface AlchemicalProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export function AlchemicalProgressBar({ currentStep, totalSteps }: AlchemicalProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="relative w-full h-24 flex items-center justify-center p-4">
            {/* The Glass Vessel */}
            <div className="relative w-full max-w-2xl h-8 bg-zinc-900/50 rounded-full border border-white/10 overflow-hidden backdrop-blur-md">
                {/* Fluid Essence */}
                <motion.div
                    className="absolute inset-0 bg-blue-500/30"
                    initial={{ x: "-100%" }}
                    animate={{ x: `${progress - 100}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 50 }}
                >
                    {/* Animated Bubbles */}
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-blue-400 rounded-full blur-[1px]"
                            animate={{
                                y: [0, -20, 0],
                                x: [0, (Math.random() - 0.5) * 50, 0],
                                opacity: [0, 0.8, 0]
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                            style={{ left: `${Math.random() * 100}%`, bottom: "10%" }}
                        />
                    ))}

                    {/* Glowing Surface */}
                    <div className="absolute top-0 right-0 h-full w-2 bg-blue-400 blur-[4px] shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
                </motion.div>

                {/* Glass Highlights */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Step Indicators */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-4">
                {[...Array(totalSteps)].map((_, i) => (
                    <div
                        key={i}
                        className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${i < currentStep ? "text-blue-400" : "text-zinc-600"}`}
                    >
                        Step 0{i + 1}
                    </div>
                ))}
            </div>
        </div>
    );
}
