"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import SaveButtonIcon from "@/components/ui/SaveButtonIcon";
import { isEventSaved, toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { normalizeEventMode } from "@/lib/constants/event-mode";
import type { DiscoverCard } from "@/lib/discover-events";

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

    if (!twentyFourHourMatch) {
        return trimmed;
    }

    const hour24 = Number(twentyFourHourMatch[1]);
    const minutes = twentyFourHourMatch[2];
    const meridiem = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;

    return `${String(hour12).padStart(2, "0")}:${minutes} ${meridiem}`;
}

function truncateText(value: string, maxChars: number) {
    const normalized = value.trim().replace(/\s+/g, " ");

    if (normalized.length <= maxChars) {
        return normalized;
    }

    return `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

type Props = {
    event: DiscoverCard;
    index: number;
    compact?: boolean;
};

export function RecommendedEventCard({ event, index, compact = false }: Props) {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isSignedIn } = useUser();
    const mode = normalizeEventMode(event.mode);
    const modeLabel = mode === "online" ? "Online" : mode === "hybrid" ? "Hybrid" : "Offline";
    const timeLabel = formatTime(event.time);
    const description = truncateText(
        event.description || "Discover the event details, plan ahead, and bookmark it for later.",
        48
    );

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (!isSignedIn) {
                if (mounted) setLoading(false);
                return;
            }

            const nextSaved = await isEventSaved(event._id.toString());
            if (mounted) {
                setSaved(nextSaved);
                setLoading(false);
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, [event._id, isSignedIn]);

    const handleToggle = async () => {
        if (!isSignedIn) {
            window.location.href = "/sign-in";
            return;
        }

        const nextSaved = !saved;
        setSaved(nextSaved);
        setLoading(true);
        const result = await toggleWatchlist(event._id.toString());
        if (result.error) {
            setSaved(!nextSaved);
        } else {
            setSaved(result.saved);
        }
        setLoading(false);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className={compact ? "group relative h-full space-y-3 sm:space-y-4" : "group relative h-full space-y-4 sm:space-y-5"}
        >
            <Link
                href={`/events/${event.slug}`}
                className="relative flex h-full w-full overflow-hidden rounded-[30px] border border-white/8 bg-white/[0.03] transition-transform duration-300 hover:-translate-y-1 hover:border-[#332be0]/30"
                style={{ minHeight: compact ? "clamp(248px, 32vw, 390px)" : "clamp(300px, 42vw, 500px)" }}
            >
                <div className="absolute inset-0">
                    <Image
                        src={event.image || "https://placehold.co/1200x700/0b0f13/444?text=Event"}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 1100px"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,15,0.10)_0%,rgba(7,9,15,0.40)_50%,rgba(7,9,15,0.90)_100%)]" />
                </div>

                <div className={compact ? "relative z-10 flex h-full flex-col p-3 sm:p-4 lg:p-5" : "relative z-10 flex h-full flex-col p-4 sm:p-5 lg:p-6"}>
                    <div className="flex items-start justify-between gap-2.5">
                        <span
                            className={
                                compact
                                    ? "inline-flex shrink-0 items-center rounded-full border border-[#332be0]/30 bg-[#332be0]/12 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#b7b3ff] backdrop-blur-md"
                                    : "inline-flex shrink-0 items-center rounded-full border border-[#332be0]/30 bg-[#332be0]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b7b3ff] backdrop-blur-md"
                            }
                        >
                            {event.category}
                        </span>
                    </div>
                </div>
            </Link>

            <div className="absolute right-4 top-4 z-20 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <SaveButtonIcon
                    saved={saved}
                    loading={loading}
                    onToggle={handleToggle}
                    ariaLabel={saved ? "Remove bookmark" : "Bookmark event"}
                    className="border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-md hover:bg-black/60"
                />
            </div>

            <div className={compact ? "w-full px-1 pt-2" : "w-full px-1 pt-3"}>
                <div className="sm:hidden">
                    <div className="min-w-0 space-y-2 text-[11px] sm:text-[12px]">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="min-w-0 text-[20px] font-semibold leading-[1.06] tracking-[-0.04em] text-white">
                                {event.title}
                            </h3>

                            <span className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">
                                {modeLabel}
                            </span>
                        </div>

                        <p className="max-w-[48ch] text-[12px] leading-snug text-white/78 line-clamp-3">
                            {description}
                        </p>

                        <div className="flex items-center gap-2.5 whitespace-nowrap text-white/72">
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar size={13} />
                                <span>{formatDate(event.date)}</span>
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={13} />
                                <span>{timeLabel}</span>
                            </span>
                        </div>

                        <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-white/72">
                            <MapPin size={13} />
                            <span className="truncate">{event.location}</span>
                        </span>
                    </div>
                </div>

                <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-5 sm:gap-y-2.5 sm:text-[12px]">
                    <div className="min-w-0 space-y-2">
                        <h3 className={compact ? "min-w-0 text-[20px] font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-[26px] lg:text-[32px]" : "min-w-0 text-[24px] font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-[31px] lg:text-[38px]"}>
                            {event.title}
                        </h3>

                        <p className={compact ? "max-w-[48ch] text-[12px] leading-snug text-white/78 line-clamp-2" : "max-w-[50ch] text-[13px] leading-snug text-white/78 line-clamp-2"}>
                            {description}
                        </p>

                        <div className="flex items-center gap-2.5 whitespace-nowrap text-white/72">
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar size={13} />
                                <span>{formatDate(event.date)}</span>
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={13} />
                                <span>{timeLabel}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 pt-1 text-right">
                        <span className={compact ? "inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/58" : "inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58"}>
                            {modeLabel}
                        </span>

                        <span className={compact ? "inline-flex min-w-0 items-center justify-end gap-1.5 text-[11px] text-white/72 sm:text-[12px]" : "inline-flex min-w-0 items-center justify-end gap-1.5 text-[12px] text-white/72 sm:text-[13px]"}>
                            <MapPin size={13} />
                            <span className="truncate">{event.location}</span>
                        </span>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
