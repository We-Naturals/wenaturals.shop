import { createClient } from "@/lib/supabase-server";

export const fetchProductBySlug = async (slug: string) => {
    const supabase = await createClient();

    // Fetch Product
    const { data: productData, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name)
        `)
        .eq('slug', slug)
        .single();

    if (error || !productData) {
        return null;
    }

    // Map product
    const mappedProduct = {
        ...productData,
        category: productData.category || productData.categories?.name || "Uncategorized",
        media: productData.media || (productData.image ? [productData.image] : []),
        marketplace: {
            amazon: productData.amazon_link || null,
            flipkart: productData.flipkart_link || null,
            meesho: productData.meesho_link || null
        }
    };

    let relatedBlogs: any[] = [];

    // Fetch Related Blogs
    const relatedBlogIds = productData.alchemical_properties?.related_blogs || productData.related_blog_ids || [];

    if (relatedBlogIds.length > 0) {
        const { data: blogsData } = await supabase
            .from('blogs')
            .select('*')
            .in('id', relatedBlogIds);

        if (blogsData) {
            relatedBlogs = blogsData.map((b: any) => ({
                ...b,
                coverImage: b.image,
                readTime: "5 min" // static for now
            }));
        }
    }

    return { product: mappedProduct, relatedBlogs };
};

export const fetchRecommendedProducts = async (category: string, currentProductId: string) => {
    const supabase = await createClient();

    const { data: recommendedData } = await supabase
        .from('products')
        .select(`
            *,
            categories (name)
        `)
        .eq('status', 'Published')
        .neq('id', currentProductId)
        .eq('category', category)
        .limit(4);

    if (!recommendedData || recommendedData.length === 0) {
        // Fallback to latest products if category doesn't have enough
        const { data: latestData } = await supabase
            .from('products')
            .select(`
                *,
                categories (name)
            `)
            .eq('status', 'Published')
            .neq('id', currentProductId)
            .order('created_at', { ascending: false })
            .limit(4);

        return (latestData || []).map((p: any) => ({
            ...p,
            category: p.category || p.categories?.name || "Uncategorized"
        }));
    }

    return recommendedData.map((p: any) => ({
        ...p,
        category: p.category || p.categories?.name || "Uncategorized"
    }));
};
