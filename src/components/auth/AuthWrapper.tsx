"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { GlassCard } from "../ui/GlassCard";
import { motion } from "framer-motion";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoading(false);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/checkout`,
            },
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-mesh flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-mesh flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="p-8 max-w-md w-full text-center space-y-6">
                        <h1 className="text-3xl font-bold">Sanctuary Access</h1>
                        <p className="text-zinc-500">
                            To preserve the sanctity of your ritual history, please sign in to complete your purchase.
                        </p>

                        <button
                            onClick={handleLogin}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Continue with Google
                        </button>

                        <p className="text-xs text-zinc-600 uppercase tracking-widest pt-4">
                            We honor your privacy.
                        </p>
                    </GlassCard>
                </motion.div>
            </main>
        );
    }

    return <>{children}</>;
}
