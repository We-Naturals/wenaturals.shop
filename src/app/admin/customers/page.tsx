"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, MapPin, ShoppingBag, ChevronDown, ChevronUp, Phone, Mail } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { format } from "date-fns";

interface Customer {
    id: string; // user_id
    email: string | null;
    role: string;
    created_at: string;
    orders: any[];
    addresses: any[];
    totalSpent: number;
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const supabase = createClient();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profiles (Base of our customer list)
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profileError) throw profileError;

            // 2. Fetch Orders
            const { data: orders, error: orderError } = await supabase
                .from('orders')
                .select('*');

            if (orderError) throw orderError;

            // 3. Fetch Addresses
            const { data: addresses, error: addressError } = await supabase
                .from('addresses')
                .select('*');

            if (addressError) throw addressError;

            // 4. Aggregation Logic
            const aggregatedCustomers = profiles.map((profile: any) => {
                const userOrders = orders?.filter((o: any) => o.user_id === profile.id) || [];
                const userAddresses = addresses?.filter((a: any) => a.user_id === profile.id) || [];

                const totalSpent = userOrders.reduce((acc: number, curr: any) => {
                    return acc + (parseFloat(curr.total_amount) || 0);
                }, 0);

                return {
                    id: profile.id,
                    email: profile.email,
                    role: profile.role,
                    created_at: profile.created_at,
                    orders: userOrders,
                    addresses: userAddresses,
                    totalSpent
                };
            });

            setCustomers(aggregatedCustomers);

        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedCustomer(expandedCustomer === id ? null : id);
    };

    const filteredCustomers = customers.filter(c =>
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.includes(searchTerm)
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Sanctuary Members</h1>
                    <p className="text-zinc-500 mt-1">Manage and view your customer base.</p>
                </div>

                <div className="relative group w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-zinc-500 animate-pulse">Summoning spirits...</div>
            ) : (
                <div className="space-y-4">
                    {filteredCustomers.map((customer) => (
                        <GlassCard key={customer.id} className="overflow-hidden transition-all duration-500 border-white/5 hover:border-white/10">
                            <div
                                onClick={() => toggleExpand(customer.id)}
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${customer.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {customer.email ? customer.email[0].toUpperCase() : <Users className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm md:text-base">{customer.email || "Unknown Spirit"}</h3>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">
                                            Joined {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 md:gap-12">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Orders</p>
                                        <p className="font-mono text-sm">{customer.orders.length}</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Spend</p>
                                        <p className="font-mono text-sm text-green-400">${customer.totalSpent.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        {expandedCustomer === customer.id ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedCustomer === customer.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-white/5 bg-black/20"
                                    >
                                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Addresses Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-zinc-400 border-b border-white/10 pb-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <h4 className="text-xs font-bold uppercase tracking-widest">Address Book</h4>
                                                </div>
                                                {customer.addresses.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {customer.addresses.map(addr => (
                                                            <div key={addr.id} className="text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                                                                <p className="font-bold text-white mb-1">{addr.name}</p>
                                                                <p className="text-zinc-400 text-xs leading-relaxed">
                                                                    {addr.street}<br />
                                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                                                                    <Phone className="w-3 h-3" />
                                                                    {addr.phone}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-600 text-sm italic">No addresses saved yet.</p>
                                                )}
                                            </div>

                                            {/* Recent Orders Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-zinc-400 border-b border-white/10 pb-2">
                                                    <ShoppingBag className="w-4 h-4" />
                                                    <h4 className="text-xs font-bold uppercase tracking-widest">Recent Orders</h4>
                                                </div>
                                                {customer.orders.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {customer.orders.slice(0, 5).map(order => (
                                                            <div key={order.id} className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                                                                <div>
                                                                    <p className="font-mono text-xs text-zinc-500 mb-1">#{order.id.slice(0, 8)}</p>
                                                                    <div className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                                'bg-red-500/20 text-red-400'
                                                                        }`}>
                                                                        {order.status.toUpperCase()}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold md:text-base">${order.total_amount}</p>
                                                                    <p className="text-[10px] text-zinc-500">{format(new Date(order.created_at), 'MMM dd')}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-600 text-sm italic">No orders placed yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    ))}

                    {filteredCustomers.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            <p>No spirits found matching your query.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
