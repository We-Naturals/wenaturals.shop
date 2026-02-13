"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export function Breadcrumbs({
    customItems = [],
    className = ""
}: {
    customItems?: { label: string, href: string }[],
    className?: string
}) {
    const pathname = usePathname();

    // Generate breadcrumbs from path if no custom items provided
    const pathSegments = pathname.split('/').filter(p => p);

    const items = customItems.length > 0 ? customItems : pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        // Beautify segment: "face-serum" -> "Face Serum"
        const label = segment
            .replace(/-/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());

        return { label, href };
    });

    const breadcrumbListSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://wenaturals.shop"
            },
            ...items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": item.label,
                "item": `https://wenaturals.shop${item.href}`
            }))
        ]
    };

    return (
        <nav aria-label="Breadcrumb" className={`text-sm text-zinc-500 font-medium ${className}`}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
            />

            <ol className="flex items-center gap-1 flex-wrap">
                <li className="flex items-center hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <Link href="/" aria-label="Home">
                        <Home className="w-4 h-4" />
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <Fragment key={item.href}>
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                            <li
                                className={`
                                    flex items-center capitalize
                                    ${isLast
                                        ? "text-zinc-900 dark:text-white font-semibold cursor-default pointer-events-none"
                                        : "hover:text-zinc-900 dark:hover:text-white transition-colors"
                                    }
                                `}
                                aria-current={isLast ? "page" : undefined}
                            >
                                {isLast ? (
                                    <span>{item.label}</span>
                                ) : (
                                    <Link href={item.href}>
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
