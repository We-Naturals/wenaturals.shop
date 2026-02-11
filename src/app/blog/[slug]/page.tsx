import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = {
    params: Promise<{ slug: string }>
}

async function getBlog(slug: string) {
    const supabase = await createClient();
    const decodedSlug = decodeURIComponent(slug);

    const { data: blog, error } = await supabase
        .from('blogs')
        .select(`
            *,
            profiles:author_id (full_name)
        `)
        .eq('slug', decodedSlug)
        .single();

    if (error || !blog) return null;

    // Helper to process URL
    const getValidUrl = (url: any) => {
        if (!url || typeof url !== 'string') return "/placeholder.jpg";
        if (url.startsWith('/')) return url;
        if (url.startsWith('http')) return url;
        return "/placeholder.jpg";
    };

    const processedBlog = {
        ...blog,
        coverImage: getValidUrl(blog.image),
        media: blog.alchemical_properties?.media || (blog.image ? [blog.image] : []),
        author: blog.profiles?.full_name || "Admin",
        readTime: blog.alchemical_properties?.read_time || "5 min",
        date: new Date(blog.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        isoDate: new Date(blog.created_at).toISOString()
    };

    const relatedIds = blog.alchemical_properties?.related_products || blog.related_product_ids || [];
    let relatedProducts: any[] = [];
    if (relatedIds.length > 0) {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', relatedIds);
        if (products) relatedProducts = products;
    }

    return { blog: processedBlog, relatedProducts };
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const slug = (await params).slug;
    const data = await getBlog(slug);

    if (!data) {
        return {
            title: "Story Not Found | We Naturals",
        };
    }

    const { blog } = data;

    return {
        title: `${blog.title} | We Naturals Journal`,
        description: blog.excerpt || `Read more about ${blog.title} on We Naturals.`,
        openGraph: {
            title: blog.title,
            description: blog.excerpt,
            images: [blog.coverImage],
            type: "article",
            publishedTime: blog.isoDate,
            authors: [blog.author],
        },
        twitter: {
            card: "summary_large_image",
            title: blog.title,
            description: blog.excerpt,
            images: [blog.coverImage],
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const slug = (await params).slug;
    const data = await getBlog(slug);

    if (!data) {
        notFound();
    }

    const { blog, relatedProducts } = data;

    // JSON-LD for Article
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.title,
        "image": blog.coverImage.startsWith('http') ? blog.coverImage : `https://wenaturals.shop${blog.coverImage}`,
        "datePublished": blog.isoDate,
        "dateModified": blog.isoDate, // Should ideally be updated_at
        "author": [{
            "@type": "Person",
            "name": blog.author,
            "url": "https://wenaturals.shop/about" // Fallback URL
        }],
        "publisher": {
            "@type": "Organization",
            "name": "We Naturals",
            "logo": {
                "@type": "ImageObject",
                "url": "https://wenaturals.shop/logo.png"
            }
        },
        "description": blog.excerpt
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <BlogPostClient blog={blog} relatedProducts={relatedProducts} />
        </>
    );
}
