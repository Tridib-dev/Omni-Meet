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

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
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
                    <div className="flex items-start justify-between gap-3">
                        <span className={compact ? "rounded-full border border-[#332be0]/30 bg-[#332be0]/12 px-2.5 py-1 text-[10px] font-semibold text-[#a5a0ff] backdrop-blur-md" : "rounded-full border border-[#332be0]/30 bg-[#332be0]/12 px-3 py-1 text-[11px] font-semibold text-[#a5a0ff] backdrop-blur-md"}>
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
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-end">
                    <div className="space-y-2.5">
                        <h3 className={compact ? "max-w-2xl text-[21px] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-[28px] lg:text-[34px]" : "max-w-2xl text-[26px] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-[34px] lg:text-[42px]"}>
                            {event.title}
                        </h3>
                        <p className={compact ? "max-w-2xl text-[12px] leading-relaxed text-white/82 sm:text-[13px] lg:text-[14px]" : "max-w-2xl text-[13px] leading-relaxed text-white/82 sm:text-[14px] lg:text-[15px]"}>
                            {event.description || "Discover the event details, plan ahead, and bookmark it for later."}
                        </p>
                    </div>

                    <div className={compact ? "grid gap-2 text-[11px] text-white/78 sm:text-[12px] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-4 lg:gap-y-2" : "grid gap-2 text-[12px] text-white/78 sm:text-[13px] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-5 lg:gap-y-2"}>
                        <span className="flex min-w-0 items-center gap-1.5 lg:col-span-2">
                            <MapPin size={13} />
                            <span className="truncate">{event.location}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            <span>{event.time}</span>
                        </span>
                        <span className="flex items-center gap-1.5 lg:justify-end">
                            <Calendar size={13} />
                            <span>{formatDate(event.date)}</span>
                        </span>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
