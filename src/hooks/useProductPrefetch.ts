"use client";

import { useCallback, useRef } from 'react';
import { getProductDetails } from '@/app/shop/actions';

// Global cache (outside hook to persist across re-renders/unmounts)
const productCache = new Map<string, any>();
const pendingRequests = new Set<string>();

export function useProductPrefetch() {
    const prefetch = useCallback(async (slug: string) => {
        if (!slug || productCache.has(slug) || pendingRequests.has(slug)) return;

        pendingRequests.add(slug);

        try {
            // Fetch data securely via Server Action
            const data = await getProductDetails(slug);
            if (data) {
                productCache.set(slug, data);
            }
        } catch (error) {
            console.error(`Failed to prefetch product: ${slug}`, error);
        } finally {
            pendingRequests.delete(slug);
        }
    }, []);

    const getCached = useCallback((slug: string) => {
        return productCache.get(slug);
    }, []);

    return { prefetch, getCached };
}
