"use client";

import { useState } from "react";
import { X, Plus, Image as ImageIcon, Video, Link as LinkIcon, Upload } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov|m4v)$/i) || (url.includes("cloudinary.com") && url.includes("/video/upload/"));
};

interface MediaManagerProps {
    media: string[];
    onChange: (media: string[]) => void;
}

export function MediaManager({ media, onChange }: MediaManagerProps) {
    const [url, setUrl] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);

    const addMedia = (newUrl: string) => {
        if (!newUrl) return;
        onChange([...media, newUrl]);
        setUrl("");
        setShowUrlInput(false);
    };

    const removeMedia = (index: number) => {
        onChange(media.filter((_, i) => i !== index));
    };

    const openCloudinaryWidget = () => {
        if (!(window as any).cloudinary) {
            alert("Cloudinary script not loaded yet. Please try again.");
            return;
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset || cloudName === "your_cloud_name_here" || uploadPreset === "your_upload_preset_here") {
            alert("Cloudinary configuration missing! Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file.");
            return;
        }

        const widget = (window as any).cloudinary.createUploadWidget(
            {
                cloudName,
                uploadPreset,
                sources: ["local", "url", "camera", "instagram"],
                multiple: true,
                resourceType: "auto",
                clientAllowedFormats: ["image", "video"],
                maxFileSize: 10000000, // 10MB
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    addMedia(result.info.secure_url);
                }
            }
        );

        widget.open();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest">Product Imagery</h3>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tight">Manage showcase visuals and cinematic captures.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="p-2 glass rounded-lg hover:bg-white/5 transition-all text-zinc-400 hover:text-white"
                        title="Add from URL"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={openCloudinaryWidget}
                        className="p-2 glass rounded-lg hover:bg-white/5 transition-all text-zinc-400 hover:text-white"
                        title="Upload via Cloudinary"
                    >
                        <Upload className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showUrlInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex gap-2 p-2 glass rounded-xl border-white/5 bg-white/[0.02]">
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste image or video URL..."
                                className="flex-1 bg-transparent border-none outline-none text-xs px-2"
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMedia(url))}
                            />
                            <button
                                type="button"
                                onClick={() => addMedia(url)}
                                className="px-4 py-2 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                    {media.map((item, index) => (
                        <motion.div
                            key={item + index}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative aspect-[3/4] rounded-xl overflow-hidden glass border-white/10 group"
                        >
                            {isVideo(item) ? (
                                <video src={item} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                            ) : (
                                <Image src={item} alt="Media" fill className="object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeMedia(index)}
                                    className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-0.5 glass rounded-md text-[8px] font-bold uppercase tracking-widest">
                                {index === 0 ? "Cover" : `Media ${index + 1}`}
                            </div>
                        </motion.div>
                    ))}
                    <button
                        type="button"
                        onClick={openCloudinaryWidget}
                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className="p-3 glass rounded-full group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white">Add Imagery</span>
                    </button>
                </AnimatePresence>
            </div>
        </div>
    );
}
