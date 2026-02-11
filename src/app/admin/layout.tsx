"use client";

import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    FileText,
    Globe,
    Tag
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

const SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Package, label: "Inventory", href: "/admin/inventory" },
    { icon: FileText, label: "Blogs", href: "/admin/blogs" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: Globe, label: "Website", href: "/admin/website" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const SidebarContent = () => (
        <>
            <div className="p-8">
                <Link href="/" className="text-xl font-bold tracking-tighter text-gradient">
                    WE NATURALS
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-medium">Administrative</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                isActive
                                    ? "bg-white/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                                    : "hover:bg-white/5 text-zinc-400 hover:text-white"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform group-hover:scale-110",
                                isActive ? "text-blue-400" : "text-zinc-500"
                            )} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="ml-auto w-1 h-4 bg-blue-500 rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/5">
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all group">
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden relative cursor-auto">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-64 glass m-4 mr-0 hidden lg:flex flex-col border-white/5"
            >
                <SidebarContent />
            </motion.aside>

            <script src="https://widget.cloudinary.com/v2.0/global/all.js" type="text/javascript"></script>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 glass z-[70] flex flex-col lg:hidden border-r border-white/5"
                        >
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full"
                                >
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl relative z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-full lg:hidden transition-colors"
                        >
                            <Menu className="w-6 h-6 text-zinc-400" />
                        </button>
                        <div className="relative w-40 md:w-96 group hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Command Center..."
                                className="w-full bg-white/5 border border-white/5 rounded-full py-2 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm font-medium tracking-tight"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative p-2 hover:bg-white/5 rounded-full transition-colors group"
                        >
                            <Bell className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        </motion.button>
                        <div className="flex items-center gap-2 md:gap-4 pl-4 md:pl-6 border-l border-white/10">
                            <div className="text-right hidden xs:block">
                                <p className="text-[10px] md:text-xs font-bold tracking-tight">Saif Admin</p>
                                <p className="text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Master Alchemist</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full glass flex items-center justify-center font-bold text-blue-400 border-white/10 text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                S
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area with Global Entry Animation */}
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 overflow-y-auto p-4 md:p-8 pt-6 pb-24 custom-scrollbar"
                    data-lenis-prevent
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
