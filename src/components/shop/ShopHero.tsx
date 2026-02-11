import { PageHero } from "@/components/layout/PageHero";

interface ShopHeroProps {
    title?: string;
    description?: string;
    heading?: string;
    media?: any[];
}

export function ShopHero({ title, description, heading, media = [] }: ShopHeroProps) {
    return (
        <PageHero
            title={title || "The Collections"}
            description={description}
            media={media}
        />
    );
}
