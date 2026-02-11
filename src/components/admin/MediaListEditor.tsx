"use client";

import { useState } from "react";
import { X, Plus, GripVertical, Image as ImageIcon, Link as LinkIcon, Edit2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface MediaItem {
    url: string;
    alt: string;
    caption?: string;
}

const isVideo = (url: string) => {
    if (!url) return false;
    const extensionMatch = url.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
    if (extensionMatch) return true;

    const isCloudinaryVideo = url.includes("cloudinary.com") && url.includes("/video/upload/");
    const isExternalVideo = url.includes("vimeo.com") || url.includes("youtube.com") || url.includes("youtu.be");

    return !!(isCloudinaryVideo || isExternalVideo);
};

interface MediaListEditorProps {
    label?: string;
    media: MediaItem[];
    onChange: (value: MediaItem[]) => void;
}

export function MediaListEditor({ label, media = [], onChange }: MediaListEditorProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const addItem = () => {
        const newItem: MediaItem = { url: "", alt: "", caption: "" };
        onChange([...media, newItem]);
        setEditingIndex(media.length);
    };

    const removeItem = (index: number) => {
        onChange(media.filter((_, i) => i !== index));
        if (editingIndex === index) setEditingIndex(null);
    };

    const updateItem = (index: number, updates: Partial<MediaItem>) => {
        onChange(media.map((item, i) => i === index ? { ...item, ...updates } : item));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">{label || "Media Collection"}</h3>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-tighter mt-0.5">Manage gallery assets and cinematic sequences.</p>
                </div>
                <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 glass rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                </button>
            </div>

            <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                    {media.map((item, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative glass rounded-xl border-white/5 overflow-hidden flex items-center gap-4 p-3 hover:bg-white/[0.02] transition-all"
                        >
                            <div className="w-12 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-white/5">
                                {item.url ? (
                                    isVideo(item.url) ? (
                                        <video src={item.url} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <Image src={item.url} alt={item.alt} fill className="object-cover" />
                                    )
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[8px] text-zinc-600 font-bold uppercase text-center">No Imagery</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                {editingIndex === index ? (
                                    <div className="space-y-2 py-1">
                                        <input
                                            value={item.url}
                                            onChange={(e) => updateItem(index, { url: e.target.value })}
                                            placeholder="Asset URL (https://...)"
                                            className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 px-3 text-[10px] outline-none focus:border-blue-500/50 transition-all font-mono"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                value={item.alt}
                                                onChange={(e) => updateItem(index, { alt: e.target.value })}
                                                placeholder="Alt Text"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-md py-1.5 px-3 text-[10px] outline-none"
                                            />
                                            <button
                                                onClick={() => setEditingIndex(null)}
                                                className="px-3 bg-white text-black rounded-md text-[8px] font-black uppercase"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="cursor-pointer" onClick={() => setEditingIndex(index)}>
                                        <p className="text-[10px] font-bold text-zinc-300 truncate tracking-wide">
                                            {item.alt || "Untitled Asset"}
                                        </p>
                                        <p className="text-[9px] text-zinc-500 font-mono truncate mt-0.5 opacity-60">
                                            {item.url || "No URL provided"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <button
                                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => removeItem(index)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {media.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center opacity-20">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Collection Empty</p>
                    </div>
                )}
            </div>
        </div>
    );
}
