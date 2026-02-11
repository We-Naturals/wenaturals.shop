import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

import { createClient as createServerClient } from "@/lib/supabase-server";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data } = await supabase.from('site_config').select('value').eq('key', 'content_marketing').single();
  const seo = data?.value?.seo || {};

  return {
    title: {
      template: seo.titleTemplate || "%s | We Naturals",
      default: "We Naturals | Premium E-Commerce",
    },
    description: seo.defaultDescription || "Experience the next generation of natural products with glassmorphism design.",
    openGraph: {
      title: "We Naturals | Premium E-Commerce",
      description: seo.defaultDescription || "Experience the next generation of natural products with glassmorphism design.",
      images: [seo.defaultImage || "/og-image.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "We Naturals | Premium E-Commerce",
      description: seo.defaultDescription || "Experience the next generation of natural products with glassmorphism design.",
      images: [seo.defaultImage || "/og-image.jpg"],
    },
    icons: {
      icon: seo.favicon || "/favicon.ico",
      apple: seo.appleTouchIcon || "/apple-touch-icon.png",
    }
  };
}

import { RootTransition } from "@/components/layout/RootTransition";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { ParallaxBackground } from "@/components/layout/ParallaxBackground";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { Preloader } from "@/components/ui/Preloader";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DesignProvider } from "@/components/providers/DesignProvider";
import { SensoryProvider } from "@/components/providers/SensoryProvider";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

import { MaintenanceMode } from "@/components/layout/MaintenanceMode";
import { headers } from "next/headers";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AtmosphereParticles } from "@/components/ui/AtmosphereParticles";
import { FlyGhostOverlay } from "@/components/ui/FlyGhostOverlay";
import { EnvironmentalProvider } from "@/components/providers/EnvironmentalProvider";

// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const { data: systemData } = await supabase.from('site_config').select('value').eq('key', 'content_system').single();
  const isMaintenance = systemData?.value?.maintenance_mode || false;

  // Check if we are in admin area
  const headersList = await headers();
  const fullPath = headersList.get("x-pathname") || "";
  const isAdminPreview = headersList.get("x-admin-preview") === "true";
  const isAdmin = fullPath.startsWith("/admin") || isAdminPreview;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "We Naturals",
    "url": "https://wenaturals.shop",
    "logo": "https://wenaturals.shop/logo.png",
    "sameAs": [
      "https://facebook.com/wenaturals",
      "https://instagram.com/wenaturals",
      "https://twitter.com/wenaturals"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-555-5555",
      "contactType": "Customer Service"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${cormorant.variable} antialiased bg-background text-foreground min-h-screen font-sans transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <EnvironmentalProvider>
            <SensoryProvider>
              <AuthProvider>
                <DesignProvider>
                  {isMaintenance && !isAdmin ? (
                    <MaintenanceMode />
                  ) : (
                    <>
                      <AnnouncementBar />
                      <SmoothScroll />
                      <Preloader />
                      <GrainOverlay />
                      <AtmosphereParticles />
                      <FlyGhostOverlay />
                      <CustomCursor />
                      <ParallaxBackground />
                      <div className="relative z-10">
                        <RootTransition>
                          {children}
                        </RootTransition>
                      </div>
                    </>
                  )}
                </DesignProvider>
              </AuthProvider>
            </SensoryProvider>
          </EnvironmentalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
