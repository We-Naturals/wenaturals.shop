"use client";

import { useEffect, useRef, useState } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SearchResult, SearchService } from '@/services/SearchService';
import Link from 'next/link';
import { PrefetchLink } from '../ui/PrefetchLink';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setQuery('');
            setResults([]);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const data = await SearchService.search(query);
                    setResults(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onKeyDown={handleKeyDown}
            >
                {/* Header / Input */}
                <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products, collections, articles..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-zinc-600 h-10"
                        autoComplete="off"
                    />
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                    ) : (
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono border border-zinc-700 rounded bg-zinc-800 text-zinc-400">ESC</kbd>
                            <X className="sm:hidden w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Results */}
                {(results.length > 0 || query.length >= 2) && (
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {results.length === 0 && query.length >= 2 && !isLoading ? (
                            <div className="text-center py-8 text-zinc-500">
                                <p>No results found for "{query}"</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {results.map((result) => (
                                    <PrefetchLink
                                        key={result.id}
                                        href={result.type === 'product' ? `/shop/${result.slug}` : `/journal/${result.slug}`}
                                        slug={result.type === 'product' ? result.slug : undefined}
                                        onClick={onClose}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 group transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                                            {result.image ? (
                                                <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                    <Search className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-white">
                                                    {result.title}
                                                </h4>
                                                <span className="text-[10px] uppercase tracking-wider text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                                    {result.type}
                                                </span>
                                            </div>
                                            {result.type === 'product' && result.price && (
                                                <p className="text-sm text-zinc-400 mt-0.5">${result.price.toFixed(2)}</p>
                                            )}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </PrefetchLink>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="px-4 py-2 border-t border-white/5 bg-zinc-950/50 text-[10px] text-zinc-600 flex justify-between items-center">
                    <span>Search powered by semantic matching</span>
                    <div className="flex gap-2">
                        <span>Press <kbd className="font-sans font-semibold">↵</kbd> to select</span>
                        <span><kbd className="font-sans font-semibold">↑↓</kbd> to navigate</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
