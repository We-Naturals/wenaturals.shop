"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

export function SmoothScroll() {
    const { performance } = useEnvironment();
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    useEffect(() => {
        if (isAdmin || performance?.smooth_scroll_enabled === false) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        // Skew Effect Logic
        let velocity = 0;
        const skewTarget = document.querySelector('main') || document.body;

        lenis.on('scroll', (e: any) => {
            velocity = e.velocity;
        });

        function raf(time: number) {
            lenis.raf(time);

            // Apply skew based on velocity
            if (skewTarget) {
                const skew = Math.min(Math.max(velocity * 0.08, -2), 2); // Cap at 2deg
                const filter = Math.min(Math.abs(velocity * 0.01), 2); // Subtle blur

                // Using CSS variables for performance (handled in layout/globals)
                // Or direct style for immediate feedback
                (skewTarget as HTMLElement).style.transform = `skewY(${skew}deg)`;
                (skewTarget as HTMLElement).style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
            }

            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            if (skewTarget) {
                (skewTarget as HTMLElement).style.transform = '';
            }
        };
    }, [isAdmin, performance?.smooth_scroll_enabled]);

    return null;
}
