"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeEventMode } from "@/lib/constants/event-mode";

export type DashboardEventCardItem = {
    id: string;
    title: string;
    image: string;
    slug: string;
    href: string;
    location: string;
    date: string;
    time: string;
    organizer: string;
    organizerImage?: string;
    mode: string;
    scope: "attended" | "organized" | "recent";
};

type Props = {
    event: DashboardEventCardItem;
    badgeLabel: string;
    ctaLabel: string;
    compact?: boolean;
};

function formatDateWithYear(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function DashboardEventCard({ event, badgeLabel, ctaLabel, compact = false }: Props) {
    const mode = normalizeEventMode(event.mode);
    const modeLabel = mode === "online" ? "Online" : mode === "hybrid" ? "Hybrid" : "Offline";

    return (
        <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="group h-full"
        >
            <Link
                href={event.href}
                className={compact
                    ? "flex h-full min-h-[242px] w-[min(74vw,248px)] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md sm:w-[236px] lg:w-[232px]"
                    : "flex h-full min-h-[272px] w-[min(84vw,286px)] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md sm:w-[268px]"
                }
            >
                <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                        src={event.image || "https://placehold.co/900x600/0b0f13/444?text=Event"}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes={compact ? "(max-width: 640px) 74vw, 236px" : "(max-width: 640px) 82vw, 260px"}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,15,0.08),rgba(7,9,15,0.45))]" />

                    <div className={compact ? "absolute left-3 top-3 rounded-full border border-[#332be0]/25 bg-[#332be0]/12 px-2 py-0.5 text-[9px] font-semibold text-[#a5a0ff] backdrop-blur-md" : "absolute left-3 top-3 rounded-full border border-[#332be0]/25 bg-[#332be0]/12 px-2.5 py-1 text-[10px] font-semibold text-[#a5a0ff] backdrop-blur-md"}>
                        {badgeLabel}
                    </div>
                </div>

                <div className={compact ? "flex flex-1 flex-col p-3.5" : "flex flex-1 flex-col p-4"}>
                    <div className="flex items-start justify-between gap-3">
                        <h3 className={compact ? "min-w-0 text-[15px] font-semibold tracking-[-0.03em] text-slate-900" : "min-w-0 text-[17px] font-semibold tracking-[-0.03em] text-slate-900"}>
                            {event.title}
                        </h3>

                        <span className={compact ? "inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500" : "inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"}>
                            {modeLabel}
                        </span>
                    </div>

                    <div className={compact ? "mt-2.5 space-y-1.5 text-[11px] text-slate-500" : "mt-3 space-y-2 text-[12px] text-slate-500"}>
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                            <div className="space-y-2.5">
                                <p className="flex items-center gap-1.5">
                                    <MapPin size={compact ? 11 : 12} className="shrink-0" />
                                    <span className="truncate">{event.location}</span>
                                </p>

                                <p className="flex items-center gap-2">
                                    <span className={compact ? "inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-slate-500" : "inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-slate-500"}>
                                        {event.organizerImage ? (
                                            <Image
                                                src={event.organizerImage}
                                                alt={event.organizer}
                                                width={compact ? 20 : 24}
                                                height={compact ? 20 : 24}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User size={compact ? 9 : 10} />
                                        )}
                                    </span>
                                    <span className="truncate">{event.organizer || "Organizer"}</span>
                                </p>
                            </div>

                            <div className="space-y-1.5 lg:text-right">
                                <p className="flex items-center gap-1.5 lg:justify-end">
                                    <Calendar size={compact ? 11 : 12} className="shrink-0" />
                                    <span>{formatDateWithYear(event.date)}</span>
                                </p>
                                <p className="flex items-center gap-1.5 lg:justify-end">
                                    <Clock size={compact ? 11 : 12} className="shrink-0" />
                                    <span>{event.time}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={compact ? "mt-auto pt-3" : "mt-auto pt-4"}>
                        <span className={compact ? "inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#332be0] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_20px_rgba(51,43,224,0.18)] transition-colors hover:bg-[#4c46ff]" : "inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#332be0] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(51,43,224,0.18)] transition-colors hover:bg-[#4c46ff]"}>
                            {ctaLabel} <ArrowRight size={compact ? 14 : 15} />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}
