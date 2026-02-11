"use client";

import React, { useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';
import { useSensory } from '@/components/providers/SensoryProvider';
import { useEnvironment } from '@/components/providers/EnvironmentalProvider';

interface Particle {
    x: number;
    y: number;
    z: number; // Depth property
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    color: string;
}

export function AtmosphereParticles() {
    const { theme, performance } = useEnvironment();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { scrollYProgress } = useScroll();
    const { playBirdChirp } = useSensory();
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef<Particle[]>([]);
    const velocityRef = useRef(0);
    const lastScrollY = useRef(0);

    useEffect(() => {
        if (performance?.particles_enabled === false) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const init = () => {
            const count = Math.min(Math.floor((window.innerWidth / 20) * theme.particleIntensity), 150);
            particlesRef.current = [];
            for (let i = 0; i < count; i++) {
                const z = Math.random() * 0.5 + 0.1; // Depth from 0.1 to 0.6
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z,
                    size: (Math.random() * 2 + 1) * z * 2,
                    speedX: (Math.random() - 0.5) * 0.5 * theme.windVelocity * theme.animationIntensity * z,
                    speedY: (Math.random() - 0.5) * 0.5 * theme.windVelocity * theme.animationIntensity * z,
                    opacity: (Math.random() * 0.5 + 0.1) * z * 1.5,
                    color: i % 2 === 0 ? theme.accentColor : 'rgba(139, 92, 246, 0.4)'
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();

        let animationFrame: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Smoothly interpolate velocity
            const currentScrollY = window.scrollY;
            const targetVelocity = (currentScrollY - lastScrollY.current) * 0.15;

            velocityRef.current += (targetVelocity - velocityRef.current) * 0.1;
            lastScrollY.current = currentScrollY;

            particlesRef.current.forEach(p => {
                // Drift with velocity (affected by depth)
                p.y -= velocityRef.current * p.z;

                // Base movement + organic jitter + depth scaling
                p.x += p.speedX + (Math.sin(Date.now() * 0.001 + p.y) * 0.1 * p.z);
                p.y += p.speedY;

                // Mouse repulsion (organic field - affected by depth)
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 200 * p.z) {
                    const force = (200 * p.z - distance) / (200 * p.z);
                    p.x -= dx * force * 0.03 * p.z;
                    p.y -= dy * force * 0.03 * p.z;
                }

                // Warp around screen
                if (p.x < -50) p.x = canvas.width + 50;
                if (p.x > canvas.width + 50) p.x = -50;
                if (p.y < -50) p.y = canvas.height + 50;
                if (p.y > canvas.height + 50) p.y = -50;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
        };
    }, [theme, performance?.particles_enabled]);

    if (performance?.particles_enabled === false) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-1000"
            style={{
                opacity: theme.mode === 'midnight' ? 0.3 : 0.5,
                filter: 'blur(1px)'
            }}
        />
    );
}
