"use client";

import Link from "next/link";
import { CalendarDays, UsersRound } from "lucide-react";
import { useSearchParams } from "next/navigation";

type DiscoverType = "events" | "profiles";

const options: { type: DiscoverType; label: string; icon: typeof CalendarDays }[] = [
    { type: "events", label: "Events", icon: CalendarDays },
    { type: "profiles", label: "Profiles", icon: UsersRound },
];

export default function DiscoverTypeToggle() {
    const searchParams = useSearchParams();
    const activeType = searchParams.get("type") === "profiles" ? "profiles" : "events";

    const buildHref = (type: DiscoverType) => {
        const params = new URLSearchParams(searchParams.toString());
        if (type === "profiles") {
            params.set("type", "profiles");
        } else {
            params.delete("type");
        }
        params.delete("page");

        if (type === "profiles") {
            params.delete("location");
            params.delete("category");
            params.delete("tags");
            params.delete("mode");
            params.delete("dateFrom");
            params.delete("dateTo");
        }

        const query = params.toString();
        return `/events/discover${query ? `?${query}` : ""}`;
    };

    return (
        <div className="discover-type-toggle" aria-label="Discovery search type">
            {options.map((option) => {
                const Icon = option.icon;
                const isActive = activeType === option.type;

                return (
                    <Link
                        key={option.type}
                        href={buildHref(option.type)}
                        className={`discover-type-option ${isActive ? "active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <Icon size={16} strokeWidth={2} />
                        {option.label}
                    </Link>
                );
            })}
        </div>
    );
}
