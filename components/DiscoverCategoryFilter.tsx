"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";

const slugify = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

export default function DiscoverCategoryFilter({ searchQuery = "" }: { searchQuery?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") ?? "";
    const categories = EVENT_CATEGORIES.filter((category) => category.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const selectCategory = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category) params.set("category", slugify(category));
        else params.delete("category");
        params.delete("page");
        router.push(`/events/discover?${params.toString()}`);
    };

    return (
        <div className="discover-category-list">
            <button type="button" className={`discover-category-option ${!activeCategory ? "active" : ""}`} onClick={() => selectCategory("")}>All categories</button>
            {categories.map((category) => {
                const slug = slugify(category);
                return <button key={category} type="button" className={`discover-category-option ${activeCategory === slug ? "active" : ""}`} onClick={() => selectCategory(category)}>{category}</button>;
            })}
            {!categories.length && <p className="discover-filter-no-match">No categories found.</p>}
        </div>
    );
}
