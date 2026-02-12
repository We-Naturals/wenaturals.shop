"use client";

import React, { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

export function Magnetic({ children }: { children: ReactNode }) {
    const { performance } = useEnvironment();
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent) => {
        if (!performance.tilt_enabled || performance.eco_mode) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current?.getBoundingClientRect() || { height: 0, width: 0, left: 0, top: 0 };
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.35, y: middleY * 0.35 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;
    return (
        <motion.div
            style={{ position: "relative" }}
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 180, damping: 12, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );
}
