"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useContent } from "@/hooks/useContent";

interface MarqueeProps {
    className?: string;
    velocity?: number;
}

export function Marquee({ className, velocity = 5 }: MarqueeProps) {
    return (
        <div className={cn("relative w-full overflow-hidden z-20 pointer-events-none select-none", className)}>
            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex gap-32"
                    animate={{
                        x: [0, -1000],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 20,
                            ease: "linear",
                        },
                    }}
                >
                    {[...Array(4)].map((_, i) => (
                        <span key={i} className="text-[12vw] md:text-[8vw] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-700/50 via-white/10 to-zinc-700/50 uppercase font-heading">
                            We Naturals
                        </span>
                    ))}
                </motion.div>

                {/* Second loop to ensure seamless transition, though Framer Motion x loop might handle it if width matches. 
                    Actually, cleaner approach for infinite loop: 
                */}
            </div>

            {/* 
               Alternative Robust Infinite Loop:
               Two duplicate motion divs sliding together.
            */}
            <div className="absolute top-0 flex whitespace-nowrap" aria-hidden="true">
                <motion.div
                    className="flex gap-32"
                    animate={{
                        x: ["0%", "-100%"],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 30, // Slower for elegance
                        ease: "linear",
                    }}
                >
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-32 pr-32">
                            <span className="text-[15vw] md:text-[10vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent uppercase font-heading leading-none">
                                We Naturals
                            </span>
                        </div>
                    ))}
                </motion.div>
                <motion.div
                    className="flex gap-32"
                    animate={{
                        x: ["0%", "-100%"],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 30,
                        ease: "linear",
                    }}
                >
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-32 pr-32">
                            <span className="text-[15vw] md:text-[10vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent uppercase font-heading leading-none">
                                We Naturals
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

// Rewriting for proper infinite marquee without the gap issue
export function MarqueeSimple({ initialContent }: { initialContent?: any }) {
    // Component can now be controlled via props (initialContent)
    const { text, duration, visible } = initialContent?.marquee || initialContent || {};

    if (visible === false) return null;

    // Default text if none provided
    const displayText = text || "ORGANIC • SUSTAINABLE • CRUELTY-FREE • CLINICALLY PROVEN •";

    return (
        <div className="w-full overflow-hidden py-8 md:py-16 opacity-100 relative z-30 pointer-events-none select-none bg-transparent">
            <motion.div
                className="flex whitespace-nowrap"
                animate={{ x: "-50%" }}
                transition={{
                    ease: "linear",
                    duration: duration || 40,
                    repeat: Infinity
                }}
            >
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-12 md:gap-32 pr-12 md:pr-32">
                        {[displayText, displayText, displayText].map((t: string, j: number) => (
                            <span key={j} className="text-[12vw] md:text-[15vw] leading-[0.8] font-black tracking-tighter text-zinc-900/[0.03] dark:text-white/[0.05] uppercase font-heading select-none mix-blend-multiply dark:mix-blend-screen shadow-none filter-none">
                                {t}
                            </span>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
