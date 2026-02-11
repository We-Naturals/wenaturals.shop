"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart, getCartTotal } from "@/hooks/useCart";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export function CartSidebar() {
    const { items, isOpen, toggleCart, removeItem, updateQuantity } = useCart();
    const total = getCartTotal(items);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-[100dvh] w-full max-w-md glass z-[101] flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Your Sanctuary</h2>
                            </div>
                            <button
                                onClick={toggleCart}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 custom-scrollbar scroll-container" data-lenis-prevent>
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                    <ShoppingBag className="w-16 h-16 text-zinc-400 dark:text-white" />
                                    <p className="text-lg text-zinc-500 dark:text-zinc-400">Your cart is empty.</p>
                                    <button
                                        onClick={toggleCart}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Start collecting
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <GlassCard key={item.id} className="p-4 flex gap-4 border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-white/5 shadow-sm">
                                        <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-white/5">
                                            {item.image && item.image.endsWith('.mp4') ? (
                                                <video
                                                    src={item.image}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Image
                                                    src={item.image || "/placeholder.jpg"}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-sm leading-tight text-zinc-900 dark:text-white">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 font-medium">
                                                    {typeof item.price === 'number' || !isNaN(Number(item.price))
                                                        ? `₹${item.price}`
                                                        : item.price.toString().includes('$')
                                                            ? item.price.toString().replace('$', '₹')
                                                            : item.price}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center glass dark:glass rounded-full px-2 py-1 border-zinc-200 dark:border-white/10 bg-white dark:bg-white/10">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:text-blue-600 dark:hover:text-blue-400 text-zinc-500 dark:text-zinc-400"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-white">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:text-blue-600 dark:hover:text-blue-400 text-zinc-500 dark:text-zinc-400"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-zinc-200 dark:border-white/10 space-y-4 bg-zinc-50 dark:bg-white/[0.02]">
                                <div className="flex justify-between items-center text-lg font-bold text-zinc-900 dark:text-white">
                                    <span>Investment</span>
                                    <span className="text-gradient">₹{total.toFixed(2)}</span>
                                </div>
                                <Link
                                    href="/checkout"
                                    onClick={toggleCart}
                                    className="w-full py-4 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all block text-center transform active:scale-95 shadow-lg"
                                >
                                    Begin Checkout
                                </Link>
                                <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest">
                                    Shipping & Taxes calculated at next step
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
}
