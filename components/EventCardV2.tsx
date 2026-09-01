"use client";

// components/EventCardH.tsx
// Horizontal saved-event card for the light dashboard surface.

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
        <article className="group relative flex min-w-0 gap-3.5 rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md sm:gap-4">
            <Link href={`/events/${slug}`} className="contents">
            {/* Left — Event image */}
            <div className="relative min-h-[108px] w-[112px] shrink-0 self-stretch overflow-hidden rounded-[13px] bg-slate-100 sm:w-[136px]">
                <SafeImage
                    src={image}
                    alt={title}
                    fill
                    fallback="https://placehold.co/136x108/f1f5f9/475569?text=Event"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
            </div>

            {/* Right — Content */}
            <div className="flex min-w-0 flex-1 pr-12 sm:pr-14">
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div>
                        {category && (
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
                                {category}
                            </p>
                        )}

                        <h3 className="mb-1 line-clamp-1 text-[14px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-indigo-700 sm:text-[15px]">
                            {title}
                        </h3>

                        {shortDesc && (
                            <p className="mb-2 line-clamp-1 text-[12px] leading-relaxed text-slate-500">
                                {shortDesc}
                            </p>
                        )}

                        {tags.length > 0 && (
                            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                                {visibleTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {extraTags > 0 && (
                                    <span className="text-[10px] text-slate-400">+{extraTags}</span>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500">
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

            </Link>

            <span
                className={isPaid
                    ? "absolute right-3 top-3 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                    : "absolute right-3 top-3 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                }
            >
                {isPaid ? `₹${price.toLocaleString("en-IN")}` : "Free"}
            </span>

            <SaveButtonIcon
                saved={saved}
                loading={saving}
                onToggle={handleBookmarkToggle}
                ariaLabel={saved ? "Remove from saved" : "Save event"}
                className="absolute bottom-3 right-3 h-10 w-10 justify-center rounded-full border border-slate-200 bg-white px-0 py-0 text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            />
        </article>
    );
}
