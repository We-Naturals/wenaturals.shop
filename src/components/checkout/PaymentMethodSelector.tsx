"use client";

import { CreditCard, Banknote, Smartphone, Globe } from "lucide-react";

interface PaymentMethodSelectorProps {
    selectedMethod: 'cod' | 'upi' | 'razorpay';
    onSelect: (method: 'cod' | 'upi' | 'razorpay') => void;
}

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
    const options = [
        {
            id: 'cod',
            label: 'Cash on Delivery',
            description: 'Pay when your ritual arrives at your sanctuary.',
            icon: Banknote,
            color: 'text-green-400'
        },
        {
            id: 'upi',
            label: 'UPI (Pay via App)',
            description: 'Instant transfer via Google Pay, PhonePe, Paytm.',
            icon: Smartphone, // Or QrCode if available
            color: 'text-blue-400'
        },
        {
            id: 'razorpay',
            label: 'Cards & Netbanking',
            description: 'Secure online payment via Razorpay Gateway.',
            icon: CreditCard,
            color: 'text-purple-400'
        }
    ];

    return (
        <div className="space-y-3">
            {options.map((option) => (
                <div
                    key={option.id}
                    onClick={() => onSelect(option.id as any)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all group flex items-start gap-4 ${selectedMethod === option.id
                        ? "bg-white text-black border-white ring-2 ring-white ring-offset-2 ring-offset-black"
                        : "bg-white/5 border-white/10 hover:border-white/30 text-zinc-400 hover:text-white"
                        }`}
                >
                    <div className={`p-2 rounded-lg bg-black/50 ${option.color}`}>
                        <option.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold">{option.label}</h3>
                        <p className="text-xs opacity-70 mt-1">{option.description}</p>
                    </div>

                    {/* Selection Indicator */}
                    <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedMethod === option.id
                        ? "border-black"
                        : "border-zinc-600"
                        }`}>
                        {selectedMethod === option.id && (
                            <div className="w-2 h-2 bg-black rounded-full" />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
