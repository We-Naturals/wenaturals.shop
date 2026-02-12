import React, { memo } from 'react';
import { AlignLeft, Type, Eye, EyeOff, Trash2, Navigation } from "lucide-react";
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { cn } from "@/lib/utils";

interface NavigationBuilderProps {
    activeTab: 'header' | 'footer' | 'nav';
}

export const NavigationBuilder = memo(({ activeTab }: NavigationBuilderProps) => {
    const {
        cmsData,
        updateField,
        deepUpdateField,
        addNavItem,
        updateNavItem,
        removeNavItem
    } = useThemeEditorStore();

    if (!cmsData) return null;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* GLOBAL HEADER HEADER */}
            {activeTab === "header" && (
                <>
                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <AlignLeft className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Logo & Identity</h3>
                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate your brand's global entry point and navigation assets.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Navbar Logo URL</label>
                            <input
                                value={cmsData.content_global.navbar?.logo_url || ''}
                                onChange={(e) => updateField('content_global', 'navbar', { ...cmsData.content_global.navbar, logo_url: e.target.value })}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                placeholder="/logo.png"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Quick Links</label>
                            {cmsData.content_global.navbar?.links?.map((link: any, i: number) => (
                                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                    <input
                                        value={link.label}
                                        onChange={(e) => {
                                            const newLinks = [...cmsData.content_global.navbar.links];
                                            newLinks[i].label = e.target.value;
                                            updateField('content_global', 'navbar', { ...cmsData.content_global.navbar, links: newLinks });
                                        }}
                                        className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                        placeholder="Label"
                                    />
                                    <input
                                        value={link.href}
                                        onChange={(e) => {
                                            const newLinks = [...cmsData.content_global.navbar.links];
                                            newLinks[i].href = e.target.value;
                                            updateField('content_global', 'navbar', { ...cmsData.content_global.navbar, links: newLinks });
                                        }}
                                        className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                        placeholder="Link"
                                    />
                                    <button
                                        onClick={() => {
                                            const newLinks = [...cmsData.content_global.navbar.links];
                                            newLinks[i].visible = newLinks[i].visible === false ? true : false;
                                            updateField('content_global', 'navbar', { ...cmsData.content_global.navbar, links: newLinks });
                                        }}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            link.visible !== false ? "text-blue-400 bg-blue-400/10" : "text-zinc-600 hover:bg-white/5"
                                        )}
                                        title={link.visible !== false ? "Visible" : "Hidden"}
                                    >
                                        {link.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* MAIN MENU BUILDER */}
            {activeTab === "nav" && (
                <>
                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                            <Navigation className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Menu Builder</h3>
                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate the primary and secondary navigation paths for your visitors.</p>
                        </div>
                    </div>

                    {/* Header Menu */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Header Navigation</label>
                            <button onClick={() => addNavItem('header')} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors">
                                + Add Link
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(cmsData.content_navigation?.header || []).map((item: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center bg-zinc-900/30 p-2 rounded-lg border border-white/5">
                                    <span className="text-zinc-500 font-mono text-xs w-6">{i + 1}.</span>
                                    <input
                                        value={item.label}
                                        onChange={(e) => updateNavItem('header', i, 'label', e.target.value)}
                                        placeholder="Label"
                                        className="flex-1 bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-white"
                                    />
                                    <input
                                        value={item.href}
                                        onChange={(e) => updateNavItem('header', i, 'href', e.target.value)}
                                        placeholder="URL / Path"
                                        className="flex-1 bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-zinc-400 font-mono"
                                    />
                                    <button onClick={() => removeNavItem('header', i)} className="text-zinc-600 hover:text-red-400 p-1">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {(cmsData.content_navigation?.header || []).length === 0 && (
                                <div className="text-center py-4 text-zinc-600 text-xs italic">No links in header</div>
                            )}
                        </div>
                    </div>

                    {/* Footer Menu */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Footer Menu</h3>
                            <button onClick={() => addNavItem('footer')} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors">
                                + Add Link
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(cmsData.content_navigation?.footer || []).map((item: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center bg-zinc-900/30 p-2 rounded-lg border border-white/5">
                                    <span className="text-zinc-500 font-mono text-xs w-6">{i + 1}.</span>
                                    <input
                                        value={item.label}
                                        onChange={(e) => updateNavItem('footer', i, 'label', e.target.value)}
                                        placeholder="Label"
                                        className="flex-1 bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-white"
                                    />
                                    <input
                                        value={item.href}
                                        onChange={(e) => updateNavItem('footer', i, 'href', e.target.value)}
                                        placeholder="URL / Path"
                                        className="flex-1 bg-transparent border-b border-white/10 text-xs px-2 py-1 focus:border-blue-500 outline-none text-zinc-400 font-mono"
                                    />
                                    <button onClick={() => removeNavItem('footer', i)} className="text-zinc-600 hover:text-red-400 p-1">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {(cmsData.content_navigation?.footer || []).length === 0 && (
                                <div className="text-center py-4 text-zinc-600 text-xs italic">No links in footer</div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* GLOBAL FOOTER INFO */}
            {activeTab === "footer" && (
                <>
                    <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                            <Type className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Footer Info</h3>
                            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Manage the global footer content, newsletter, and legal copyright.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Footer Logo URL</label>
                            <input
                                value={cmsData.content_global.footer?.logo_url || ''}
                                onChange={(e) => deepUpdateField('content_global', 'footer', 'logo_url', e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                placeholder="/logo.png"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Newsletter Title</label>
                                <button
                                    onClick={() => deepUpdateField('content_global', 'footer', 'newsletter_visible', cmsData.content_global.footer?.newsletter_visible === false ? true : false)}
                                    className={cn("p-0.5 rounded transition-colors", cmsData.content_global.footer?.newsletter_visible !== false ? "text-blue-400" : "text-zinc-600")}
                                    title={cmsData.content_global.footer?.newsletter_visible !== false ? "Visible" : "Hidden"}
                                >
                                    {cmsData.content_global.footer?.newsletter_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            <input
                                value={cmsData.content_global.footer?.newsletter_title || ''}
                                onChange={(e) => deepUpdateField('content_global', 'footer', 'newsletter_title', e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Newsletter Text</label>
                            <textarea
                                value={cmsData.content_global.footer?.newsletter_text || ''}
                                onChange={(e) => deepUpdateField('content_global', 'footer', 'newsletter_text', e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs h-24 resize-none text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Copyright Text</label>
                            <input
                                value={cmsData.content_global.footer?.copyright_text || ''}
                                onChange={(e) => deepUpdateField('content_global', 'footer', 'copyright_text', e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
});
