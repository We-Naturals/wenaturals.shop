
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-background transition-colors duration-300">
            <Navbar />
            <div className="pt-24 pb-8 px-6 max-w-7xl mx-auto">
                <Breadcrumbs className="mb-8" />
            </div>
            {children}
            <Footer />
            <CartSidebar />
        </main>
    );
}
