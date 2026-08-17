"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import SaveButtonIcon from "@/components/ui/SaveButtonIcon";
import { isEventSaved, toggleWatchlist } from "@/lib/actions/watchlist.actions";
import type { DiscoverCard } from "@/lib/discover-events";

const INDIGO = "#332be0";

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}

function formatDayTime(date: string, time: string) {
    const day = new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
    });

    return `${day}, ${formatDate(date)} · ${time}`;
}

type Props = {
    event: DiscoverCard;
    index: number;
};

export function RecommendedEventCard({ event, index }: Props) {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isSignedIn } = useUser();

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

        setLoading(true);
        const result = await toggleWatchlist(event._id.toString());
        setSaved(result.saved);
        setLoading(false);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="group relative h-full snap-start"
        >
            <Link
                href={`/events/${event.slug}`}
                className="flex h-full min-h-[390px] w-[min(86vw,420px)] flex-none flex-col overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] transition-transform duration-300 hover:-translate-y-1 hover:border-[#332be0]/30"
            >
                <div className="relative h-[240px] overflow-hidden">
                    <Image
                        src={event.image || "https://placehold.co/900x600/0b0f13/444?text=Event"}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 86vw, (max-width: 1024px) 44vw, 420px"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,15,0.05),rgba(7,9,15,0.58))]" />

                    <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="rounded-full border border-[#332be0]/30 bg-[#332be0]/12 px-3 py-1 text-[11px] font-semibold text-[#a5a0ff] backdrop-blur-md">
                            {event.category}
                        </span>
                    </div>

                    <div className="absolute right-4 top-4 flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-md">
                            {event.price > 0 ? `₹${event.price}` : "Free"}
                        </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-[11px] text-white/75">
                                <MapPin size={12} />
                                <span className="truncate">{event.location}</span>
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/65">
                                <Calendar size={12} />
                                <span>{formatDate(event.date)}</span>
                                <Clock size={12} className="ml-1" />
                                <span>{event.time}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/25">
                            Recommended for you
                        </p>
                        <h3 className="line-clamp-2 text-[24px] font-semibold tracking-[-0.03em] text-white/95 sm:text-[26px]">
                            {event.title}
                        </h3>
                    </div>

                    <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-white/42">
                        {formatDayTime(event.date, event.time)}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                        <span className="text-[12px] text-white/35">
                            Tap to open event details
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#332be0]/20 bg-[#332be0]/10 px-3 py-1 text-[12px] font-medium text-[#a5a0ff]">
                            View
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
        </motion.article>
    );
}
