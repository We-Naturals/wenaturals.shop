"use client";

import { motion, useInView, useAnimation, Variants } from "framer-motion";
import { useEffect, useRef } from "react";

type SplitTextProps = {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
};

export function SplitText({ text, className = "", delay = 0, duration = 0.05 }: SplitTextProps) {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    const words = text.split(" ");

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: (i: number = 1) => ({
            opacity: 1,
            transition: {
                staggerChildren: duration,
                delayChildren: delay,
            },
        }),
    };

    const child: Variants = {
        hidden: {
            y: "110%",
            rotate: 5,
        },
        visible: {
            y: 0,
            rotate: 0,
            transition: {
                duration: 0.8,
                ease: [0.23, 1, 0.32, 1], // Power4.easeOut
            },
        },
    };

    return (
        <motion.span
            ref={ref}
            variants={container}
            initial="hidden"
            animate={controls}
            className={`inline-flex flex-wrap ${className}`}
        >
            {words.map((word, i) => (
                <span key={i} className="inline-block mr-[0.25em] overflow-hidden py-[0.1em] -my-[0.1em]">
                    {word.split("").map((char, j) => (
                        <motion.span
                            key={j}
                            variants={child}
                            className="inline-block origin-bottom"
                        >
                            {char}
                        </motion.span>
                    ))}
                </span>
            ))}
        </motion.span>
    );
}
