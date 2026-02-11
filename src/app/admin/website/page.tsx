"use client";

import Link from "next/link";
import { Link as LinkIcon, Palette } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function WebsiteDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Website Management</h1>
                <p className="text-zinc-500 text-sm mt-1">Manage external links and homepage content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/website/links" className="group">
                    <GlassCard className="h-full p-8 border-white/5 hover:bg-white/5 transition-all flex flex-col items-center justify-center text-center gap-4 group-hover:scale-[1.02]">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <LinkIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Links Manager</h3>
                            <p className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Update social media, marketplaces, and YouTube Shorts.</p>
                        </div>
                    </GlassCard>
                </Link>

                <Link href="/admin/website/theme" className="group">
                    <GlassCard className="h-full p-8 border-white/5 hover:bg-white/5 transition-all flex flex-col items-center justify-center text-center gap-4 group-hover:scale-[1.02]">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <Palette className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Theme Editor</h3>
                            <p className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Customize website colors, fonts, and layout settings.</p>
                        </div>
                    </GlassCard>
                </Link>
            </div>
        </div>
    );
}
