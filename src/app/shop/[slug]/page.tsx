import { fetchProductBySlug, fetchRecommendedProducts } from "@/lib/server/products";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const slug = (await params).slug;
    const data = await fetchProductBySlug(slug);

    if (!data || !data.product) {
        return {
            title: "Product Not Found | We Naturals",
        };
    }

    const { product } = data;
    const productImage = product.media?.[0] || "/placeholder.jpg";

    return {
        title: `${product.name} | We Naturals`,
        description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || "Experience nature's finest.",
        openGraph: {
            title: product.name,
            description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || "Experience nature's finest.",
            images: [
                {
                    url: productImage,
                    width: 800,
                    height: 600,
                    alt: product.name,
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || "Experience nature's finest.",
            images: [productImage],
        }
    };
}

export default async function Page({ params }: Props) {
    const slug = (await params).slug;
    const data = await fetchProductBySlug(slug);

    if (!data || !data.product) {
        return (
            <div className="min-h-screen bg-mesh flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                    <p className="text-zinc-400">This essence may have dissipated.</p>
                </div>
            </div>
        );
    }

    const recommendedProducts = await fetchRecommendedProducts(data.product.category, data.product.id);

    // JSON-LD for Product
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.product.name,
        "image": data.product.media?.[0] || "https://wenaturals.shop/placeholder.jpg",
        "description": data.product.description?.replace(/<[^>]*>?/gm, '').slice(0, 300) || "Experience nature's finest.",
        "brand": {
            "@type": "Brand",
            "name": "We Naturals"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://wenaturals.shop/shop/${data.product.slug}`,
            "priceCurrency": data.product.currency || "USD",
            "price": data.product.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": data.product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "We Naturals"
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetails
                product={data.product}
                relatedBlogs={data.relatedBlogs}
                recommendedProducts={recommendedProducts}
            />
        </>
    );
}
