"use client";

import React from "react";
import { cn } from "@/lib/utils";

import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

interface AlchemicalSurfaceProps {
    children: React.ReactNode;
    type: "liquid-gold" | "obsidian" | "iridescent-silk" | "blue-essence";
    className?: string;
}

export function AlchemicalSurface({ children, type, className }: AlchemicalSurfaceProps) {
    const { theme, ascension } = useEnvironment();
    const getShaderStyles = () => {
        switch (type) {
            case "liquid-gold":
                return "relative overflow-hidden bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 text-zinc-900 dark:text-white shadow-[0_8px_32px_rgba(212,175,55,0.1)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.25)] group transition-all duration-700";
            case "blue-essence":
                return "relative overflow-hidden bg-blue-500/10 backdrop-blur-xl border border-white/20 text-zinc-900 dark:text-white shadow-[0_8px_32px_rgba(59,130,246,0.1)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.25)] group transition-all duration-700";
            case "obsidian":
                return "relative overflow-hidden bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]";
            case "iridescent-silk":
                return "relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/10";
            default:
                return "";
        }
    };

    return (
        <div className={cn("relative", getShaderStyles(), className)}>
            {(type === "liquid-gold" || type === "blue-essence") && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-[200%] -translate-x-[100%] group-hover:animate-shimmer"
                        style={{
                            opacity: (ascension?.shader_intensity ?? 1) * theme.animationIntensity,
                            animationDuration: `${2 / ((ascension?.shader_speed ?? 1) * theme.animationIntensity)}s`
                        }}
                    />
                </div>
            )}

            {type === "obsidian" && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_100%)]" />
                </div>
            )}

            <div className="relative z-10">{children}</div>
        </div>
    );
}
