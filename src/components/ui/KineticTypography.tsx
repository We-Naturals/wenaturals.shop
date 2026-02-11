"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

const ALCHEMICAL_SYMBOLS = ["🜂", "🜄", "🜁", "🜃", "⚛", "➰", "♾", "⚗", "🜖", "🜲", "🜛", "🝀"];

interface KineticTypographyProps {
    text: string;
    className?: string;
}

const KineticChar = ({ char, index }: { char: string, index: number }) => {
    const { performance } = useEnvironment();
    const isParallaxEnabled = performance?.parallax_enabled !== false;

    const ref = useRef<HTMLSpanElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const blur = useTransform(scrollYProgress, [0, 0.4, 0.5, 0.6, 1], [isParallaxEnabled ? 12 : 0, isParallaxEnabled ? 4 : 0, 0, isParallaxEnabled ? 4 : 0, isParallaxEnabled ? 12 : 0]);
    const y = useTransform(scrollYProgress, [0, 0.4, 0.5, 0.6, 1], [isParallaxEnabled ? 60 : 0, isParallaxEnabled ? 20 : 0, 0, isParallaxEnabled ? -20 : 0, isParallaxEnabled ? -60 : 0]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.8, 1], [isParallaxEnabled ? 0 : 1, 1, 1, 1, isParallaxEnabled ? 0 : 1]);
    const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [isParallaxEnabled ? 30 : 0, 0, isParallaxEnabled ? -30 : 0]);

    // Alchemical symbol swapping state
    const [displayChar, setDisplayChar] = useState(char);

    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange((v) => {
            // Swap character for symbol only at extreme edges (outside 0.05 - 0.95)
            if (v < 0.05 || v > 0.95) {
                if (Math.random() > 0.9) {
                    setDisplayChar(ALCHEMICAL_SYMBOLS[Math.floor(Math.random() * ALCHEMICAL_SYMBOLS.length)]);
                }
            } else {
                setDisplayChar(char);
            }
        });
        return () => unsubscribe();
    }, [char, scrollYProgress]);

    // Don't animate spaces
    if (char === " ") return <span className="mr-[0.25em]">&nbsp;</span>;

    return (
        <motion.span
            ref={ref}
            style={{
                filter: useTransform(blur, v => `blur(${v}px)`),
                y,
                opacity,
                rotateX: rotate,
                display: "inline-block"
            }}
            className="origin-center"
        >
            {displayChar}
        </motion.span>
    );
};

export function KineticTypography({ text, className = "" }: KineticTypographyProps) {
    return (
        <span className={`inline-flex flex-wrap ${className}`}>
            {text.split("").map((char, i) => (
                <KineticChar key={i} char={char} index={i} />
            ))}
        </span>
    );
}
