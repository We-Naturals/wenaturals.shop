"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Lock, ArrowRight, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart, getCartTotal } from "@/hooks/useCart";
import { GlassCard } from "@/components/ui/GlassCard";
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { useState, useEffect } from "react";
import { OrderService } from "@/lib/orders";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { createClient } from "@/lib/supabase";
import indiaData from "@/lib/indian-states-districts.json";
import { sendOrderConfirmation } from "@/app/actions/email";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { loadRazorpay } from "@/lib/razorpay";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const { items, clearCart } = useCart();
    const total = getCartTotal(items);
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        country: "India"
    });
    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'razorpay'>('cod');

    // Derived lists
    const states = indiaData.states;
    const districts = formData.state
        ? states.find(s => s.state === formData.state)?.districts || []
        : [];

    useEffect(() => {
        const getUserAndAddresses = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                setFormData(prev => ({ ...prev, email: user.email || "" }));

                // Fetch saved addresses
                const { data: addresses, error: addrError } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_default', { ascending: false });

                if (addrError) {
                    console.error("Error fetching addresses:", addrError);
                }

                if (addresses && addresses.length > 0) {
                    setSavedAddresses(addresses);
                    fillFormWithAddress(addresses[0]);
                } else {
                    setUseNewAddress(true);
                }
            }
        };
        getUserAndAddresses();
    }, []);

    const fillFormWithAddress = (addr: any) => {
        setFormData(prev => ({
            ...prev,
            firstName: addr.name.split(' ')[0] || '',
            lastName: addr.name.split(' ').slice(1).join(' ') || '',
            phone: addr.phone,
            street: addr.street,
            city: addr.city,
            district: addr.district || '',
            state: addr.state,
            pincode: addr.pincode,
            country: 'India'
        }));
        setUseNewAddress(false);
    };

    const handleNewAddressClick = () => {
        setUseNewAddress(true);
        setFormData(prev => ({
            ...prev,
            firstName: "",
            lastName: "",
            phone: "",
            street: "",
            city: "",
            district: "",
            state: "",
            pincode: ""
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!useNewAddress) setUseNewAddress(true);
        const { name, value } = e.target;
        setFormData(prev => {
            if (name === "state") {
                return { ...prev, state: value, district: "" };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleCheckout = async () => {
        if (!user) return alert("Please sign in to continue.");
        if (!formData.phone || formData.phone.length !== 10) return alert("Please enter a valid 10-digit phone number.");
        if (!formData.street || !formData.pincode || !formData.state || !formData.district) return alert("Please complete shipping address.");

        // [NEW] Validation: Pincode
        const cleanPincode = formData.pincode.trim();
        if (!/^\d{6}$/.test(cleanPincode)) {
            return alert("Sanctuary Error: Pincode must be exactly 6 digits.");
        }

        // [NEW] Validation: Stale Cart Items (Non-UUIDs)
        const invalidItems = items.filter(item => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id));
        if (invalidItems.length > 0) {
            if (confirm("Sanctuary Detected Stale Energies: Your cart contains items from an older session which are no longer compatible. Would you like to clear the cart and start fresh?")) {
                clearCart();
                router.push("/shop");
            }
            return;
        }

        setLoading(true);
        try {
            if (useNewAddress) {
                // Save Address with clean pincode
                await OrderService.saveAddress(user.id, { ...formData, pincode: cleanPincode });
            }

            // 1. Create Order in Database (Pending)
            const order = await OrderService.createOrder({
                customer_email: formData.email,
                customer_name: `${formData.firstName} ${formData.lastName}`,
                customer_phone: formData.phone,
                shipping_address: {
                    street: formData.street,
                    city: formData.city,
                    district: formData.district,
                    state: formData.state,
                    pincode: cleanPincode,
                    country: "India"
                },
                items: items,
                total_amount: total,
                user_id: user.id,
                payment_method: paymentMethod,
                payment_status: 'pending' // Initially pending
            });

            // 2. Handle Payment Flow
            if (paymentMethod === 'cod') {
                // COD Flow: Immediate Success
                await finalizeOrder(order);
            } else {
                // Online Flow (Razorpay / UPI)
                await handleOnlinePayment(order);
            }

        } catch (error: any) {
            console.error("Checkout Error:", error);

            // Robust parsing of error message
            const errorMsg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            const isProductNotFound = errorMsg.includes("not found") || error.code === "P0001" || errorMsg.includes("P0001");

            // Self-Healing: If product not found (P0001 or text match), clear cart automatically
            if (isProductNotFound) {
                alert("Sanctuary Update: Some items in your cart are no longer available in our inventory. The cart has been refreshed for you.");
                clearCart();
                window.location.href = "/shop"; // Force hard redirect
                return;
            }
            alert("Sanctuary Error: " + errorMsg);
            setLoading(false);
        }
    };

    const handleOnlinePayment = async (order: any) => {
        setLoading(true);
        const res = await loadRazorpay();
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setLoading(false);
            return;
        }

        try {
            // 1. Create Razorpay Order (Server-Side)
            const rzpOrderReq = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_id: order.id,
                }),
            });

            if (!rzpOrderReq.ok) {
                const errorData = await rzpOrderReq.json();
                throw new Error(errorData.error || "Failed to initiate payment security.");
            }

            const rzpOrder = await rzpOrderReq.json();

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: "We Naturals",
                description: `Order #${order.id.slice(0, 8)}`,
                image: "/logo.png",
                order_id: rzpOrder.id, // <--- Using Server-Generated ID
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment (Server-Side)
                        const verifyReq = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                order_id: order.id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyRes = await verifyReq.json();

                        if (!verifyReq.ok) {
                            throw new Error(verifyRes.error || "Verification failed");
                        }

                        // Success
                        await finalizeOrder(order);
                    } catch (err: any) {
                        console.error("Payment Verification Failed:", err);
                        alert("Payment successful but verification failed: " + err.message);
                        setLoading(false);
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone,
                    method: paymentMethod === 'upi' ? 'upi' : undefined
                },
                theme: {
                    color: "#000000"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', function (response: any) {
                alert("Payment Failed: " + response.error.description);
                setLoading(false);
            });
        } catch (err: any) {
            console.error("Online Payment Flow Error:", err);
            alert("Error initiating payment: " + err.message);
            setLoading(false);
        }
    };

    const finalizeOrder = async (order: any) => {
        // Send Confirmation Email
        try {
            await sendOrderConfirmation(order);
        } catch (emailError) {
            console.error("Email sending failed (non-critical):", emailError);
        }

        alert("Ritual Complete. Order has been recorded.");
        clearCart();
        router.push("/"); // Redirect to home
        setLoading(false);
    };

    return (
        <AuthWrapper>
            <main className="min-h-screen bg-mesh pt-20 md:pt-32 pb-12 px-4 md:px-6">
                <Navbar />

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                    {/* Left Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6 md:space-y-8"
                    >
                        <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer group">
                            <Link href="/" className="flex items-center gap-2 text-sm">
                                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Sanctuary
                            </Link>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold">Checkout</h1>

                        {/* Saved Addresses Selector */}
                        {savedAddresses.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Select Delivery Address</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => fillFormWithAddress(addr)}
                                            className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 group ${!useNewAddress && formData.firstName === addr.name.split(' ')[0] && formData.street === addr.street
                                                ? "bg-white text-black border-white ring-2 ring-white ring-offset-2 ring-offset-black"
                                                : "bg-white/5 border-white/10 hover:border-white/30 text-zinc-400 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-sm">{addr.name}</span>
                                                {addr.is_default && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">DEFAULT</span>}
                                            </div>
                                            <div className="text-xs opacity-80 leading-relaxed">
                                                {addr.street}<br />
                                                {addr.city}, {addr.state} - {addr.pincode}
                                            </div>
                                            <div className="text-xs opacity-60">{addr.phone}</div>

                                            {/* Edit Button (Only visible on hover or selected) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fillFormWithAddress(addr);
                                                    setUseNewAddress(true); // Show form for editing
                                                }}
                                                className="absolute bottom-4 right-4 text-xs font-bold underline opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add New Button Card */}
                                    <div
                                        onClick={handleNewAddressClick}
                                        className={`p-4 rounded-xl border border-dashed cursor-pointer transition-all flex items-center justify-center gap-2 ${useNewAddress && !formData.street // Simple check if purely new
                                            ? "bg-white/10 border-white text-white"
                                            : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        <span className="text-2xl font-light">+</span>
                                        <span className="text-sm font-bold">Add New Address</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Form - Only Visible if 'Add New' or 'No Addresses' or 'Editing' */}
                        {(useNewAddress || savedAddresses.length === 0) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <GlassCard className="p-6 md:p-8 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                        <Truck className="w-5 h-5 text-blue-400" />
                                        <h2 className="text-lg md:text-xl font-bold">Shipping Details</h2>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Email (Signed In)</label>
                                        <input name="email" value={formData.email} disabled className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none text-zinc-500 cursor-not-allowed text-sm" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Phone (10-Digit)</label>
                                        <input name="phone" value={formData.phone} maxLength={10} onChange={handleInputChange} type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-blue-500 outline-none transition-all text-sm tracking-widest" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">First Name</label>
                                            <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-blue-500 outline-none transition-all text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Last Name</label>
                                            <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-blue-500 outline-none transition-all text-sm" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Street Address</label>
                                        <input name="street" value={formData.street} onChange={handleInputChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-blue-500 outline-none transition-all text-sm" />
                                    </div>

                                    {/* State & District Dropdowns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">State</label>
                                            <select
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full bg-black border border-white/10 rounded-lg p-3 focus:border-blue-500 outline-none transition-all text-sm appearance-none"
                                            >
                                                <option value="">Select State</option>
                                                {states.map((s) => (
                                                    <option key={s.state} value={s.state}>{s.state}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">District</label>
                                            <select
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                disabled={!formData.state}
                                                className="w-full bg-black border border-white/10 rounded-lg p-3 focus:border-blue-500 outline-none transition-all text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Select District</option>
                                                {districts.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2 md:col-span-1">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">City / Town</label>
                                            <input name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-blue-500 outline-none transition-all text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Pincode</label>
                                            <input name="pincode" value={formData.pincode} maxLength={6} onChange={handleInputChange} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:border-blue-500 outline-none transition-all text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Country</label>
                                            <input value="India" disabled className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none text-zinc-500 cursor-not-allowed text-sm" />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}

                        {/* Payment Section */}
                        <GlassCard className="p-6 md:p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <CheckCircle className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg md:text-xl font-bold">Payment Method</h2>
                            </div>

                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onSelect={setPaymentMethod}
                            />
                        </GlassCard>
                    </motion.div>

                    {/* Right Column: Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:sticky lg:top-32 h-fit"
                    >
                        <GlassCard className="p-6 md:p-8 space-y-8">
                            <h2 className="text-2xl font-bold">Order Essence</h2>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar scroll-container" data-lenis-prevent>
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
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
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold line-clamp-1">{item.name}</h3>
                                            <p className="text-zinc-500 text-xs">Qty: {item.quantity}</p>
                                            <p className="text-blue-400 font-bold mt-1">{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-white/10 pt-6">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Subtotal</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold pt-4">
                                    <span>Total</span>
                                    <span className="text-gradient">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full py-5 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all group disabled:opacity-50"
                            >
                                {loading ? "Processing..." : `Pay via ${paymentMethod === 'cod' ? 'Cash' : paymentMethod.toUpperCase()}`}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="flex items-center justify-center gap-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                                <Lock className="w-3 h-3" />
                                Secure Encrypted Portal
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </main>
        </AuthWrapper>
    );
}
