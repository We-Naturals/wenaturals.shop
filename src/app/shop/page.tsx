import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
// motions are moved to client components if strictly needed, but here we can keep page server side and wrap motion parts
// Actually, using framer-motion directly in a Server Component is not allowed. 
// We need to extract the Hero section to a Client Component or just keep it simple.
// For now, let's extract the Hero part into a separate file for cleanliness, OR just accept that this page file will render the Hero structure 
// but the animation needs to be in a client component.
import { ShopHero } from "../../components/shop/ShopHero";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 3600; // Revalidate every hour

export default async function ShopPage() {
    const supabase = await createClient();
    const { data: rawProducts } = await supabase
        .from('products')
        .select(`
            *,
            categories (name)
        `)
        .order('created_at', { ascending: false })
        .range(0, 11);

    // Map categories structure (same logic as before, now on server)
    const products = rawProducts?.map((p: any) => ({
        ...p,
        category: p.category || p.categories?.name || "Uncategorized"
    })) || [];

    // Fetch Page Content
    const { data: pageConfig } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'content_pages')
        .single();

    const shopContent = pageConfig?.value?.shop || {
        title: "The Molecular Shop",
        description: "Explore our collection of bio-active serums and botanical distillations.",
        heading: "Curated Skincare"
    };

    return (
        <main className="min-h-screen bg-background pb-20 transition-colors duration-300">
            <Navbar />
            <ShopHero
                title={shopContent.title}
                description={shopContent.description}
                heading={shopContent.heading}
                media={shopContent.media || []}
            />
            <ProductGrid initialProducts={products} />
            <Footer />
            <CartSidebar />
        </main>
    );
}
