import { AboutClient } from "@/components/pages/AboutClient";
import { getSiteConfig } from "@/lib/content-server";
import { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig(['content_pages']);
    const aboutContent = config.content_pages?.about || {
        title: "Behind the Glass",
        description: "Merging ancient biological wisdom with modern molecular science."
    };

    return {
        title: `${aboutContent.title} | We Naturals`,
        description: aboutContent.description,
        alternates: {
            canonical: '/about'
        }
    };
}

export default async function AboutPage() {
    const config = await getSiteConfig(['content_pages']);

    return (
        <AboutClient initialContent={config.content_pages} />
    );
}
