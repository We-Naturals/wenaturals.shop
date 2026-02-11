"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

interface TrailPoint {
    x: number;
    y: number;
    age: number;
    id: number;
}

export function CustomCursor() {
    const { performance } = useEnvironment();
    const pathname = usePathname();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<TrailPoint[]>([]);
    const requestRef = useRef<number>(0);

    const [cursorState, setCursorState] = useState<{
        type: 'default' | 'pointer' | 'text' | 'view' | 'drag';
        label?: string;
    }>({ type: 'default' });
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [magneticTarget, setMagneticTarget] = useState<{ x: number, y: number } | null>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Precise dot (very fast)
    const dotSpringConfig = { damping: 40, stiffness: 800 };
    const dotX = useSpring(mouseX, dotSpringConfig);
    const dotY = useSpring(mouseY, dotSpringConfig);

    // Lagging ring (slower, luxury feel)
    const ringSpringConfig = { damping: 30, stiffness: 300, mass: 0.5 };
    const ringX = useSpring(mouseX, ringSpringConfig);
    const ringY = useSpring(mouseY, ringSpringConfig);

    useEffect(() => {
        const isAdmin = pathname?.startsWith("/admin");
        if (isAdmin || performance?.custom_cursor_enabled === false) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update points
            pointsRef.current = pointsRef.current
                .map(p => ({ ...p, age: p.age + 1 }))
                .filter(p => p.age < 30);

            // Draw trail
            if (pointsRef.current.length > 2) {
                ctx.beginPath();
                ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);

                for (let i = 1; i < pointsRef.current.length; i++) {
                    const p = pointsRef.current[i];
                    const opacity = Math.max(0, (1 - p.age / 30) * 0.3);

                    // Alchemical blue ember tone
                    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `rgba(59, 130, 246, ${opacity})`;
                    ctx.lineWidth = (1 - p.age / 30) * 8;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                }
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(requestRef.current!);
        };
    }, [pathname, performance?.custom_cursor_enabled]);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            mouseX.set(clientX);
            mouseY.set(clientY);

            // Add point to trail
            pointsRef.current.push({
                x: clientX,
                y: clientY,
                age: 0,
                id: Date.now()
            });

            // Magnetic Logic - Check for nearby magnetic elements
            const target = e.target as HTMLElement;
            const magneticElement = target.closest('[data-magnetic]') as HTMLElement;

            if (magneticElement) {
                const rect = magneticElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Calculate distance from mouse to center
                const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

                if (distance < 100) { // Attraction radius
                    setMagneticTarget({ x: centerX, y: centerY });
                    return;
                }
            }
            setMagneticTarget(null);
        };

        const handleMouseDown = () => setIsMouseDown(true);
        const handleMouseUp = () => setIsMouseDown(false);

        const handleHoverStart = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const interactive = target.closest('a, button, input, textarea, .cursor-pointer, [data-cursor]');

            if (interactive) {
                const cursorType = (interactive as HTMLElement).getAttribute('data-cursor') as any || 'pointer';
                const label = (interactive as HTMLElement).getAttribute('data-cursor-label');
                setCursorState({ type: cursorType, label: label || undefined });
            }
        };
        const handleHoverEnd = () => setCursorState({ type: 'default' });

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseover", handleHoverStart);
        window.addEventListener("mouseout", handleHoverEnd);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseover", handleHoverStart);
            window.removeEventListener("mouseout", handleHoverEnd);
        };
    }, [pathname, performance?.custom_cursor_enabled]);

    const isAdmin = pathname?.startsWith("/admin");
    const isCustomCursorActive = !isAdmin && performance?.custom_cursor_enabled !== false;

    // Dynamic cursor-none management
    useEffect(() => {
        if (isCustomCursorActive) {
            document.body.classList.add('cursor-none');
        } else {
            document.body.classList.remove('cursor-none');
        }

        return () => {
            document.body.classList.remove('cursor-none');
        };
    }, [isCustomCursorActive]);

    if (!isCustomCursorActive) return null;


    const isHovering = cursorState.type !== 'default';

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Ether Trail Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-[-1]"
            />

            {/* Lagging Outer Ring */}
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 border border-white mix-blend-difference rounded-full flex items-center justify-center overflow-hidden"
                style={{
                    x: magneticTarget ? dotX : ringX,
                    y: magneticTarget ? dotY : ringY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isMouseDown ? 0.8 : (isHovering ? (cursorState.type === 'view' ? 3.5 : 2.2) : 1),
                    backgroundColor: cursorState.type === 'view'
                        ? "rgba(255,255,255,1)"
                        : (isHovering ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0)"),
                    borderWidth: "1px",
                    borderColor: isHovering ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,1)",
                }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
            >
                <AnimatePresence>
                    {cursorState.label && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-[8px] font-black uppercase tracking-tighter text-black mix-blend-normal"
                        >
                            {cursorState.label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Precision Center Dot */}
            <motion.div
                className="fixed top-0 left-0 w-1 h-1 bg-white mix-blend-difference rounded-full"
                style={{
                    x: dotX,
                    y: dotY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isHovering ? 0 : 1,
                    opacity: magneticTarget ? 0 : 1
                }}
            />
        </div>
    );
}
