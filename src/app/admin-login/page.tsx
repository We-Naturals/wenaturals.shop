"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Loader2, ShieldCheck, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            // 1. Authenticate
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            if (!user) throw new Error("Authentication failed");

            // 2. Authorization Check (Double Check Client-Side)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                await supabase.auth.signOut(); // Force logout
                throw new Error("Access Denied: You do not have administrator privileges.");
            }

            // 3. Success
            router.push("/admin");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
            <div className="absolute inset-0 bg-black/80 radial-gradient" />

            <SpotlightCard className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border-zinc-800 shadow-2xl relative z-10">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4 border border-zinc-700">
                            <ShieldCheck className="w-6 h-6 text-zinc-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            Command Center
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Restricted Access Area. Authorized Personnel Only.
                        </p>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Admin Identity</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="admin@wenaturals.com"
                                    className="w-full bg-black/40 border border-zinc-800 rounded-lg px-10 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Secure Passkey</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-black/40 border border-zinc-800 rounded-lg px-10 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all font-mono text-sm"
                                />
                                {/* Password Toggle Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors z-20 p-2"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-xs text-center bg-red-950/30 border border-red-900/50 rounded p-3 font-mono"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-white text-black font-bold rounded-lg shadow-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Authenticate
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-zinc-800/50 text-center">
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
                            System Secured by Supabase RBAC
                        </p>
                    </div>
                </div>
            </SpotlightCard>
        </div>
    );
}
