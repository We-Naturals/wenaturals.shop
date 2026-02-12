import { createClient } from "@/lib/supabase-server";

export async function getSiteConfig(keys: string[]) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('site_config')
        .select('key, value')
        .in('key', keys);

    if (error) {
        console.error("Error fetching site config:", JSON.stringify(error, null, 2));
        return {};
    }

    // Convert array to object map
    const configMap: Record<string, any> = {};
    data?.forEach(item => {
        configMap[item.key] = item.value;
    });

    return configMap;
}

export async function getAllProducts() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('products')
        .select(`*`)
        .order('created_at', { ascending: false });

    if (!data) return [];

    return data.map((p: any) => ({
        ...p,
        category: p.categories?.[0] || p.category || "Uncategorized"
    }));
}
