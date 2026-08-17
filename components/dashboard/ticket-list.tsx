"use client";

// components/dashboard/ticket-list.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { TicketItem } from "@/lib/actions/dashboard.actions";
import TicketModal from "@/components/dashboard/ticket-modal";
import { NativeTabs } from "../uitripled/native-tabs-shadcnui";


const STATUS_COLORS = {
    upcoming: { dot: "#22c55e", label: "Upcoming", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
    past:     { dot: "#06b6d4", label: "Attended",  bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
    expired:  { dot: "#6b7280", label: "Expired",   bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.12)" },
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

// ─── Single Ticket Card ───────────────────────────────────────────────────────
function TicketCard({ ticket, index, onView }: { 
    ticket: TicketItem; 
    index: number;
    onView: (ticket: TicketItem) => void;
}) {
    const statusStyle = STATUS_COLORS[ticket.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:gap-4 sm:p-4"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
            }}
        >
            {/* Event image */}
            <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg bg-white/5 sm:h-20 sm:w-20">
                <Image
                    src={ticket.eventImage}
                    alt={ticket.eventTitle}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                            "https://placehold.co/80x80/0b0f13/444?text=Event";
                    }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <Link
                        href={`/events/${ticket.eventSlug}`}
                        className="line-clamp-2 text-[14px] font-medium leading-snug text-white/90 transition-colors hover:text-cyan-400 sm:line-clamp-1"
                    >
                        {ticket.eventTitle}
                    </Link>

                    {/* Status chip */}
                    <span
                        className="flex w-fit flex-shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                            background: statusStyle.bg,
                            border: `1px solid ${statusStyle.border}`,
                            color: statusStyle.dot,
                        }}
                    >
                        <span className="w-1 h-1 rounded-full" style={{ background: statusStyle.dot }} />
                        {statusStyle.label}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-white/35">
                    <span className="flex min-w-0 items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {formatDate(ticket.eventDate)} · {ticket.eventTime}
                    </span>
                    <span className="flex min-w-0 items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {ticket.eventLocation}
                    </span>
                    <span className="font-mono text-[11px]">
                        {ticket.type === "paid" ? `₹${ticket.price.toLocaleString("en-IN")}` : "Free"}
                    </span>
                </div>

                {/* Ticket ID */}
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/20">
                        #{ticket.id.slice(-10).toUpperCase()}
                    </span>
                    {ticket.checkedIn && (
                        <span className="text-[10px] text-emerald-400 font-medium">✓ Checked in</span>
                    )}
                </div>

                <button
                    onClick={(e) => { e.preventDefault(); onView(ticket); }}
                    className="mt-2 text-[11px] text-cyan-500/70 hover:text-cyan-400 transition-colors"
                >
                    View ticket →
                </button>
            </div>
        </motion.div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
    const messages: Record<string, { emoji: string; title: string; sub: string }> = {
        upcoming: { emoji: "🎟️", title: "No upcoming tickets", sub: "Browse events and book your next one." },
        past:     { emoji: "✅", title: "No attended events yet", sub: "Your attended events will appear here." },
        expired:  { emoji: "📦", title: "No expired tickets", sub: "Old tickets are archived here." },
    };
    const m = messages[tab];
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">{m.emoji}</span>
            <p className="text-[14px] font-medium text-white/50">{m.title}</p>
            <p className="text-[12px] text-white/25 mt-1">{m.sub}</p>
            {tab === "upcoming" && (
                <Link
                    href="/events/discover"
                    className="mt-4 px-4 py-2 rounded-lg text-[12px] font-medium text-white/70 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                    Discover events →
                </Link>
            )}
        </div>
    );
}
// ─── Tab bar + list ───────────────────────────────────────────────────────────
const TABS = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past",     label: "Attended" },
    { key: "expired",  label: "Expired"  },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function TicketList({
    upcoming, past, expired,
}: {
    upcoming: TicketItem[];
    past: TicketItem[];
    expired: TicketItem[];
}) {
    const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

    const lists: Record<TabKey, TicketItem[]> = { upcoming, past, expired };

    // Prepare items for NativeTabs
    const tabItems = TABS.map((tab) => ({
        id: tab.key,
        label: (
            <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {lists[tab.key].length > 0 && (
                    <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.3)",
                        }}
                    >
                        {lists[tab.key].length}
                    </span>
                )}
            </span>
        ),
        content: (
            <div className="space-y-3">
                {lists[tab.key].length === 0 ? (
                    <EmptyState tab={tab.key} />
                ) : (
                    lists[tab.key].map((ticket, i) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            index={i}
                            onView={setSelectedTicket}
                        />
                    ))
                )}
            </div>
        ),
    }));

    return (
        <div>
            <NativeTabs
                items={tabItems}
                defaultValue="upcoming"
                className="w-full"
                listClassName="max-w-full"
                triggerClassName="min-w-[92px]"
                contentClassName="mt-5"
            />

            <TicketModal
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
            />
        </div>
    );
}
