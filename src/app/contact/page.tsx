import { ContactClient } from "@/components/pages/ContactClient";
import { getSiteConfig } from "@/lib/content-server";
import { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig(['content_pages']);
    const contactContent = config.content_pages?.contact || {
        title: "We're Here for You",
        description: "Whether you have a question about our ingredients, need help with an order, or just want to share your ritual, we're listening."
    };

    return {
        title: `${contactContent.title} | We Naturals`,
        description: contactContent.description,
        alternates: {
            canonical: '/contact'
        }
    };
}

export default async function ContactPage() {
    const config = await getSiteConfig(['content_pages']);

    return (
        <ContactClient initialContent={config.content_pages} />
    );
}
