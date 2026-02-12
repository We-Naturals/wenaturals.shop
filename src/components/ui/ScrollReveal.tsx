"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    distance?: number;
    duration?: number;
}

export function ScrollReveal({
    children,
    className = "",
    delay = 0,
    direction = "up",
    distance = 40,
    duration = 0.8
}: ScrollRevealProps) {
    const { performance, theme } = useEnvironment();
    const isAnimationEnabled = !performance.eco_mode && theme.animationIntensity > 0;

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const getInitialProps = () => {
        switch (direction) {
            case "up": return { y: distance, opacity: 0 };
            case "down": return { y: -distance, opacity: 0 };
            case "left": return { x: distance, opacity: 0 };
            case "right": return { x: -distance, opacity: 0 };
            case "none": return { scale: 0.9, opacity: 0 };
            default: return { y: distance, opacity: 0 };
        }
    };

    return (
        <motion.div
            ref={ref}
            initial={isAnimationEnabled ? getInitialProps() : { x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={(isInView || !isAnimationEnabled) ? { x: 0, y: 0, opacity: 1, scale: 1 } : getInitialProps()}
            transition={{
                duration: isAnimationEnabled ? (duration / Math.max(0.1, theme.animationIntensity)) : 0,
                delay: isAnimationEnabled ? delay : 0,
                ease: [0.23, 1, 0.32, 1] // Power4.easeOut
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
