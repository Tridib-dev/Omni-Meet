"use client";

// components/EventCardH.tsx
// Horizontal card layout — image left, content right.
// Matches the hand-drawn sketch: category · title · description · tags · location+date
// with Free/Paid pill and bookmark button on the right side.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SafeImage from "@/components/dashboard/savedPage";
import SaveButtonIcon from "@/components/ui/SaveButtonIcon";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

export interface EventCardHProps {
    eventId: string;
    slug: string;
    title: string;
    description?: string;
    image: string;
    category?: string;
    location: string;
    date: string;
    tags?: string[];
    price: number;
    isSaved?: boolean;
    onUnsave?: (eventId: string) => void; // optional: called after unsaving so parent can remove card
}

const MAX_TAGS = 2;

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function EventCardH({
    eventId,
    slug,
    title,
    description = "",
    image,
    category,
    location,
    date,
    tags = [],
    price,
    isSaved: initialSaved = false,
    onUnsave,
}: EventCardHProps) {
    const [saved, setSaved] = useState(initialSaved);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const visibleTags = tags.slice(0, MAX_TAGS);
    const extraTags = tags.length - MAX_TAGS;
    const isPaid = price > 0;
    const shortDesc =
        description.length > 90 ? description.slice(0, 90) + "…" : description;

    const handleBookmarkToggle = async () => {
        if (saving) return;
        setSaving(true);

        const result = await toggleWatchlist(eventId);
        setSaved(result.saved);

        if (!result.saved && onUnsave) {
            onUnsave(eventId);
        }

        toast.success(result.saved ? "Saved to watchlist" : "Removed from watchlist");
        router.refresh();
        setSaving(false);
    };

    return (
        <Link
            href={`/events/${slug}`}
            className="group relative flex gap-4 p-3 rounded-2xl transition-all duration-200"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
            }}
        >
            {/* Left — Event image */}
            <div className="relative w-[120px] flex-shrink-0 rounded-xl overflow-hidden bg-white/5 self-stretch min-h-[96px]">
                <SafeImage
                    src={image}
                    alt={title}
                    fill
                    fallback="https://placehold.co/120x96/0b0f13/333?text=Event"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Right — Content */}
            <div className="flex flex-1 min-w-0 pr-14">
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                        {category && (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-500/80 mb-0.5">
                                {category}
                            </p>
                        )}

                        <h3 className="text-[14px] font-semibold text-white/90 group-hover:text-cyan-400 transition-colors leading-snug line-clamp-1 mb-1">
                            {title}
                        </h3>

                        {shortDesc && (
                            <p className="text-[12px] text-white/40 leading-relaxed line-clamp-1 mb-2">
                                {shortDesc}
                            </p>
                        )}

                        {tags.length > 0 && (
                            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                {visibleTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[10px] px-2 py-0.5 rounded-full text-white/40"
                                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {extraTags > 0 && (
                                    <span className="text-[10px] text-white/25">+{extraTags}</span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-white/30">
                            <span className="flex items-center gap-1 truncate">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <span className="truncate">{location}</span>
                            </span>
                            <span className="flex-shrink-0 flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="18" height="18" x="3" y="4" rx="2"/>
                                    <line x1="3" x2="21" y1="10" y2="10"/>
                                </svg>
                                {formatDate(date)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <span
                className="absolute right-3 top-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                    background: isPaid
                        ? "rgba(245,158,11,0.1)"
                        : "rgba(34,197,94,0.1)",
                    border: `1px solid ${isPaid ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.2)"}`,
                    color: isPaid ? "#f59e0b" : "#22c55e",
                }}
            >
                {isPaid ? `₹${price.toLocaleString("en-IN")}` : "Free"}
            </span>
        </Link>
    );
}
