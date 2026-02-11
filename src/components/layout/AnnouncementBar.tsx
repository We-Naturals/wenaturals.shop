"use client";

import { useContent } from "@/hooks/useContent";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function AnnouncementBar() {
    const content = useContent('content_marketing');
    const { enabled, text, link, color, dismissible } = content?.announcement_bar || {};
    const [isVisible, setIsVisible] = useState(true);

    if (!enabled || !isVisible || !text) return null;

    return (
        <div
            style={{ backgroundColor: color || '#000000' }}
            className="w-full text-white px-4 py-2 relative z-50 flex items-center justify-center text-xs font-medium tracking-wide transition-all duration-300"
        >
            <div className="flex items-center gap-2">
                <span>{text}</span>
                {link && (
                    <Link href={link} className="flex items-center gap-1 hover:underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all">
                        Shop Now <ArrowRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            {dismissible && (
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
