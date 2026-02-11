"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Loader2, Mail, Lock, ArrowRight, User } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        // const name = formData.get("name") as string; // Only for signup if we want to save metadata

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/"); // Redirect to home on success
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    // options: { data: { full_name: name } }
                });
                if (error) throw error;
                setError("Check your email for the confirmation link.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-24">
            <SpotlightCard className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                            {isLogin ? "Welcome Back" : "Join the Ritual"}
                        </h1>
                        <p className="text-white/60">
                            {isLogin
                                ? "Sign in to access your curated collection."
                                : "Create an account to start your journey."}
                        </p>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        onClick={async () => {
                            await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`,
                                },
                            });
                        }}
                        className="w-full py-3 px-4 bg-white text-black font-bold rounded-lg shadow-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 mb-6"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Continue with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-zinc-500">Or continue with email</span>
                        </div>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="hello@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "Sign In" : "Create Account"}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-white/40 hover:text-white text-sm transition-colors"
                        >
                            {isLogin ? (
                                <>
                                    Don't have an account? <span className="text-blue-400 hover:underline">Sign up</span>
                                </>
                            ) : (
                                <>
                                    Already have an account? <span className="text-blue-400 hover:underline">Sign in</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </SpotlightCard>
        </div>
    );
}
