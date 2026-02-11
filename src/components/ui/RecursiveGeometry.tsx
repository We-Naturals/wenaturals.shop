import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

export function RecursiveGeometry() {
    const { theme, ascension, performance } = useEnvironment();
    const { scrollYProgress } = useScroll();

    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.5]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.2, 0.1]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    if (performance?.recursive_geometry_enabled === false) return null;

    return (
        <motion.div
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center"
            style={{ opacity, scale, rotate }}
        >
            <svg viewBox="0 0 400 400" className="w-[150%] h-[150%] text-blue-500/20 dark:text-blue-400/10">
                <defs>
                    <radialGradient id="grad-recursive" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Base Flower of Life Pattern */}
                {[...Array(3)].map((_, layer) => (
                    <motion.g
                        key={layer}
                        animate={{
                            rotate: layer % 2 === 0 ? 360 : -360,
                        }}
                        transition={{
                            duration: (20 + layer * 10) / ((ascension?.recursive_speed ?? 1) * theme.animationIntensity),
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ originX: "200px", originY: "200px" }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <circle
                                key={i}
                                cx={200 + (layer * 40 + 60) * Math.cos(i * 60 * Math.PI / 180)}
                                cy={200 + (layer * 40 + 60) * Math.sin(i * 60 * Math.PI / 180)}
                                r={100 - layer * 20}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                strokeDasharray="2 2"
                            />
                        ))}
                    </motion.g>
                ))}

                {/* Recursive Fractal Elements */}
                <FractalCircles
                    cx={200}
                    cy={200}
                    r={100}
                    depth={0}
                    maxDepth={Math.min(ascension?.recursive_depth ?? 3, 5)}
                    scrollY={scrollYProgress}
                />
            </svg>
        </motion.div>
    );
}

function FractalCircles({ cx, cy, r, depth, maxDepth, scrollY }: { cx: number, cy: number, r: number, depth: number, maxDepth: number, scrollY: any }) {
    if (depth >= maxDepth) return null;

    return (
        <g>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.3} />
            {[...Array(6)].map((_, i) => {
                const angle = i * 60 * Math.PI / 180;
                const nextX = cx + r * Math.cos(angle);
                const nextY = cy + r * Math.sin(angle);
                return (
                    <FractalCircles
                        key={i}
                        cx={nextX}
                        cy={nextY}
                        r={r / 2}
                        depth={depth + 1}
                        maxDepth={maxDepth}
                        scrollY={scrollY}
                    />
                );
            })}
        </g>
    );
}
