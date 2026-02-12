"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Package, MapPin, User, LogOut, Loader2 } from "lucide-react"; // Added Loader2
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deleteAddressAction } from "@/app/actions/addresses";

export default function AccountPage() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/");
                return;
            }
            setUser(user);

            // Fetch Orders
            const { data: userOrders } = await supabase
                .from('orders')
                .select('*, items:order_items(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (userOrders) setOrders(userOrders);

            // Fetch Addresses
            const { data: userAddresses } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id); // No need to filter by user_id if RLS handles it, but good for clarity

            if (userAddresses) setAddresses(userAddresses);

            setLoading(false);
        };

        fetchData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm("Remove this location from your sanctuary?")) return;
        try {
            await deleteAddressAction(id);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to remove address");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-mesh flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
    );

    return (
        <main className="min-h-screen bg-mesh pt-20 md:pt-32 pb-12 px-4 md:px-6">
            <Navbar />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Your Sanctuary</h1>
                        <p className="text-zinc-400">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Orders */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-blue-400" />
                            <h2 className="text-xl font-bold">Ritual History</h2>
                        </div>

                        {orders.length === 0 ? (
                            <GlassCard className="p-8 text-center space-y-4">
                                <p className="text-zinc-500">No rituals performed yet.</p>
                            </GlassCard>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <GlassCard key={order.id} className="p-6 space-y-4 group hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Order ID: {order.id.slice(0, 8)}...</p>
                                                <p className="text-sm text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10'
                                                }`}>
                                                {order.status}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span>{item.quantity}x {item.product_name}</span>
                                                    <span className="text-zinc-400">${item.price_at_purchase}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-white/10 flex justify-between font-bold">
                                            <span>Total Essence</span>
                                            <span className="text-gradient">₹{order.total_amount}</span>
                                        </div>

                                        {order.shipping_address && (
                                            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Shipment Destination</p>
                                                <p className="text-xs text-zinc-300 font-medium">{order.shipping_address.street}</p>
                                                <p className="text-[10px] text-zinc-500">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                                            </div>
                                        )}
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Address Book */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-purple-400" />
                            <h2 className="text-xl font-bold">Sacred Locations</h2>
                        </div>

                        <div className="space-y-4">
                            {addresses.map((addr) => (
                                <GlassCard key={addr.id} className="p-6 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-sm">{addr.name}</h3>
                                        <div className="flex items-center gap-2">
                                            {addr.is_default && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400">{addr.street}</p>
                                    <p className="text-xs text-zinc-400">{addr.city}, {addr.state} {addr.pincode}</p>
                                    <p className="text-xs text-zinc-400 font-mono">{addr.phone}</p>
                                </GlassCard>
                            ))}

                            {/* Allow adding address? Maybe later. For now checkout drives this. */}
                            {addresses.length === 0 && (
                                <p className="text-sm text-zinc-500 italic">Addresses are saved automatically when you complete a checkout.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
