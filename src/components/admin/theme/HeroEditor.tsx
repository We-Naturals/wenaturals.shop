import React, { memo } from 'react';
import { Home, Eye, EyeOff } from "lucide-react";
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { MediaListEditor } from "@/components/admin/MediaListEditor";
import { cn } from "@/lib/utils";

export const HeroEditor = memo(() => {
    const { cmsData, updateField, deepUpdateField, toggleSectionVisibility } = useThemeEditorStore();

    if (!cmsData) return null;

    const hero = cmsData.content_homepage?.hero || {};
    const marquee = cmsData.content_homepage?.marquee || {};

    const updateHeroField = (field: string, value: any) => {
        deepUpdateField('content_homepage', 'hero', field, value);
    };

    const updateMarqueeField = (field: string, value: any) => {
        deepUpdateField('content_homepage', 'marquee', field, value);
    };

    const toggleHeroVisibility = () => {
        updateField('content_homepage', 'visible', cmsData.content_homepage?.visible !== false ? false : true);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <Home className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Hero Banner</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate the first contact and primary value proposition for your brand.</p>
                </div>
            </div>

            {/* Hero Section Content */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Hero Section Content</h3>
                    <button
                        onClick={toggleHeroVisibility}
                        className={cn("p-1 rounded-md transition-colors", cmsData.content_homepage?.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                    >
                        {cmsData.content_homepage?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Title Part 1</label>
                            <input
                                value={hero.title_part_1 || ''}
                                onChange={(e) => updateHeroField('title_part_1', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Part 2 (Gradient)</label>
                            <input
                                value={hero.title_part_2 || ''}
                                onChange={(e) => updateHeroField('title_part_2', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Subtext</label>
                        <textarea
                            value={hero.subtext || ''}
                            onChange={(e) => updateHeroField('subtext', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs h-20 resize-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4">
                        <MediaListEditor
                            label="Main Hero Visuals (Auto-Rotation)"
                            media={hero.media || []}
                            onChange={(newMedia) => updateHeroField('media', newMedia)}
                        />
                    </div>
                </div>
            </div>

            {/* Marquee */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">Marquee</h3>
                    <button
                        onClick={() => updateMarqueeField('visible', marquee.visible !== false ? false : true)}
                        className={cn("p-1 rounded-md transition-colors", marquee.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                    >
                        {marquee.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Marquee Text</label>
                        <input
                            value={marquee.text || ''}
                            onChange={(e) => updateMarqueeField('text', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold text-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
