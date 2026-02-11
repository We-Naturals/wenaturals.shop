"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidTextProps {
    text: string;
    className?: string;
    delay?: number;
}

export function LiquidText({ text, className = "", delay = 0 }: LiquidTextProps) {
    const words = text.split(" ");
    const isGradient = className.includes("text-gradient");
    const parentClassName = cn(
        "inline-block mb-2",
        className.replace("text-gradient", "").trim()
    );

    const wordClassName = cn(
        "mr-[0.2em] inline-block",
        isGradient && "text-gradient"
    );

    const container: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: delay,
            },
        },
    };

    const child: any = {
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 200,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(6px)",
        },
    };

    return (
        <motion.div
            className={parentClassName}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {words.map((word, index) => (
                <motion.span
                    variants={child}
                    key={index}
                    className={wordClassName}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
