"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";
import type { TicketItem } from "@/lib/actions/dashboard.actions";
import { normalizeEventMode } from "@/lib/constants/event-mode";

const STATUS_COLORS = {
    upcoming: { dot: "#22c55e", label: "Upcoming", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.20)" },
    past: { dot: "#0891b2", label: "Attended", bg: "rgba(6,182,212,0.10)", border: "rgba(6,182,212,0.20)" },
    expired: { dot: "#64748b", label: "Expired", bg: "rgba(100,116,139,0.10)", border: "rgba(100,116,139,0.18)" },
};

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

type Props = {
    ticket: TicketItem;
    index: number;
    onView: (ticket: TicketItem) => void;
};

export function TicketEventCardV2({ ticket, index, onView }: Props) {
    const status = STATUS_COLORS[ticket.status];
    const mode = normalizeEventMode(ticket.eventMode);
    const modeLabel = mode === "online" ? "Online" : mode === "hybrid" ? "Hybrid" : "Offline";

    return (
        <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="group h-full w-[min(74vw,248px)] shrink-0 sm:w-[236px] lg:w-[232px]"
        >
            <div className="flex h-full min-h-[242px] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
                <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                        src={ticket.eventImage || "https://placehold.co/900x600/f1f5f9/475569?text=Event"}
                        alt={ticket.eventTitle}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 74vw, 236px"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,15,0.06),rgba(7,9,15,0.42))]" />

                    <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold backdrop-blur-md"
                        style={{ background: status.bg, borderColor: status.border, color: status.dot }}
                    >
                        <span className="size-1 rounded-full" style={{ background: status.dot }} />
                        {status.label}
                    </span>
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                    <div className="flex min-h-[2.5rem] items-start justify-between gap-3">
                        <Link
                            href={`/events/${ticket.eventSlug}`}
                            className="line-clamp-2 min-w-0 flex-1 text-[15px] font-semibold leading-5 tracking-[-0.03em] text-slate-900 transition-colors hover:text-indigo-700"
                        >
                            {ticket.eventTitle}
                        </Link>
                        <span className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {modeLabel}
                        </span>
                    </div>

                    <div className="mt-2.5 grid gap-3 text-[11px] text-slate-500 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                        <div className="space-y-2">
                            <p className="flex items-center gap-1.5">
                                <MapPin size={11} className="shrink-0" />
                                <span className="truncate">{ticket.eventLocation}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                                <span className="inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                                    {ticket.eventOrganizerImage ? (
                                        <Image
                                            src={ticket.eventOrganizerImage}
                                            alt={ticket.eventOrganizer || "Organizer"}
                                            width={20}
                                            height={20}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User size={9} />
                                    )}
                                </span>
                                <span className="truncate">{ticket.eventOrganizer || "Organizer"}</span>
                            </p>
                        </div>

                        <div className="space-y-2 lg:text-right">
                            <p className="flex items-center gap-1.5 lg:justify-end">
                                <Calendar size={11} className="shrink-0" />
                                <span>{formatDate(ticket.eventDate)}</span>
                            </p>
                            <p className="flex items-center gap-1.5 lg:justify-end">
                                <Clock size={11} className="shrink-0" />
                                <span>{ticket.eventTime}</span>
                            </p>
                        </div>
                    </div>

                    {ticket.checkedIn && (
                        <p className="mt-2.5 text-[10px] font-medium text-emerald-600">Checked in</p>
                    )}

                    <div className="mt-auto flex items-center gap-2 pt-3">
                        <button
                            onClick={() => onView(ticket)}
                            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#332be0] px-3 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_20px_rgba(51,43,224,0.18)] transition-colors hover:bg-[#4c46ff]"
                        >
                            View ticket
                        </button>
                        <Link
                            href={`/events/${ticket.eventSlug}`}
                            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            title="View event"
                            aria-label={`View ${ticket.eventTitle}`}
                        >
                            <ArrowUpRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
