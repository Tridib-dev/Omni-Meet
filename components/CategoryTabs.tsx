// components/CategoryTabs.tsx

import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";

const slugify = (value: string): string => 
    value.toLowerCase().replace(/\s+/g, "-");

interface CategoryTabsProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CategoryTabs = async ({ searchParams }: CategoryTabsProps) => {
    const params = await searchParams;
    
    const activeCategory = typeof params.category === 'string' 
        ? params.category 
        : undefined;

    if (params.type === "profiles") return null;

    const buildHref = (categorySlug?: string) => {
        const urlParams = new URLSearchParams();
        
        // Preserve all existing search params
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach(v => urlParams.append(key, v));
                } else {
                    urlParams.set(key, value);
                }
            }
        });

        if (categorySlug) {
            urlParams.set("category", categorySlug);
        } else {
            urlParams.delete("category");
        }
        
        // Always reset page when changing category
        urlParams.delete("page");

        const query = urlParams.toString();
        return `/events/discover${query ? `?${query}` : ""}`;
    };

    return (
        <div className="category-tabs">
            <Link 
                href={buildHref(undefined)} 
                className={`category-tab ${!activeCategory ? "active" : ""}`}
            >
                All
            </Link>
            
            {EVENT_CATEGORIES.map((category) => {
                const slug = slugify(category);
                return (
                    <Link
                        key={category}
                        href={buildHref(slug)}
                        className={`category-tab ${activeCategory === slug ? "active" : ""}`}
                    >
                        {category}
                    </Link>
                );
            })}
        </div>
    );
};

export default CategoryTabs;
