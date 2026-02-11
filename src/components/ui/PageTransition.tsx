"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const liquidPaths = [
    "M0,0 C20,10 40,20 60,10 C80,0 100,10 100,0 L100,100 L0,100 Z", // Start
    "M0,0 C30,40 70,60 100,40 L100,100 L0,100 Z",                   // Mid
    "M0,0 C50,100 50,100 100,100 L100,100 L0,100 Z"                // End (Fill)
];

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(false);

    return (
        <div className="relative overflow-hidden w-full min-h-screen">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        duration: 0.5
                    }}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            {/* Liquid Overlay Mask */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        className="fixed inset-0 z-[100] pointer-events-none"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="w-full h-full fill-blue-600/20 dark:fill-blue-400/10 backdrop-blur-3xl"
                        >
                            <motion.path
                                initial={{ d: liquidPaths[0] }}
                                animate={{ d: liquidPaths[2] }}
                                exit={{ d: liquidPaths[0] }}
                                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
