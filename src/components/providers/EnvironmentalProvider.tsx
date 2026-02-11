"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useTheme } from "next-themes";

type EnvMode = "dawn" | "noon" | "twilight" | "midnight";
type VibeMode = "nature" | "etheric" | "ancient" | "digital";

interface EnvTheme {
    mode: EnvMode;
    vibe: VibeMode;
    accentColor: string;
    ambientOpacity: number;
    particleIntensity: number;
    windVelocity: number;
    animationIntensity: number;
}

export interface PerformanceSettings {
    eco_mode: boolean;
    particles_enabled: boolean;
    recursive_geometry_enabled: boolean;
    smooth_scroll_enabled: boolean;
    parallax_enabled: boolean;
    custom_cursor_enabled: boolean;
    tilt_enabled: boolean;
    marquee_enabled: boolean;
}

const VIBE_CONFIGS: Record<VibeMode, Partial<EnvTheme>> = {
    nature: {
        ambientOpacity: 0.05,
        particleIntensity: 1,
        windVelocity: 1,
        animationIntensity: 1
    },
    etheric: {
        accentColor: "#a78bfa",
        ambientOpacity: 0.15,
        particleIntensity: 2.5,
        windVelocity: 2,
        animationIntensity: 1.5
    },
    ancient: {
        accentColor: "#d4af37",
        ambientOpacity: 0.1,
        particleIntensity: 0.6,
        windVelocity: 0.3,
        animationIntensity: 0.7
    },
    digital: {
        accentColor: "#10b981",
        ambientOpacity: 0.2,
        particleIntensity: 1.8,
        windVelocity: 1.5,
        animationIntensity: 1.3
    }
};

interface EnvContextType {
    theme: EnvTheme;
    ascension: any;
    performance: PerformanceSettings;
}

const DEFAULT_PERFORMANCE: PerformanceSettings = {
    eco_mode: false,
    particles_enabled: true,
    recursive_geometry_enabled: true,
    smooth_scroll_enabled: true,
    parallax_enabled: true,
    custom_cursor_enabled: true,
    tilt_enabled: true,
    marquee_enabled: true
};

const DEFAULT_THEME: EnvTheme = {
    mode: "noon",
    vibe: "nature",
    accentColor: "#3b82f6",
    ambientOpacity: 0.05,
    particleIntensity: 1,
    windVelocity: 1,
    animationIntensity: 1
};

const EnvContext = createContext<EnvContextType>({
    theme: DEFAULT_THEME,
    ascension: null,
    performance: DEFAULT_PERFORMANCE
});

export function EnvironmentalProvider({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [ascension, setAscension] = useState<any>(null);
    const [performance, setPerformance] = useState<PerformanceSettings>({
        eco_mode: false,
        particles_enabled: true,
        recursive_geometry_enabled: true,
        smooth_scroll_enabled: true,
        parallax_enabled: true,
        custom_cursor_enabled: true,
        tilt_enabled: true,
        marquee_enabled: true
    });
    const [theme, setTheme] = useState<EnvTheme>({
        mode: "noon",
        vibe: "nature",
        accentColor: "#3b82f6",
        ambientOpacity: 0.05,
        particleIntensity: 1,
        windVelocity: 1,
        animationIntensity: 1
    });

    // Handle real-time updates from admin preview
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'CMS_UPDATE_ALL') {
                const newAscension = event.data.data?.content_ascension;
                if (newAscension) {
                    setAscension(newAscension);
                }
                const newPerformance = event.data.data?.content_performance;
                if (newPerformance) {
                    setPerformance(newPerformance);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Initial fetch of settings
    useEffect(() => {
        const fetchSettings = async () => {
            const supabase = createClient();

            // Fetch Ascension
            const { data: ascData } = await supabase
                .from('site_config')
                .select('value')
                .eq('key', 'content_ascension')
                .single();

            if (ascData?.value) {
                setAscension(ascData.value);
            }

            // Fetch Performance
            const { data: perfData } = await supabase
                .from('site_config')
                .select('value')
                .eq('key', 'content_performance')
                .single();

            if (perfData?.value) {
                setPerformance(prev => ({ ...prev, ...perfData.value }));
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();
            let newTheme: EnvTheme;

            if (hour >= 5 && hour < 9) {
                newTheme = {
                    mode: "dawn",
                    vibe: "nature",
                    accentColor: "#f59e0b",
                    ambientOpacity: 0.08,
                    particleIntensity: 1.2,
                    windVelocity: 0.8,
                    animationIntensity: 1
                };
            } else if (hour >= 9 && hour < 17) {
                newTheme = {
                    mode: "noon",
                    vibe: "nature",
                    accentColor: "#3b82f6",
                    ambientOpacity: 0.05,
                    particleIntensity: 1,
                    windVelocity: 1.2,
                    animationIntensity: 1
                };
            } else if (hour >= 17 && hour < 21) {
                newTheme = {
                    mode: "twilight",
                    vibe: "nature",
                    accentColor: "#8b5cf6",
                    ambientOpacity: 0.12,
                    particleIntensity: 0.8,
                    windVelocity: 0.5,
                    animationIntensity: 1
                };
            } else {
                newTheme = {
                    mode: "midnight",
                    vibe: "nature",
                    accentColor: isDark ? "#1e3a8a" : "#3b82f6",
                    ambientOpacity: isDark ? 0.15 : 0.05,
                    particleIntensity: 0.5,
                    windVelocity: 0.3,
                    animationIntensity: 1
                };
            }

            // Apply Vibe Override
            if (ascension?.vibe && ascension.vibe !== "nature") {
                const vibeConfig = VIBE_CONFIGS[ascension.vibe as VibeMode];
                if (vibeConfig) {
                    newTheme.vibe = ascension.vibe as VibeMode;
                    Object.assign(newTheme, vibeConfig);
                }
            }

            // Apply Manual Overrides & Multipliers from Ascension Settings
            if (ascension) {
                if (ascension.manual_chrono_mode) {
                    newTheme.mode = ascension.manual_chrono_mode;
                    // Adjust accent colors for manual mode
                    const modes: Record<EnvMode, string> = {
                        dawn: "#f59e0b",
                        noon: "#3b82f6",
                        twilight: "#8b5cf6",
                        midnight: "#1e3a8a"
                    };
                    newTheme.accentColor = modes[ascension.manual_chrono_mode as EnvMode] || newTheme.accentColor;
                }

                newTheme.particleIntensity *= (ascension.particle_density ?? 1);
                newTheme.windVelocity *= (ascension.wind_velocity ?? 1);
                newTheme.animationIntensity = (ascension.animation_intensity ?? 1);
            }

            setTheme(newTheme);
        };

        updateTheme();
        const interval = setInterval(updateTheme, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [ascension]);

    return (
        <EnvContext.Provider value={{ theme, ascension, performance }}>
            {children}
        </EnvContext.Provider>
    );
}

export function useEnvironment() {
    return useContext(EnvContext);
}
