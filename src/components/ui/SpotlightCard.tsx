"use client";

import { useMotionTemplate, useMotionValue, motion, useSpring } from "framer-motion";
import { MouseEvent } from "react";
import { cn } from "@/lib/utils";

import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    disableTilt?: boolean;
}

export function SpotlightCard({ children, className, disableTilt = false }: SpotlightCardProps) {
    const { performance } = useEnvironment();
    const isTiltEnabled = !disableTilt && performance.tilt_enabled && !performance.eco_mode;

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(0, { damping: 20, stiffness: 150 });
    const rotateY = useSpring(0, { damping: 20, stiffness: 150 });

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();

        const x = clientX - left;
        const y = clientY - top;

        mouseX.set(x);
        mouseY.set(y);

        if (isTiltEnabled) {
            // Calculate rotation (max 10 degrees)
            const rx = ((y / height) - 0.5) * -10;
            const ry = ((x / width) - 0.5) * 10;

            rotateX.set(rx);
            rotateY.set(ry);
        }
    }

    function handleMouseLeave() {
        if (isTiltEnabled) {
            rotateX.set(0);
            rotateY.set(0);
        }
    }

    return (
        <motion.div
            className={cn(
                "group relative border border-white/10 bg-white/5 overflow-hidden rounded-xl",
                className
            )}
            style={{
                rotateX: disableTilt ? 0 : rotateX,
                rotateY: disableTilt ? 0 : rotateY,
                transformPerspective: 1000
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
                }}
            />

            {/* Spotlight Border */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    border: useMotionTemplate`1px solid rgba(255,255,255,0.2)`,
                    maskImage: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              black,
              transparent
            )
          `,
                    WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              black,
              transparent
            )
          `,
                }}
            />

            <div className="relative h-full">{children}</div>
        </motion.div>
    );
}
