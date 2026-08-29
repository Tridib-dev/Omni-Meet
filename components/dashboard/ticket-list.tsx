"use client";

// components/dashboard/ticket-list.tsx
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { TicketItem } from "@/lib/actions/dashboard.actions";
import TicketModal from "@/components/dashboard/ticket-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketEventCardV2 } from "./TicketEventCardV2";

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
            <p className="text-[14px] font-medium text-slate-700">{m.title}</p>
            <p className="mt-1 text-[12px] text-slate-500">{m.sub}</p>
            {tab === "upcoming" && (
                <Link
                    href="/events/discover"
                    className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-[12px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
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
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

    const lists: Record<TabKey, TicketItem[]> = { upcoming, past, expired };
    const normalizedQuery = query.trim().toLowerCase();
    const filteredLists = Object.fromEntries(
        TABS.map((tab) => [
            tab.key,
            normalizedQuery
                ? lists[tab.key].filter((ticket) =>
                    [ticket.eventTitle, ticket.eventLocation, ticket.eventOrganizer, ticket.eventCategory]
                        .filter(Boolean)
                        .some((value) => value!.toLowerCase().includes(normalizedQuery))
                )
                : lists[tab.key],
        ])
    ) as Record<TabKey, TicketItem[]>;

    return (
        <div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="w-full">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="relative min-w-0 flex-1 sm:max-w-sm">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search tickets"
                            aria-label="Search tickets"
                            className="h-8 w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[12px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400"
                        />
                    </div>
                    <TabsList className="inline-flex h-8 w-fit shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
                        {TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.key}
                                value={tab.key}
                                className="h-6 flex-none justify-center rounded-md px-2 text-[11px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:px-2.5"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {TABS.map((tab) => (
                    <TabsContent key={tab.key} value={tab.key} className="mt-5">
                        {filteredLists[tab.key].length === 0 ? (
                            normalizedQuery ? (
                                <div className="py-16 text-center text-[13px] text-slate-500">No tickets match your search.</div>
                            ) : (
                                <EmptyState tab={tab.key} />
                            )
                        ) : (
                            <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                <div className="flex gap-3">
                                    {filteredLists[tab.key].map((ticket, index) => (
                                        <TicketEventCardV2 key={ticket.id} ticket={ticket} index={index} onView={setSelectedTicket} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            <TicketModal
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
            />
        </div>
    );
}
