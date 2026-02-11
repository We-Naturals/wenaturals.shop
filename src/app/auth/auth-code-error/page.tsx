import Link from "next/link";
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { Footer } from "@/components/layout/Footer";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-6 mt-20">
                <div className="max-w-md w-full text-center space-y-8 glass p-12 rounded-3xl border-white/10">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle className="w-10 h-10" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold">Authentication Issue</h1>
                        <p className="text-zinc-400">
                            We encountered a problem verifying your identity. This can happen if the login popup was closed too early or if the connection was interrupted.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link
                            href="/auth"
                            className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all block"
                        >
                            Return to Login
                        </Link>
                        <Link
                            href="/"
                            className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all block text-sm"
                        >
                            Back to Sanctuary
                        </Link>
                    </div>

                    <p className="text-xs text-zinc-600">
                        Error Code: AUTH_CALLBACK_FAILURE
                    </p>
                </div>
            </div>

            <Footer />
        </main>
    );
}
