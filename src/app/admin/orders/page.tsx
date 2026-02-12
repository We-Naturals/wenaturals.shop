"use client";

import { useEffect, useState } from "react";
import { OrderService } from "@/lib/orders";
import { GlassCard } from "@/components/ui/GlassCard";
import { Package, Truck, CheckCircle, Clock, Search, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { updateOrderStatus } from "@/app/actions/orders";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // Shipping Modal State
    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrier, setCarrier] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // We'll use the service, but fetching ALL orders might need admin rights.
                // The service uses client-side auth, so if we are logged in as admin, strict RLS should allow it.
                // Let's rely on that.
                const data = await OrderService.getOrders();
                setOrders(data || []);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        // ---------------------------------------------------------
        // REALTIME SUBSCRIPTION (Admin View)
        // ---------------------------------------------------------
        const supabase = createClient();
        const channel = supabase
            .channel('admin-realtime-orders')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT (new orders) and UPDATE (status changes)
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log("Admin Realtime Update:", payload);
                    // Simple Strategy: Re-fetch to guarantee sort order and joined data accuracy
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const initiateStatusUpdate = (orderId: string, newStatus: string) => {
        if (newStatus === "shipped") {
            setSelectedOrderForShipping(orderId);
            setShippingModalOpen(true);
        } else {
            handleStatusUpdate(orderId, newStatus);
        }
    };

    const confirmShipping = async () => {
        if (!selectedOrderForShipping) return;

        // Close modal immediately for better UX
        setShippingModalOpen(false);
        const orderId = selectedOrderForShipping;
        const tracking = trackingNumber;
        const shipCarrier = carrier;

        // Reset fields
        setTrackingNumber("");
        setCarrier("");
        setSelectedOrderForShipping(null);

        // Call update with tracking info
        try {
            // Optimistic Update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "shipped", tracking_number: tracking, carrier: shipCarrier } : o));
            await updateOrderStatus(orderId, "shipped", tracking, shipCarrier);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
            const data = await OrderService.getOrders();
            setOrders(data || []);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
            const data = await OrderService.getOrders();
            setOrders(data || []);
        }
    };

    const updateOrderPaymentStatus = async (orderId: string, newPaymentStatus: string) => {
        try {
            // Optimistic Update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
            // We reuse updateOrderStatus but pass undefined for status
            await updateOrderStatus(orderId, undefined as any, undefined, undefined, newPaymentStatus);
        } catch (error) {
            console.error("Failed to update payment status", error);
            alert("Failed to update payment status");
        }
    };


    const filteredOrders = orders.filter(o =>
        filter === "all" ? true : o.status === filter
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "text-green-400 bg-green-500/10";
            case "processing": return "text-purple-400 bg-purple-500/10";
            case "shipped": return "text-blue-400 bg-blue-500/10";
            case "out_for_delivery": return "text-orange-400 bg-orange-500/10";
            case "delivered": return "text-emerald-400 bg-emerald-500/10";
            case "cancelled": return "text-red-400 bg-red-500/10";
            case "returned": return "text-rose-400 bg-rose-500/10";
            default: return "text-zinc-400 bg-white/5";
        }
    };

    return (
        <div className="space-y-8">
            {/* Shipping Modal */}
            {shippingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-4">Ship Order</h2>
                        <p className="text-zinc-400 text-sm mb-6">Enter tracking details to notify the customer.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Carrier</label>
                                <input
                                    type="text"
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    placeholder="DHL, FedEx, etc."
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Tracking ID"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500/50 transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShippingModalOpen(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmShipping}
                                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                            >
                                Confirm Shipment
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Ritual Orders</h1>
                        <p className="text-zinc-400">Manage incoming requests from the Sanctuary.</p>
                    </div>
                    <Link href="/admin">
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">
                            Back to Dashboard
                        </button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full border text-sm capitalize transition-all ${filter === f
                                ? "bg-white text-black border-white font-bold"
                                : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-zinc-500">Summoning orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
                            No orders found in this realm.
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={order.id}
                                className="relative z-0 hover:z-50"
                            >
                                <GlassCard className="p-6 hover:bg-white/5 transition-all cursor-pointer group">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">

                                        {/* Info */}
                                        <div className="space-y-1">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xs text-zinc-500">#{order.id.slice(0, 8)}</span>

                                                    {/* DELIVERY STATUS */}
                                                    <div className="relative group/status">
                                                        <button className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                                            {order.status.replace(/_/g, ' ')}
                                                            <ChevronRight className="w-3 h-3 rotate-90 opacity-50" />
                                                        </button>
                                                        {/* Chronological Status Dropdown */}
                                                        <div className="absolute top-full left-0 pt-2 z-20 hidden group-hover/status:block min-w-[160px]">
                                                            <div className="bg-black border border-white/10 rounded-lg overflow-hidden shadow-xl p-1 space-y-1">
                                                                <div className="px-2 py-1 text-[8px] uppercase text-zinc-600 font-bold border-b border-white/5">Order Flow</div>
                                                                {["processing", "shipped", "out_for_delivery", "delivered"].map((s) => (
                                                                    <button
                                                                        key={s}
                                                                        onClick={() => initiateStatusUpdate(order.id, s)}
                                                                        className={`w-full text-left px-3 py-1.5 text-xs uppercase hover:bg-white/10 rounded transition-colors ${order.status === s ? 'text-blue-400 font-bold' : 'text-zinc-400'}`}
                                                                    >
                                                                        {s.replace(/_/g, ' ')}
                                                                    </button>
                                                                ))}
                                                                <div className="px-2 py-1 text-[8px] uppercase text-zinc-600 font-bold border-b border-white/5 border-t mt-1">Returns</div>
                                                                {["return_requested", "return_processing", "returned"].map((s) => (
                                                                    <button
                                                                        key={s}
                                                                        onClick={() => initiateStatusUpdate(order.id, s)}
                                                                        className="w-full text-left px-3 py-1.5 text-xs uppercase hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-red-400"
                                                                    >
                                                                        {s.replace(/_/g, ' ')}
                                                                    </button>
                                                                ))}
                                                                <div className="px-2 py-1 text-[8px] uppercase text-zinc-600 font-bold border-b border-white/5 border-t mt-1">Danger Zone</div>
                                                                <button
                                                                    onClick={() => initiateStatusUpdate(order.id, "cancelled")}
                                                                    className="w-full text-left px-3 py-1.5 text-xs uppercase hover:bg-red-500/20 rounded transition-colors text-red-500"
                                                                >
                                                                    Cancel Order
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* PAYMENT STATUS */}
                                                    <div className="relative group/paystatus">
                                                        <button className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 ${order.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            order.payment_method === 'cod' ? 'bg-orange-500/10 text-orange-400' : 'bg-yellow-500/10 text-yellow-400'
                                                            }`}>
                                                            {order.payment_method === 'cod' && order.payment_status !== 'paid' ? 'COD (Pending)' : order.payment_status}
                                                            <ChevronRight className="w-3 h-3 rotate-90 opacity-50" />
                                                        </button>
                                                        <div className="absolute top-full left-0 pt-2 z-20 hidden group-hover/paystatus:block min-w-[140px]">
                                                            <div className="bg-black border border-white/10 rounded-lg overflow-hidden shadow-xl p-1">
                                                                {["pending", "paid", "refunded"].map((s) => (
                                                                    <button
                                                                        key={s}
                                                                        onClick={() => updateOrderPaymentStatus(order.id, s)}
                                                                        className={`w-full text-left px-3 py-1.5 text-xs uppercase hover:bg-white/10 rounded transition-colors ${order.payment_status === s ? 'text-blue-400' : 'text-zinc-400'}`}
                                                                    >
                                                                        {s}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-lg">{order.customer_name}</h3>
                                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                                                <span>{order.customer_email}</span>
                                                <span>•</span>
                                                <span>{order.customer_phone}</span>
                                            </div>
                                            {(order.tracking_number || order.carrier) && (
                                                <div className="text-xs text-zinc-500 font-mono mt-2 flex items-center gap-2">
                                                    <Truck className="w-3 h-3 text-blue-400" />
                                                    <span className="text-zinc-400">{order.carrier}</span>
                                                    <span className="text-zinc-600">|</span>
                                                    <span className="text-white">{order.tracking_number}</span>
                                                </div>
                                            )}
                                            {order.shipping_address && (
                                                <div className="mt-2 text-[10px] text-zinc-500 bg-white/5 p-2 rounded-lg border border-white/5">
                                                    <p className="font-bold text-zinc-400 uppercase tracking-tighter mb-0.5">Delivery Essence</p>
                                                    <p>{order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Items Preview */}
                                        <div className="flex-1 max-w-md">
                                            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Essences</div>
                                            <div className="space-y-1">
                                                {order.items?.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span className="text-zinc-300">{item.quantity}x {item.product_name}</span>
                                                        <span className="text-zinc-600">₹{item.price_at_purchase}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total & Action */}
                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 min-w-[120px]">
                                            <div className="text-right">
                                                <div className="text-xs text-zinc-500 uppercase tracking-widest">Total</div>
                                                <div className="text-xl font-bold text-gradient">₹{order.total_amount}</div>
                                            </div>
                                            <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/20 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                    </div>

                                    {/* Expanded Details / Actions could go here */}
                                    {/* For now, just a viewing list */}
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
