// components/CategoryTabs.tsx

import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";
import { BriefcaseBusiness, CalendarDays, ChartNoAxesColumnIncreasing, Code2, Compass, GraduationCap, Handshake, Laptop, Mic2, Presentation, Trophy, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
    "Conference": Presentation,
    "Meetup": UsersRound,
    "Workshop": Laptop,
    "Webinar": Mic2,
    "Hackathon": Code2,
    "Seminar": GraduationCap,
    "Panel Discussion": BriefcaseBusiness,
    "Networking Event": Handshake,
    "Product Launch": Compass,
    "Demo Day": ChartNoAxesColumnIncreasing,
    "Fireside Chat": Mic2,
    "Bootcamp": Code2,
    "Competition": Trophy,
    "Career Fair": BriefcaseBusiness,
};

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
                <CalendarDays size={18} strokeWidth={2} />
                <span>All</span>
            </Link>
            
            {EVENT_CATEGORIES.map((category) => {
                const slug = slugify(category);
                return (
                    <Link
                        key={category}
                        href={buildHref(slug)}
                        className={`category-tab ${activeCategory === slug ? "active" : ""}`}
                    >
                        {(() => { const Icon = categoryIcons[category] ?? CalendarDays; return <><Icon size={18} strokeWidth={2} /><span>{category}</span></>; })()}
                    </Link>
                );
            })}
        </div>
    );
};

export default CategoryTabs;
