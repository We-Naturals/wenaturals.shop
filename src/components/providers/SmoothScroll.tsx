"use client";

import { ReactLenis, useLenis } from 'lenis/react';
import { ReactNode, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export function SmoothScroll({ children }: { children: ReactNode }) {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Link Lenis to GSAP Ticker for frame-perfect sync
        gsap.ticker.lagSmoothing(0);

        const update = (time: number) => {
            ScrollTrigger.update();
        };

        gsap.ticker.add(update);

        return () => {
            gsap.ticker.remove(update);
        };
    }, []);

    return (
        <ReactLenis
            root
            options={{
                lerp: 0.35,        // Much snappier (was 0.15)
                duration: 0.6,     // Faster stop (was 0.8)
                smoothWheel: true,
                syncTouch: true,
                wheelMultiplier: 1.5, // Faster travel (was 1.0)
                touchMultiplier: 2,   // Faster touch (was 1.2)
            }}
        >
            {children}
        </ReactLenis>
    );
}
