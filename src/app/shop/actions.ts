"use server";

import { createClient } from "@/lib/supabase-server";
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchProducts(page: number, pageSize: number = 12) {
    noStore(); // Disable caching for this action
    const supabase = await createClient();

    // Calculate range
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            *
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching paginated products:", error);
        throw new Error("Failed to fetch products");
    }

    // Map categories structure
    const products = data?.map((p: any) => ({
        ...p,
        category: p.categories?.[0] || p.category || "Uncategorized"
    })) || [];

    return products;
}

export async function getProductDetails(slug: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            *
        `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error("Error fetching product details:", error);
        return null;
    }

    return {
        ...data,
        category: data.categories?.[0] || data.category || "Uncategorized"
    };
}
