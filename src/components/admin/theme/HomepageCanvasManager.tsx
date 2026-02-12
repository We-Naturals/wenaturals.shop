import React, { memo } from 'react';
import { ListOrdered, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
    hero: 'Hero Banner',
    marquee_top: 'Top Marquee',
    categories: 'Product Categories',
    featured: 'Featured Collection',
    shorts: 'YouTube Shorts',
    philosophy: 'Brand Philosophy',
    rituals: 'Customer Rituals',
    journal: 'Recent Journal',
    marquee_bottom: 'Bottom Marquee'
};

export const HomepageCanvasManager = memo(() => {
    const { cmsData, moveSection, toggleSectionVisibility } = useThemeEditorStore();

    if (!cmsData) return null;

    const getSectionVisibility = (sectionKey: string) => {
        // Special mapping for different content structures
        if (sectionKey === 'hero') return cmsData.content_homepage?.hero?.visible !== false;

        const contentKeyMapping: Record<string, string> = {
            philosophy: 'content_philosophy',
            rituals: 'content_testimonials',
            shorts: 'youtube_shorts',
            featured: 'content_featured',
            journal: 'content_journal',
            categories: 'content_categories',
            marquee_top: 'content_marquee_top',
            marquee_bottom: 'content_marquee_bottom'
        };

        const contentKey = contentKeyMapping[sectionKey];
        if (!contentKey) return true;
        return cmsData[contentKey]?.visible !== false;
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <ListOrdered className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Section Order</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Drag and reorder the visual sequence of your homepage sections.</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Active Sequence</h3>
                <div className="space-y-2">
                    {(cmsData.homepage_layout || []).map((sectionKey: string, i: number) => {
                        const isVisible = getSectionVisibility(sectionKey);
                        return (
                            <div key={sectionKey} className={cn(
                                "flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border transition-colors group",
                                isVisible ? "border-white/5 hover:border-white/10" : "border-red-500/20 bg-red-500/5 opacity-60"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-[10px] text-zinc-500 font-mono">
                                        {i + 1}
                                    </div>
                                    <span className={cn("text-sm font-medium", isVisible ? "text-zinc-300" : "text-zinc-500 line-through")}>
                                        {SECTION_LABELS[sectionKey] || sectionKey}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleSectionVisibility(sectionKey)}
                                        className={cn(
                                            "p-1.5 rounded-md transition-all",
                                            isVisible ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5"
                                        )}
                                        title={isVisible ? "Visible" : "Hidden"}
                                    >
                                        {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-white/5">
                                        <button
                                            onClick={() => moveSection(i, 'up')}
                                            disabled={i === 0}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-all hover:text-blue-400"
                                        >
                                            <ChevronDown className="w-4 h-4 rotate-180" />
                                        </button>
                                        <button
                                            onClick={() => moveSection(i, 'down')}
                                            disabled={i === (cmsData.homepage_layout?.length || 0) - 1}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-all hover:text-blue-400"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-[10px] text-zinc-500 italic max-w-xs">
                    Note: The "Hero" section is usually best kept at the top.
                </p>
            </div>
        </div>
    );
});
