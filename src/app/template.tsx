"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const liquidPaths = [
    "M0,0 C20,10 40,20 60,10 C80,0 100,10 100,0 L100,100 L0,100 Z", // Start
    "M0,0 C30,40 70,60 100,40 L100,100 L0,100 Z",                   // Mid
    "M0,0 C50,100 50,100 100,100 L100,100 L0,100 Z"                // End (Fill)
];

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(true);

    useEffect(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => setIsTransitioning(false), 1000);
        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
                {children}
            </motion.div>

            {/* Liquid Overlay Mask */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        className="fixed inset-0 z-[100] pointer-events-none"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="w-full h-full fill-blue-600/10 dark:fill-blue-400/5 backdrop-blur-2xl"
                        >
                            <motion.path
                                initial={{ d: liquidPaths[2], opacity: 1 }}
                                animate={{ d: liquidPaths[0], opacity: 0 }}
                                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
