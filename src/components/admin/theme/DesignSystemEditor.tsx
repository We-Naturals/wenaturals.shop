import React, { memo } from 'react';
import { Palette, Type } from "lucide-react";
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { cn } from "@/lib/utils";

export const DesignSystemEditor = memo(() => {
    const { cmsData, updateField } = useThemeEditorStore();

    if (!cmsData) return null;

    const updateDesignSystem = (key: string, value: any) => {
        updateField('content_design_system', key, value);
    };

    const designData = cmsData.content_design_system || {};

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                    <Palette className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Design System</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Fine-tune the visual DNA of your digital atelier.</p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Global Palette</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Primary Accent</label>
                        <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/5">
                            <input
                                type="color"
                                value={designData.primary_color || '#3b82f6'}
                                onChange={(e) => updateDesignSystem('primary_color', e.target.value)}
                                className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                            />
                            <div className="text-[10px] font-mono text-zinc-400 uppercase">
                                {designData.primary_color || '#3b82f6'}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Secondary Accent</label>
                        <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/5">
                            <input
                                type="color"
                                value={designData.secondary_color || '#10b981'}
                                onChange={(e) => updateDesignSystem('secondary_color', e.target.value)}
                                className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                            />
                            <div className="text-[10px] font-mono text-zinc-400 uppercase">
                                {designData.secondary_color || '#10b981'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Typography Engine */}
            <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Typography Engine</h3>
                    <Type className="w-3.5 h-3.5 text-zinc-600" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Heading Font</label>
                        <select
                            value={designData.heading_font || 'Outfit'}
                            onChange={(e) => updateDesignSystem('heading_font', e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                        >
                            <option value="Outfit">Outfit (Modern)</option>
                            <option value="Inter">Inter (Swiss)</option>
                            <option value="Playfair Display">Playfair (Elegant)</option>
                            <option value="Cormorant Garamond">Cormorant (Classical)</option>
                            <option value="JetBrains Mono">JetBrains (Technical)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Geometry */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Geometry</h3>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Corner Roundness</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['0px', '0.5rem', '0.75rem', '1.5rem', '9999px'].map((radius, i) => {
                            const labels = ['Sharp', 'Small', 'Medium', 'Large', 'Full'];
                            return (
                                <button
                                    key={radius}
                                    onClick={() => updateDesignSystem('border_radius', radius)}
                                    className={cn(
                                        "p-2 text-xs border rounded-lg transition-all",
                                        designData.border_radius === radius
                                            ? "bg-white text-black border-white"
                                            : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600"
                                    )}
                                >
                                    {labels[i]}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
});
