"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Package, MapPin, LogOut, Loader2, Trash2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteAddressAction } from "@/app/actions/addresses";
import { OrderTracker } from "@/components/account/OrderTracker";
import { generateInvoicePDF } from "@/lib/invoice-generator";

export default function AccountPage() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rituals' | 'locations'>('rituals');
    const [selectedOrder, setSelectedOrder] = useState<any>(null); // For Detail View

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

            // Fetch Orders with robust fallback
            const fetchOrders = async () => {
                try {
                    // Try fetching with Join first
                    const { data: userOrders, error } = await supabase
                        .from('orders')
                        .select('*, items:order_items(*, product:products(image, media, name))')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (error) {
                        console.warn("Join fetch failed (likely missing FK), falling back to simple fetch:", error.message);
                        throw error;
                    }

                    if (userOrders) setOrders(userOrders);

                } catch (err) {
                    // Fallback: Fetch without the product join
                    const { data: fallbackOrders } = await supabase
                        .from('orders')
                        .select('*, items:order_items(*)')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (fallbackOrders) setOrders(fallbackOrders);
                }
            };
            fetchOrders();

            // Fetch Addresses
            const { data: userAddresses } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id);

            if (userAddresses) setAddresses(userAddresses);

            setLoading(false);

            // Realtime Subscription
            const channel = supabase
                .channel('realtime-orders')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log("Realtime Update Received:", payload);
                        fetchOrders();

                        // Also update selected order if open
                        if (selectedOrder && selectedOrder.id === payload.new.id) {
                            // We trigger a re-fetch, but 'selectedOrder' state won't auto-update unless we sync it.
                            // simpler to just close it or let the user re-open, OR we can find it in the new orders list.
                            // For now, let's rely on the list updating behind them.
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        fetchData();
    }, [router, selectedOrder]);

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

            {/* Order Detail Modal / View */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <GlassCard className="p-6 md:p-8 space-y-8 relative bg-white/80 dark:bg-black/40 border-zinc-200 dark:border-white/10 shadow-xl">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                            >
                                ✕
                            </button>

                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Ritual Details</h2>
                                    <p className="text-zinc-400 font-mono text-xs">#{selectedOrder.id}</p>
                                    <p className="text-zinc-500 text-xs">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => generateInvoicePDF(selectedOrder)}
                                    className="px-4 py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 transition-colors mr-8 text-zinc-900 dark:text-white"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download Bill</span>
                                </button>
                            </div>

                            {/* Tracking System */}
                            <OrderTracker
                                status={selectedOrder.status}
                                paymentStatus={selectedOrder.payment_status}
                                isCOD={selectedOrder.payment_status === 'pending' || selectedOrder.payment_method === 'cod'}
                            />

                            {/* Product List with Images */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Artifacts</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item: any) => {
                                        // Try to find image from joined product data
                                        const productImg = item.product?.media?.[0] || item.product?.image || "/placeholder.jpg";
                                        return (
                                            <div key={item.id} className="flex gap-4 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-transparent">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                                                    <Image
                                                        src={productImg}
                                                        alt={item.product_name}
                                                        fill
                                                        className="object-cover opacity-80"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm">{item.product_name}</p>
                                                    <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                                                    <p className="text-xs text-blue-400 mt-1">₹{item.price_at_purchase}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Billing Summary */}
                            <div className="space-y-3 border-t border-zinc-200 dark:border-white/10 pt-6">
                                <div className="flex justify-between text-sm text-zinc-400">
                                    <span>Subtotal</span>
                                    <span>₹{selectedOrder.total_amount}</span>
                                </div>
                                <div className="flex justify-between text-sm text-zinc-400">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-2">
                                    <span>Total Essence</span>
                                    <span className="text-gradient">₹{selectedOrder.total_amount}</span>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            {selectedOrder.shipping_address && (
                                <div className="bg-zinc-50 dark:bg-white/5 p-4 rounded-xl space-y-1 border border-zinc-100 dark:border-transparent">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Delivering To</p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{selectedOrder.customer_name}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedOrder.shipping_address.street}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pincode}</p>
                                </div>
                            )}

                        </GlassCard>
                    </motion.div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
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

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('rituals')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'rituals' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Ritual History
                        {activeTab === 'rituals' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('locations')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'locations' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Saved Locations
                        {activeTab === 'locations' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="min-h-[400px]">
                    {activeTab === 'rituals' ? (
                        <div className="space-y-4 max-w-2xl">
                            {orders.length === 0 ? (
                                <div className="text-center py-20 text-zinc-600">No rituals recorded yet.</div>
                            ) : (
                                orders.map((order) => (
                                    <GlassCard
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-6 cursor-pointer hover:bg-white/5 transition-all group border-l-2 border-l-transparent hover:border-l-blue-500 space-y-4"
                                    >
                                        {/* Header: Date & Status */}
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                                                </div>
                                                <p className="text-xs text-zinc-400">
                                                    {new Date(order.created_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>

                                            <div className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-white/5 w-full" />

                                        {/* Items List */}
                                        <div className="space-y-3">
                                            {order.items.map((item: any) => {
                                                // Robust fallback for product name
                                                // 1. Try joined product name
                                                // 2. Try stored product_name
                                                // 3. Try generic 'name' property
                                                // 4. Fallback to 'Unknown Artifact'
                                                const displayProductOnly = item.product?.name || item.product_name || item.name || "Unknown Artifact";

                                                return (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <div>
                                                            <p className="font-bold text-zinc-900 dark:text-white">{displayProductOnly}</p>
                                                            <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-zinc-400">₹{item.price_at_purchase * item.quantity}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-white/5 w-full" />

                                        {/* Billing Summary */}
                                        <div className="space-y-1 pt-1">
                                            <div className="flex justify-between text-xs text-zinc-500">
                                                <span>Subtotal</span>
                                                <span>₹{order.items.reduce((sum: number, i: any) => sum + (i.price_at_purchase * i.quantity), 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-zinc-500">
                                                <span>Shipping</span>
                                                <span>Free</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white pt-1 items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-normal text-zinc-500 uppercase tracking-widest">Total Essence</span>
                                                    <span className="text-gradient">₹{order.total_amount}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        generateInvoicePDF(order);
                                                    }}
                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                                                    title="Download Invoice"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.length === 0 ? (
                                <div className="col-span-full text-center py-20 text-zinc-600">No saved locations.</div>
                            ) : (
                                addresses.map((addr) => (
                                    <GlassCard key={addr.id} className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{addr.name}</h3>
                                            <p className="text-sm text-zinc-400 mt-1">{addr.street}</p>
                                            <p className="text-sm text-zinc-400">{addr.city}, {addr.state} {addr.pincode}</p>
                                            <p className="text-xs text-zinc-500 mt-2 font-mono">{addr.phone}</p>
                                        </div>
                                        {addr.is_default && (
                                            <div className="pt-2">
                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-bold tracking-wider">DEFAULT LOCATION</span>
                                            </div>
                                        )}
                                    </GlassCard>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
