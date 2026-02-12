"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { motion, useScroll, useTransform, useSpring, useVelocity, useMotionValue } from "framer-motion";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

const CAUSTIC_PATHS = [
    "M100,100 C150,50 250,50 300,100 C350,150 350,250 300,300 C250,350 150,350 100,300 C50,250 50,150 100,100Z",
    "M100,100 C200,80 280,120 300,200 C320,280 280,360 200,380 C120,400 40,320 20,240 C0,160 40,120 100,100Z"
];

const CausticLayer = ({ index, mouseVelocity, scrollY, color }: { index: number, mouseVelocity: any, scrollY: any, color?: string }) => {
    const scale = useTransform(scrollY, [0, 5000], [1.2 + index * 0.15, 1.8 + index * 0.25]);
    const rotate = useTransform(scrollY, [0, 5000], [0, 45 + index * 90]);
    const opacity = useTransform(mouseVelocity, [-500, 0, 500], [0.3, 0.1, 0.3]);

    return (
        <motion.svg
            viewBox="0 0 400 400"
            className="absolute opacity-[0.03] dark:opacity-[0.05]"
            style={{
                width: `${45 + index * 25}vw`,
                height: `${45 + index * 25}vh`,
                left: `${(index * 35) % 80}%`,
                top: `${(index * 40) % 70}%`,
                scale,
                rotate,
                opacity,
                filter: "blur(50px)",
                zIndex: index * 10
            }}
        >
            <motion.path
                d={CAUSTIC_PATHS[index % CAUSTIC_PATHS.length] || CAUSTIC_PATHS[0]}
                fill="currentColor"
                style={{ color: color || "inherit" }}
                className="text-blue-500 dark:text-blue-400"
                animate={{
                    d: CAUSTIC_PATHS[(index + 1) % CAUSTIC_PATHS.length] || CAUSTIC_PATHS[1],
                    transition: {
                        duration: 5 + index * 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }
                }}
            />
        </motion.svg>
    );
};

export function ParallaxBackground() {
    const { theme, performance } = useEnvironment();

    // If parallax is disabled, we still show the base background color, but no moving layers
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const springY = useSpring(mouseY, { damping: 50, stiffness: 400 });
    const velocityX = useVelocity(springX);
    const velocityY = useVelocity(springY);
    const [mouseSpeed, setMouseSpeed] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const updateSpeed = () => {
            const speed = Math.abs(velocityX.get()) + Math.abs(velocityY.get());
            setMouseSpeed(speed);
            requestAnimationFrame(updateSpeed);
        };

        window.addEventListener("mousemove", handleMouseMove);
        const speedFrame = requestAnimationFrame(updateSpeed);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(speedFrame);
        };
    }, [mouseX, mouseY, velocityX, velocityY]);

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-background transition-colors duration-300">
            {/* Generative Caustic Sea */}
            {performance?.parallax_enabled !== false && [...Array(6)].map((_, i) => (
                <CausticLayer
                    key={i}
                    index={i}
                    mouseVelocity={velocityX}
                    scrollY={scrollY}
                    color={theme.accentColor}
                />
            ))}

            {/* Aurora Atmosphere Overlay */}
            {performance?.parallax_enabled !== false && (
                <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: theme.ambientOpacity }}>
                    <div
                        className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vh] rounded-full blur-[150px] animate-pulse"
                        style={{ backgroundColor: `${theme.accentColor}20` }}
                    />
                    <div
                        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vh] rounded-full blur-[150px] animate-pulse"
                        style={{ backgroundColor: `${theme.accentColor}15`, animationDelay: "2s" }}
                    />
                </div>
            )}

        </div>
    );
}
