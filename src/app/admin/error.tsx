"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
            <GlassCard className="max-w-md w-full p-8 text-center space-y-6 border-red-500/20 bg-red-500/5">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">System Malfunction</h2>
                    <p className="text-zinc-400 text-sm">
                        The administrative interface encountered a critical error.
                        This is likely due to a database connection issue or unauthorized access attempt.
                    </p>
                </div>

                <div className="p-4 bg-black/20 rounded-xl text-left font-mono text-xs text-red-400 overflow-x-auto">
                    {error.message || "Unknown Error"}
                    {error.digest && <span className="block mt-1 opacity-50">Digest: {error.digest}</span>}
                </div>

                <button
                    onClick={reset}
                    className="w-full py-3 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Reset Interface
                </button>
            </GlassCard>
        </div>
    );
}
