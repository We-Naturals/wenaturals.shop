"use client";

import { useContent } from "@/hooks/useContent";
import { useEffect } from "react";

export function DesignProvider({ children }: { children: React.ReactNode }) {
    const design = useContent('content_design_system');

    useEffect(() => {
        if (!design) return;

        const root = document.documentElement;

        // Apply colors
        root.style.setProperty('--primary', design.primary_color || '#3b82f6');

        // Apply geometry
        root.style.setProperty('--radius', design.border_radius || '0.75rem');

        // Apply glassmorphism
        root.style.setProperty('--glass-opacity', (design.glass_opacity || 0.1).toString());
        root.style.setProperty('--glass-blur', design.glass_blur || '10px');

    }, [design]);

    return <>{children}</>;
}
