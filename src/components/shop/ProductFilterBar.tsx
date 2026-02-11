"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    onSearchChange: (query: string) => void;
}

export function ProductFilterBar({ categories, activeCategory, onCategoryChange, onSearchChange }: FilterBarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, onSearchChange]);

    return (
        <div className="mb-12 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Categories */}
                <div className="flex flex-nowrap overflow-x-auto pb-2 -mb-2 md:pb-0 md:mb-0 md:flex-wrap gap-2 no-scrollbar scroll-smooth">
                    <button
                        onClick={() => onCategoryChange("All")}
                        className={cn(
                            "px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                            activeCategory === "All"
                                ? "bg-white text-black"
                                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-transparent dark:border-white/5"
                        )}
                    >
                        All Rituals
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange(cat)}
                            className={cn(
                                "px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                activeCategory === cat
                                    ? "bg-white text-black"
                                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-transparent dark:border-white/5"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search elixirs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
}
