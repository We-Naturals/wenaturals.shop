"use client";

import { motion } from "framer-motion";
import { Check, Truck, Package, Home, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTrackerProps {
    status: string;        // 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
    paymentStatus: string; // 'paid', 'pending', 'cod'
    isCOD: boolean;
}

const STEPS = [
    { id: 'processing', label: 'Processing', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Home },
    { id: 'delivered', label: 'Delivered', icon: Check },
];

export function OrderTracker({ status, paymentStatus, isCOD }: OrderTrackerProps) {
    // 1. Determine current step index
    let currentStepIndex = STEPS.findIndex(s => s.id === status);
    if (status === 'delivered') currentStepIndex = 3;
    // Map intermediate/edge statuses
    if (status === 'cancelled') currentStepIndex = -1;
    if (status === 'returned') currentStepIndex = 3; // Show full progress but marked differently? 

    // 2. Determine Payment Display
    const getPaymentBadge = () => {
        if (paymentStatus === 'paid') {
            return (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
                    <Check className="w-3 h-3" />
                    Payment: Paid
                </div>
            );
        }
        if (isCOD) {
            return (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] uppercase font-bold tracking-wider">
                    <Clock className="w-3 h-3" />
                    Payment: COD (Pending)
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] uppercase font-bold tracking-wider">
                <Clock className="w-3 h-3" />
                Payment: Pending
            </div>
        );
    };

    if (status === 'cancelled') {
        return (
            <div className="w-full p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                <span className="text-red-400 font-bold uppercase tracking-widest text-xs">Order Cancelled</span>
                {getPaymentBadge()}
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header: Payment & Delivery Status Labels */}
            <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Delivery Status</span>
                    <span className="text-sm font-bold text-white capitalize">{status.replace(/_/g, ' ')}</span>
                </div>
                {getPaymentBadge()}
            </div>

            {/* Visual Tracking Bar */}
            <div className="relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full" />

                {/* Active Line (Animated) */}
                <motion.div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 -translate-y-1/2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />

                {/* Steps */}
                <div className="relative flex justify-between z-10">
                    {STEPS.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-3">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: isCompleted ? (isCurrent ? "#9333ea" : "#2563eb") : "#18181b", // Purple for current, Blue for past
                                        scale: isCurrent ? 1.2 : 1,
                                        borderColor: isCompleted ? "transparent" : "#27272a"
                                    }}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 shadow-xl",
                                        isCompleted ? "text-white" : "text-zinc-600"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                </motion.div>
                                <span className={cn(
                                    "text-[9px] uppercase font-bold tracking-wider transition-colors duration-300",
                                    isCompleted ? "text-white" : "text-zinc-600"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
