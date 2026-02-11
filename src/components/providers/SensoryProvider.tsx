"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useEnvironment } from './EnvironmentalProvider';

interface SensoryContextType {
    playChime: (intensity?: number) => void;
    playLiquid: () => void;
    playBirdChirp: (intensity?: number) => void;
    isPlaying: boolean;
    initialize: () => void;
}

const SensoryContext = createContext<SensoryContextType>({
    playChime: () => { },
    playLiquid: () => { },
    playBirdChirp: () => { },
    isPlaying: false,
    initialize: () => { },
});

export function SensoryProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useEnvironment();
    const audioContext = useRef<AudioContext | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const initialize = async () => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContext.current.state === 'suspended') {
            await audioContext.current.resume();
        }
        setIsPlaying(true);
    };

    const playChime = (intensity: number = 0.5) => {
        // Function emptied per user request to completely remove sound
    };

    const playLiquid = () => {
        // Function emptied per user request to completely remove sound
    };

    const playBirdChirp = (intensity: number = 0.5) => {
        // Function emptied per user request to completely remove sound
    };

    return (
        <SensoryContext.Provider value={{ playChime, playLiquid, playBirdChirp, isPlaying, initialize }}>
            {children}
        </SensoryContext.Provider>
    );
}

export const useSensory = () => {
    const context = useContext(SensoryContext);
    return context;
};
