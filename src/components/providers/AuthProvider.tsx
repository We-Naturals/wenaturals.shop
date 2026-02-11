"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    return (
        <AuthContext.Provider value={{ user, session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
