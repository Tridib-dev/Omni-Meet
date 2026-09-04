"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import type { DiscoverCard } from "@/lib/discover-events";
import { cn } from "@/lib/utils";

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(time: string) {
    const trimmed = time.trim();
    const twelveHourMatch = trimmed.match(/^(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)$/i);

    if (twelveHourMatch) {
        const hour = Number(twelveHourMatch[1]);
        const minutes = twelveHourMatch[2] ?? "00";
        const meridiem = twelveHourMatch[3].toUpperCase();
        return `${String(hour).padStart(2, "0")}:${minutes} ${meridiem}`;
    }

    const twentyFourHourMatch = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!twentyFourHourMatch) return trimmed;

    const hour24 = Number(twentyFourHourMatch[1]);
    const minutes = twentyFourHourMatch[2];
    const meridiem = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${String(hour12).padStart(2, "0")}:${minutes} ${meridiem}`;
}

function truncateText(value: string, maxChars: number) {
    const normalized = value.trim().replace(/\s+/g, " ");
    if (normalized.length <= maxChars) return normalized;
    return `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

type Props = {
    event: DiscoverCard;
    compact?: boolean;
};

export function EventBannerContent({ event, compact = false }: Props) {
    const timeLabel = formatTime(event.time);

    return (
        // Full-width backdrop at bottom with split layout (left: title/details, right: metadata)
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/85 via-black/70 to-transparent py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-6">
            <div className="flex items-end justify-between gap-4">
                {/* LEFT: Title and Event Details */}
                <div className="flex-1 min-w-0">
                    <h3 className={cn(
                        "font-semibold leading-[1.2] tracking-[-0.02em] text-white truncate",
                        compact
                            ? "text-base sm:text-lg lg:text-xl"
                            : "text-lg sm:text-xl lg:text-2xl"
                    )}>
                        {event.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 mt-0.5 truncate max-w-[22ch] sm:max-w-[35ch] md:max-w-[50ch] lg:max-w-[60ch]">
                      {event.description ? truncateText(event.description, 50) : "No description available."}
                    </p>
                </div>

                {/* RIGHT: Date, Time, Location */}
                <div className="flex flex-col gap-1.5 text-right">
                    {/* Date and Time in same row */}
                    <div className="flex items-center gap-2 sm:gap-3 justify-end text-white">
                        <div className="flex items-center gap-1 text-xs sm:text-xs lg:text-sm">
                            <Calendar size={12} className="sm:size-3 lg:size-4 shrink-0" />
                            <span className="whitespace-nowrap">{formatDate(event.date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs sm:text-xs lg:text-sm">
                            <Clock size={12} className="sm:size-3 lg:size-4 shrink-0" />
                            <span className="whitespace-nowrap">{timeLabel}</span>
                        </div>
                    </div>

                    {/* Location on new line */}
                    <div className="flex items-center gap-1 text-xs sm:text-xs lg:text-sm text-slate-200 justify-end">
                        <MapPin size={12} className="sm:size-3 lg:size-4 shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-[180px]">{event.location}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Metadata badge positioned at bottom right - NO LONGER NEEDED
export function EventMetadata({ event }: { event: DiscoverCard }) {
    // This component is deprecated - EventBannerContent now handles all content
    return null;
}
