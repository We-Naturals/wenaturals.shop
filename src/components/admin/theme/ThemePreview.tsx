import React, { memo, useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface ThemePreviewProps {
    activeView: 'edit' | 'preview';
    previewMode: 'desktop' | 'mobile';
    refreshKey: number;
}

export const ThemePreview = memo(({ activeView, previewMode, refreshKey }: ThemePreviewProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleIframeLoad = () => {
        // Post-load logic if needed
    };

    return (
        <div className={cn(
            "flex-1 bg-[#050505] lg:border-l border-white/10 flex flex-col overflow-hidden relative shadow-2xl transition-all duration-300",
            activeView === "edit" ? "hidden lg:flex" : "flex"
        )}>
            <div className="h-10 bg-[#0A0A0A] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="bg-black/50 px-4 py-1 rounded-lg text-[10px] text-zinc-600 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        wenaturals.shop
                    </div>
                </div>
            </div>
            <div className={`flex-1 flex justify-center bg-zinc-900 overflow-hidden transition-all duration-500 relative`}>
                <iframe
                    ref={iframeRef}
                    src={`/?admin_preview=true&refresh=${refreshKey}`}
                    onLoad={handleIframeLoad}
                    className={`h-full border-none shadow-2xl transition-all duration-500 bg-black ${previewMode === 'mobile' ? 'w-[375px] my-4 rounded-[2rem] border-4 border-zinc-800' : 'w-full'}`}
                    title="Live Preview"
                />
            </div>
        </div>
    );
});
