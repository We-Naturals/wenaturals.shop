import { Suspense } from "react";
import { SiteNavbar as Navbar } from "@/components/layout/SiteNavbar";
import { MarqueeSimple } from "@/components/ui/Marquee";
import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Footer } from "@/components/layout/Footer";
import { Philosophy } from "@/components/home/Philosophy";
import { CategorySpotlight } from "@/components/home/CategorySpotlight";
import { RitualJournal } from "@/components/home/RitualJournal";
import { createClient } from "@/lib/supabase-server";
import { ClientRituals } from "@/components/home/ClientRituals";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { YoutubeShorts } from "@/components/home/YoutubeShorts";
import { getSiteConfig, getAllProducts } from "@/lib/content-server";

// We need to refactor these components to accept 'initialContent' props
// For now, we pass the data down, assuming we will update them next.

const COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  philosophy: Philosophy,
  rituals: ClientRituals,
  shorts: YoutubeShorts,
  featured: FeaturedCollection,
  journal: RitualJournal,
  testimonials: MarqueeSimple, // Keep for backward compatibility if needed, but layout uses marquee_bottom now.
  marquee_top: MarqueeSimple,
  marquee_bottom: MarqueeSimple,
  categories: CategorySpotlight,
};

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function Home() {
  // 1. Parallel Data Fetching
  const [siteConfig, products, allCategories] = await Promise.all([
    getSiteConfig([
      'homepage_layout',
      'content_homepage', // Hero
      'content_philosophy',
      'content_testimonials', // Rituals/Testimonials
      'youtube_shorts',
      'content_featured',
      'content_journal',
      'content_categories',
      'content_marquee_top',
      'content_marquee_bottom'
    ]),
    getAllProducts(),
    (async () => {
      const { data } = await createClient().then(s => s.from('categories').select('name').order('name'));
      return data?.map((c: any) => c.name) || [];
    })() // Fetch all categories for the filter
  ]);


  const layout = Array.isArray(siteConfig['homepage_layout'])
    ? siteConfig['homepage_layout']
    : ['hero', 'marquee_top', 'philosophy', 'rituals', 'shorts', 'featured', 'journal', 'marquee_bottom', 'categories'];

  // Map keys to specific content objects for easier prop passing
  const contentMap: Record<string, any> = {
    hero: siteConfig['content_homepage'],
    philosophy: siteConfig['content_philosophy'],
    rituals: siteConfig['content_testimonials'],
    shorts: siteConfig['youtube_shorts'],
    featured: siteConfig['content_featured'],
    journal: siteConfig['content_journal'],
    testimonials: siteConfig['content_testimonials'], // Legacy fallback
    categories: siteConfig['content_categories'],
    marquee_top: siteConfig['content_marquee_top'],
    marquee_bottom: siteConfig['content_marquee_bottom']
  };

  return (
    <main className="min-h-[100dvh] pb-20">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-black animate-pulse" />}>

        {layout.map((sectionKey: string) => {
          const Component = COMPONENTS[sectionKey];
          if (!Component) return null;

          const sectionData = contentMap[sectionKey];

          // Pass products explicitly to FeaturedCollection
          if (sectionKey === 'featured') {
            return <Component key={sectionKey} initialContent={sectionData} initialProducts={products} allCategories={allCategories} />;
          }

          return <Component key={sectionKey} initialContent={sectionData} />;
        })}

      </Suspense>
      <Footer />
      <CartSidebar />
    </main>
  );
}
