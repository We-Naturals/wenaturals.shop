"use client";

import { motion } from "framer-motion";
import {
    TrendingUp, Users, ShoppingBag, CreditCard,
    ArrowUpRight, AlertCircle, Package, Activity,
    Calendar, ChevronRight, ArrowDownRight, Clock
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface DashboardStats {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
    aov: number;
    revenueGrowth: number;
    todayOrders: number;
    monthlyRevenue: number;
    statusDistribution: Record<string, number>;
    recentOrders: any[];
    lowStockItems: any[];
    salesHistory: { date: string; amount: number }[];
    categoryStats: { name: string; value: number }[];
}

export default function AdminPage() {
    const [stats, setStats] = useState<DashboardStats>({
        revenue: 0,
        orders: 0,
        customers: 0,
        products: 0,
        aov: 0,
        revenueGrowth: 0,
        todayOrders: 0,
        monthlyRevenue: 0,
        statusDistribution: {},
        recentOrders: [],
        lowStockItems: [],
        salesHistory: [],
        categoryStats: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const supabase = createClient();
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            const startOfmonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            // 1. Fetch Core Data
            const [
                { count: productCount },
                { count: customerCount },
                { data: allOrders }
            ] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*').order('created_at', { ascending: false })
            ]);

            // 2. Fetch Low Stock Items
            const { data: lowStock } = await supabase
                .from('products')
                .select('name, stock, id')
                .lte('stock', 10)
                .limit(5);

            // 3. Process Analytics
            const orders = (allOrders || []);
            const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered' || o.status === 'shipped');

            const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

            // Period specific
            const todayOrdersCount = orders.filter(o => o.created_at >= startOfToday).length;
            const monthlyRevenueCount = paidOrders.filter(o => o.created_at >= startOfmonth).reduce((sum, o) => sum + Number(o.total_amount), 0);

            // Status Distribution
            const statusDist: Record<string, number> = {};
            orders.forEach(o => {
                statusDist[o.status] = (statusDist[o.status] || 0) + 1;
            });

            const aov = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

            // 4. Timeseries Data
            const salesByDate: Record<string, number> = {};
            paidOrders.forEach(order => {
                const date = new Date(order.created_at).toLocaleDateString();
                salesByDate[date] = (salesByDate[date] || 0) + Number(order.total_amount);
            });

            const salesHistory = Object.entries(salesByDate)
                .map(([date, amount]) => ({ date, amount }))
                .slice(0, 7)
                .reverse();

            setStats({
                revenue: totalRevenue,
                orders: paidOrders.length,
                customers: customerCount || 0,
                products: productCount || 0,
                aov,
                revenueGrowth: 12.5,
                todayOrders: todayOrdersCount,
                monthlyRevenue: monthlyRevenueCount,
                statusDistribution: statusDist,
                recentOrders: orders.slice(0, 5),
                lowStockItems: lowStock || [],
                salesHistory,
                categoryStats: [
                    { name: 'Skincare', value: 45 },
                    { name: 'Haircare', value: 30 },
                    { name: 'Wellness', value: 25 }
                ]
            });
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    // Simple SVG Line Chart Generator
    const SalesPulseChart = ({ data }: { data: any[] }) => {
        if (!data.length) return null;
        const max = Math.max(...data.map(d => d.amount), 100);
        const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.amount / max * 80)}`).join(' ');

        return (
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={`M ${points}`}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    d={`M ${points} V 100 H 0 Z`}
                    fill="url(#chartGradient)"
                />
                {data.map((d, i) => (
                    <motion.circle
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + (i * 0.1) }}
                        cx={(i / (data.length - 1)) * 100}
                        cy={100 - (d.amount / max * 80)}
                        r="2"
                        fill="#3B82F6"
                        className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    />
                ))}
            </svg>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter text-gradient">Sanctuary Pulse</h1>
                    <p className="text-zinc-500 mt-1 flex items-center gap-2 text-sm uppercase tracking-widest font-semibold">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Live Biological performance system
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10 text-xs font-bold text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    Last 30 Days Dynamics
                </div>
            </div>

            {/* Advanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: "Gross Flux", value: `₹${stats.revenue.toFixed(2)}`, desc: "Total molecular value", icon: CreditCard, color: "text-blue-400", trend: "+12.5%" },
                    { label: "Monthly Harvest", value: `₹${stats.monthlyRevenue.toFixed(2)}`, desc: "Current moon's cycle", icon: Calendar, color: "text-emerald-400", trend: "+8.2%" },
                    { label: "Active Rituals", value: stats.todayOrders, desc: "Active solar cycle", icon: Activity, color: "text-purple-400", trend: stats.todayOrders > 0 ? "+Active" : "Stable" },
                    { label: "Total Rituals", value: stats.orders, desc: "Cumulative performance", icon: ShoppingBag, color: "text-amber-400", trend: "+5.1%" },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 group border-white/5 hover:border-blue-500/20 transition-all duration-500 relative overflow-hidden bg-black/40">
                        <div className="flex justify-between items-start relative z-10">
                            <div className={cn("p-2 rounded-xl bg-white/5 shadow-inner", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className={cn("text-[9px] font-bold px-2.5 py-1 rounded-full bg-white/5 uppercase tracking-wider border border-white/5", stat.trend.includes('+') ? "text-emerald-400 border-emerald-500/20" : "text-zinc-500")}>
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-10 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-medium tracking-tighter font-display">{stat.value}</h3>
                        <p className="text-[10px] text-zinc-500 mt-3 font-medium uppercase tracking-widest opacity-60">{stat.desc}</p>

                        {/* Interactive Accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
                {/* Sales Analytics Chart */}
                <GlassCard className="xl:col-span-8 p-8 border-white/5 flex flex-col relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Revenue Trajectory
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Real-time</span>
                            </h2>
                            <p className="text-zinc-500 text-xs mt-1">Growth velocity over the relative time horizon.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">AOV</p>
                                <p className="text-lg font-mono font-bold">₹{stats.aov.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[250px] w-full">
                        <SalesPulseChart data={stats.salesHistory} />
                    </div>

                    <div className="grid grid-cols-7 mt-6 text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">
                        {stats.salesHistory.map((d, i) => (
                            <span key={i}>{d.date.split('/')[0]}/{d.date.split('/')[1]}</span>
                        ))}
                    </div>
                </GlassCard>

                {/* Inventory Health & Activity */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Status Flux (Distribution) */}
                    <GlassCard className="p-6 border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-5 h-5 text-blue-400" />
                            <h2 className="text-sm font-bold uppercase tracking-widest">Order Flux</h2>
                        </div>
                        <div className="space-y-8 pb-20">
                            {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((status) => {
                                const count = stats.statusDistribution[status] || 0;
                                const total = stats.orders || 1;
                                const percentage = (count / total) * 100;

                                return (
                                    <div key={status} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                            <span className={cn(
                                                status === 'paid' ? 'text-emerald-400' :
                                                    status === 'shipped' ? 'text-blue-400' :
                                                        status === 'pending' ? 'text-amber-400' :
                                                            'text-zinc-500'
                                            )}>{status}</span>
                                            <span className="text-zinc-400">{count}</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={cn("h-full rounded-full",
                                                    status === 'paid' ? 'bg-emerald-500' :
                                                        status === 'shipped' ? 'bg-blue-500' :
                                                            status === 'pending' ? 'bg-amber-500' :
                                                                'bg-zinc-700'
                                                )}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>

                    {/* Inventory Health */}
                    <GlassCard className="p-6 border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <Package className="w-5 h-5 text-amber-500" />
                            <h2 className="text-sm font-bold uppercase tracking-widest">Molecular Health</h2>
                        </div>
                        <div className="space-y-4">
                            {stats.lowStockItems.length > 0 ? (
                                stats.lowStockItems.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold truncate pr-4">{item.name}</p>
                                            <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", item.stock < 5 ? "bg-red-500" : "bg-amber-500")}
                                                    style={{ width: `${(item.stock / 100) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-xs font-mono font-bold", item.stock < 5 ? "text-red-400" : "text-amber-400")}>
                                                {item.stock} LEFT
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-zinc-500 italic text-xs">
                                    All inventories are within optimal parameters.
                                </div>
                            )}
                        </div>
                        <Link href="/admin/inventory" className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                            Manage Inventory <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </GlassCard>

                    {/* Recent Transactions */}
                    <GlassCard className="p-6 border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="w-5 h-5 text-purple-400" />
                            <h2 className="text-sm font-bold uppercase tracking-widest">Recent Flux</h2>
                        </div>
                        <div className="space-y-4">
                            {stats.recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">
                                            {order.customer_name?.[0] || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold">{order.customer_name}</p>
                                            <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">#{order.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono font-bold text-blue-400">₹{Number(order.total_amount).toFixed(0)}</p>
                                </div>
                            ))}
                        </div>
                        <Link href="/admin/orders" className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                            View All Rituals <ChevronRight className="w-3 h-3" />
                        </Link>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
