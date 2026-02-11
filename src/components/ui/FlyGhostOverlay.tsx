"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export function FlyGhostOverlay() {
    const { flyItem, clearFly } = useCart();
    const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Find cart icon position in the DOM
        const updateTarget = () => {
            const cartIcon = document.querySelector('.cart-icon-target');
            if (cartIcon) {
                const rect = cartIcon.getBoundingClientRect();
                setTargetPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                });
            }
        };

        updateTarget();
        window.addEventListener('resize', updateTarget);
        window.addEventListener('scroll', updateTarget);
        return () => {
            window.removeEventListener('resize', updateTarget);
            window.removeEventListener('scroll', updateTarget);
        };
    }, [flyItem]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <AnimatePresence>
                {flyItem && (
                    <motion.div
                        key="ghost"
                        initial={{
                            x: flyItem.x,
                            y: flyItem.y,
                            scale: 0.5,
                            opacity: 0,
                            filter: "blur(10px)"
                        }}
                        animate={{
                            x: targetPos.x,
                            y: targetPos.y,
                            scale: [0.5, 1.2, 0.4],
                            opacity: [0, 1, 0.8, 0],
                            filter: ["blur(10px)", "blur(0px)", "blur(5px)"]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 1.2,
                            ease: [0.34, 1.56, 0.64, 1] // Custom spring-like curve
                        }}
                        onAnimationComplete={() => clearFly()}
                        className="absolute w-20 h-20 -ml-10 -mt-10"
                    >
                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                            <Image
                                src={flyItem.image}
                                alt="Ghost"
                                fill
                                className="object-cover scale-150"
                            />
                            <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay" />
                        </div>

                        {/* Trail particles */}
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-blue-400 rounded-full blur-[2px]"
                                initial={{ opacity: 0.8 }}
                                animate={{
                                    opacity: 0,
                                    x: (Math.random() - 0.5) * 40,
                                    y: (Math.random() - 0.5) * 40,
                                    scale: 0
                                }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
