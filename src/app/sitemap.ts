import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();
    const baseUrl = 'https://wenaturals.shop';

    // 1. Fetch Dynamic Data
    const [
        { data: products },
        { data: blogs }
    ] = await Promise.all([
        supabase.from('products').select('slug, updated_at'),
        supabase.from('blogs').select('slug, updated_at')
    ]);

    // 2. Static Routes
    const staticRoutes = [
        '',
        '/shop',
        '/about',
        '/contact',
        '/faq',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 3. Product Routes
    const productRoutes = (products || []).map((p) => ({
        url: `${baseUrl}/shop/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    // 4. Blog Routes
    const blogRoutes = (blogs || []).map((b) => ({
        url: `${baseUrl}/blog/${b.slug}`,
        lastModified: new Date(b.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
