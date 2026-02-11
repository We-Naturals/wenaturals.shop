"use client";

import { useEffect, useRef } from "react";

export function GrainOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            const idata = ctx.createImageData(w, h);
            const buffer32 = new Uint32Array(idata.data.buffer);
            const len = buffer32.length;

            for (let i = 0; i < len; i++) {
                if (Math.random() < 0.05) { // 5% noise density
                    // Random white pixel with low opacity
                    // 0x(Alpha)(Blue)(Green)(Red) - little endian
                    // alpha 15 (~0.05) to 30 (~0.12)
                    buffer32[i] = 0x1affffff;
                }
            }

            ctx.putImageData(idata, 0, 0);

            // Loop at lower frame rate to save GPU? 
            // Actually, static noise changing every few frames creates the "film" look.
            // Let's run it every 50ms (20fps) instead of 60fps to save battery.
            setTimeout(() => {
                animationFrameId = requestAnimationFrame(draw);
            }, 50);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[9999] opacity-20 mix-blend-overlay"
        />
    );
}
