"use client";

import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { sendContactEmail } from "@/app/actions/contact";
import { PageHero } from "@/components/layout/PageHero";
import { useContent } from "@/hooks/useContent";

export function ContactClient({ initialContent }: { initialContent?: any }) {
    const content = useContent('content_pages', initialContent ? { content_pages: initialContent } : undefined);

    const contactContent = initialContent?.contact || content?.contact || {
        title: "We're Here for You",
        description: "Whether you have a question about our ingredients, need help with an order, or just want to share your ritual, we're listening.",
        heading: "Get In Touch",
        media: []
    };

    return (
        <main className="min-h-screen bg-background pb-20 transition-colors duration-300">
            <Navbar />

            <PageHero
                title={contactContent.title}
                description={contactContent.description}
                media={contactContent.media}
            />

            <div className="pb-24 px-6 max-w-7xl mx-auto">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Contact Form */}
                    <GlassCard className="p-8 md:p-12">
                        <ContactForm />
                    </GlassCard>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        {contactContent.channels_visible !== false && (
                            <div>
                                <h3 className="text-2xl font-bold mb-6">Direct Channels</h3>
                                <div className="space-y-4">
                                    <a href={`mailto:${contactContent.email || 'customercare@wenaturals.shop'}`} className="flex items-center gap-4 p-6 glass rounded-2xl hover:bg-white/5 transition-all group">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Email Us</div>
                                            <div className="font-bold text-base md:text-lg break-all">{contactContent.email || 'customercare@wenaturals.shop'}</div>
                                        </div>
                                    </a>
                                    <div className="flex items-center gap-4 p-6 glass rounded-2xl">
                                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Call Us</div>
                                            <div className="font-bold text-base md:text-lg">{contactContent.phone || '+1 (555) 123-4567'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-6 glass rounded-2xl">
                                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Visit Us</div>
                                            <div className="font-bold text-base md:text-lg line-clamp-2">{contactContent.address || '123 Alchemy Lane, Earth'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {contactContent.hours_visible !== false && (
                            <div className="p-8 rounded-3xl bg-blue-500/5 dark:bg-gradient-to-br dark:from-blue-900/20 dark:to-purple-900/20 border border-zinc-200 dark:border-white/10">
                                <h4 className="font-bold text-xl mb-4">Customer Care Hours</h4>
                                <ul className="space-y-4 text-zinc-500 dark:text-zinc-400">
                                    <li className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                                        <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Mon - Fri</span>
                                        <span className="text-zinc-900 dark:text-white font-mono text-sm sm:text-base">{contactContent.hours_weekdays || '9:00 AM - 6:00 PM EST'}</span>
                                    </li>
                                    <li className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                                        <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Saturday</span>
                                        <span className="text-zinc-900 dark:text-white font-mono text-sm sm:text-base">{contactContent.hours_saturday || '10:00 AM - 4:00 PM EST'}</span>
                                    </li>
                                    <li className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                                        <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Sunday</span>
                                        <span className="text-zinc-400 dark:text-zinc-600 text-sm sm:text-base">{contactContent.hours_sunday || 'Rest & Reflection'}</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
            <CartSidebar />
        </main>
    );
}

function ContactForm() {
    // ... existing ContactForm logic ...
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    async function handleSubmit(formData: FormData) {
        setStatus("loading");
        const result = await sendContactEmail(formData);

        if (result.success) {
            setStatus("success");
        } else {
            setStatus("error");
            alert(result.error);
        }
    }

    if (status === "success") {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400">
                    <Send className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Message Sent</h3>
                <p className="text-zinc-400">We'll get back to you shortly.</p>
                <button
                    onClick={() => setStatus("idle")}
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-white"
                >
                    Send Another
                </button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">First Name</label>
                    <input name="firstName" required className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Last Name</label>
                    <input name="lastName" required className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-white" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Email Address</label>
                <input name="email" type="email" required className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-white" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Message</label>
                <textarea name="message" required rows={5} className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition-all resize-none text-zinc-900 dark:text-white" />
            </div>
            <button
                disabled={status === "loading"}
                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Send className="w-4 h-4" />
                )}
                {status === "loading" ? "Sending..." : "Send Message"}
            </button>
        </form>
    );
}
