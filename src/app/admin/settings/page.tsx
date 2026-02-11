"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { GlassCard } from "@/components/ui/GlassCard";
import { Settings, Shield, Mail, Bell, Globe, Database, Save, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    // Mock Settings State
    const [settings, setSettings] = useState({
        storeName: "We Naturals",
        supportEmail: "support@wenaturals.com",
        currency: "USD",
        maintenanceMode: false
    });

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        alert("Settings saved successfully (Simulation).");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading configuration...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold">System Configuration</h1>
                <p className="text-zinc-500 mt-1">Manage global store settings and administrative access.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Account */}
                <div className="space-y-6">
                    <GlassCard className="p-6 space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                            <Shield className="w-5 h-5 text-purple-400" />
                            <h2 className="font-bold">Admin Profile</h2>
                        </div>

                        <div className="flex flex-col items-center text-center py-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-xl mb-4">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <h3 className="font-bold text-lg">{user?.email}</h3>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full mt-2 border border-purple-500/20">
                                MASTER ALCHEMIST
                            </span>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">User ID</span>
                                <span className="font-mono text-xs opacity-50">{user?.id.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Last Sign In</span>
                                <span className="text-xs opacity-50">
                                    {new Date(user?.last_sign_in_at || "").toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </GlassCard>

                    <GlassCard className="p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                            <Database className="w-5 h-5 text-blue-400" />
                            <h2 className="font-bold">System Status</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium text-green-400">Database Connected</span>
                                </div>
                                <span className="text-xs text-green-500/50">12ms</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span className="text-sm font-medium text-blue-400">Storage Active</span>
                                </div>
                                <span className="text-xs text-blue-500/50">Cloudinary</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: Store Settings Form */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-6 md:p-8 space-y-8 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-zinc-400" />
                                <h2 className="font-bold text-xl">Storefront Settings</h2>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Store Name</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="text"
                                            value={settings.storeName}
                                            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Support Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={settings.supportEmail}
                                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <h3 className="text-sm font-bold text-zinc-400">Regional Preferences</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Currency</label>
                                        <select
                                            value={settings.currency}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer hover:bg-black/30"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="INR">INR (₹)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2"> {/* Spacer or Timezone */}  </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <h3 className="text-sm font-bold text-zinc-400">Store Status</h3>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <h4 className="font-bold text-sm">Maintenance Mode</h4>
                                        <p className="text-xs text-zinc-500">Temporarily disable the storefront for customers.</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-blue-500' : 'bg-zinc-700'}`}
                                    >
                                        <motion.div
                                            animate={{ x: settings.maintenanceMode ? 24 : 0 }}
                                            className="w-4 h-4 bg-white rounded-full shadow-md"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* NEW: Create Admin Section from User Request */}
                    <GlassCard className="p-6 md:p-8 mt-8 space-y-6">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-400" />
                            <h2 className="font-bold text-xl">Grant Access</h2>
                        </div>
                        <p className="text-zinc-500 text-sm">
                            Create a new administrator account with full system privileges.
                        </p>

                        <AdminCreationForm />
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

// Sub-component for form to keep main clean
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAdminUser } from "@/app/actions/createAdmin";

function AdminCreationForm() {
    const initialState = { message: "", error: false };
    const [state, formAction] = useActionState(createAdminUser, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" required placeholder="Admin Name" className="bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none" />
                <input name="email" required type="email" placeholder="Admin Email" className="bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none" />
            </div>
            <input name="password" required type="password" placeholder="Secure Password" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none" />

            <SubmitButton />

            {state.message && (
                <p className={`text-xs mt-2 ${state.error ? "text-red-400" : "text-green-400"}`}>
                    {state.message}
                </p>
            )}
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-purple-500 text-white rounded-lg font-bold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
            {pending ? "Forging Identity..." : "Create Administrator"}
        </button>
    );
}
