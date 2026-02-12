"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type MediaType = "image" | "video";

export interface MediaItem {
    url: string;
    type: MediaType;
    alt?: string;
}

const isVideo = (url: string) => {
    if (!url) return false;
    const extensionMatch = url.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
    if (extensionMatch) return true;

    // Specific Cloudinary video check
    const isCloudinaryVideo = url.includes("cloudinary.com") && url.includes("/video/upload/");
    const isExternalVideo = url.includes("vimeo.com") || url.includes("youtube.com") || url.includes("youtu.be");

    return !!(isCloudinaryVideo || isExternalVideo);
};

interface MediaSliderProps {
    media: MediaItem[];
    interval?: number;
    className?: string;
    objectFit?: "cover" | "contain";
    overlay?: boolean;
}

export function MediaSlider({
    media = [],
    interval = 6000,
    className,
    objectFit = "cover",
    overlay = false
}: MediaSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);

    // Filter out invalid media
    const validMedia = media.filter(item => item.url);

    useEffect(() => {
        if (validMedia.length <= 1) {
            setCurrentIndex(0);
            return;
        }

        const currentItem = validMedia[currentIndex];
        const isCurrentVideo = currentItem?.type === "video" || (currentItem?.url && isVideo(currentItem.url));

        // If it's a video, we rely on the onEnded event of the video element
        if (isCurrentVideo) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % validMedia.length);
        }, interval);

        return () => clearTimeout(timer);
    }, [currentIndex, validMedia, interval]);

    // Safety: Reset index if it goes out of bounds (e.g. during real-time updates)
    useEffect(() => {
        if (currentIndex >= validMedia.length && validMedia.length > 0) {
            setCurrentIndex(0);
        }
    }, [validMedia.length, currentIndex]);

    if (validMedia.length === 0) {
        return <div className={cn("w-full h-full bg-zinc-900", className)} />;
    }

    return (
        <div className={cn("relative overflow-hidden w-full", className)}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full"
                >
                    {(() => {
                        const currentItem = validMedia[currentIndex];
                        if (!currentItem) return null;

                        return currentItem.type === "video" || isVideo(currentItem.url) ? (
                            <video
                                src={currentItem.url}
                                autoPlay
                                muted
                                loop={validMedia.length === 1}
                                playsInline
                                onEnded={() => {
                                    if (validMedia.length > 1) {
                                        setCurrentIndex((prev) => (prev + 1) % validMedia.length);
                                    }
                                }}
                                className="w-full h-auto max-h-[80vh] object-contain rounded-[2rem]"
                            />
                        ) : (
                            <div className="relative w-full h-auto">
                                <img
                                    src={currentItem.url}
                                    alt={currentItem.alt || "Slider Image"}
                                    onError={(e) => {
                                        e.currentTarget.src = "/placeholder.jpg";
                                        e.currentTarget.onerror = null; // Prevent infinite loop
                                    }}
                                    className="w-full h-auto max-h-[80vh] object-contain rounded-[2rem]"
                                />
                            </div>
                        );
                    })()}
                </motion.div>
            </AnimatePresence>

            {overlay && <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-[2rem]" />}

            {/* Dots */}
            {validMedia.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {validMedia.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all",
                                idx === currentIndex ? "bg-white w-4" : "bg-white/30 hover:bg-white/60"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
