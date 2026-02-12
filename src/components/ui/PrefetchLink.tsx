"use client";

import Link from 'next/link';
import { useProductPrefetch } from '@/hooks/useProductPrefetch';
import { ComponentProps, useRef } from 'react';

interface PrefetchLinkProps extends ComponentProps<typeof Link> {
    slug?: string; // Optional: If provided, prefetches data for this slug
}

export function PrefetchLink({ children, slug, onMouseEnter, ...props }: PrefetchLinkProps) {
    const { prefetch } = useProductPrefetch();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Call original onMouseEnter if valid
        if (onMouseEnter) onMouseEnter(e);

        if (slug) {
            // Debounce prefetch by 50ms to avoid spamming on rapid mouse movement
            timerRef.current = setTimeout(() => {
                prefetch(slug);
            }, 50);
        }
    };

    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return (
        <Link
            {...props}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            prefetch={true} // Ensure Next.js route prefetching is also active
        >
            {children}
        </Link>
    );
}
