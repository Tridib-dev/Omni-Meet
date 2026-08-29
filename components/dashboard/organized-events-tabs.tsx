"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SafeImage from "@/components/dashboard/savedPage";
import type { OrganizedEventItem } from "@/lib/actions/dashboard.actions";

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function OrganizedStats({ events }: { events: OrganizedEventItem[] }) {
    const live = events.filter((e) => e.status === "upcoming").length;
    const totalAttendees = events.reduce((s, e) => s + e.attendeeCount, 0);
    const totalRevenue = events.reduce((s, e) => s + e.revenue, 0);

    return (
        <div className="mb-6 grid grid-cols-3 gap-3">
            {[
                { label: "Live events", value: live, color: "#22c55e" },
                { label: "Total attendees", value: totalAttendees, color: "#06b6d4" },
                { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "#f59e0b" },
            ].map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4"
                >
                    <p className="mb-1 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">{stat.label}</p>
                        <p className="truncate text-[17px] font-semibold sm:text-[21px]" style={{ color: stat.color }}>
                        {stat.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

function OrganizedEventGrid({
    events,
    emptyTitle,
    emptyDescription,
    showCreateLink = false,
}: {
    events: OrganizedEventItem[];
    emptyTitle: string;
    emptyDescription: string;
    showCreateLink?: boolean;
}) {
    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-4xl mb-3">📅</span>
                <p className="text-[14px] font-medium text-slate-700">{emptyTitle}</p>
                <p className="mt-1 text-[12px] text-slate-500">{emptyDescription}</p>
                {showCreateLink && (
                    <Link
                        href="/create_event"
                        className="mt-4 rounded-xl border border-[#332be0]/30 bg-[#332be0] px-4 py-2 text-[12px] font-medium text-white shadow-[0_8px_20px_rgba(51,43,224,0.22)] transition-colors hover:bg-[#2b24c8] active:scale-95"
                    >
                        Create your first event →
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(200px,340px))] sm:justify-start">
            {events.map((ev) => (
                <div
                    key={ev.id}
                    className="group flex w-full max-w-[340px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="relative h-32 flex-shrink-0 overflow-hidden sm:h-36">
                        <SafeImage
                            src={ev.image}
                            alt={ev.title}
                            fill
                            fallback="https://placehold.co/600x200/0b0f13/444?text=Event"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span
                            className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                                background: ev.status === "upcoming" ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.15)",
                                border: `1px solid ${ev.status === "upcoming" ? "rgba(34,197,94,0.3)" : "rgba(107,114,128,0.2)"}`,
                                color: ev.status === "upcoming" ? "#22c55e" : "#6b7280",
                            }}
                        >
                            {ev.status === "upcoming" ? "Live" : "Ended"}
                        </span>
                        <span
                            className="absolute top-3 right-3 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full"
                            style={{
                                background: "rgba(0,0,0,0.6)",
                                color: ev.price > 0 ? "#f59e0b" : "#22c55e",
                            }}
                        >
                            {ev.price > 0 ? `₹${ev.price}` : "Free"}
                        </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="mb-1 line-clamp-1 text-[14px] font-medium text-slate-900">
                            {ev.title}
                        </h3>
                        <p className="mb-4 line-clamp-2 text-[12px] text-slate-500">
                            {formatDate(ev.date)} · {ev.location}
                        </p>

                        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                            <span className="text-slate-500">
                                <span className="font-medium text-slate-900">{ev.attendeeCount}</span> attendees
                            </span>
                            {ev.price > 0 && (
                                <span className="text-slate-500">
                                    <span className="font-medium text-amber-600">₹{ev.revenue.toLocaleString("en-IN")}</span> revenue
                                </span>
                            )}
                        </div>

                        <div className="mt-auto flex items-center gap-2">
                            <Link
                                href={`/dashboard/events/${ev.id}/overview`}
                                className="flex-1 rounded-xl border border-[#332be0]/30 bg-[#332be0] py-2 text-center text-[12px] font-medium text-white shadow-[0_8px_20px_rgba(51,43,224,0.22)] transition-colors hover:bg-[#2b24c8] active:scale-95"
                            >
                                Manage event →
                            </Link>
                            <Link
                                href={`/events/${ev.slug}`}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                title="View event"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" x2="21" y1="14" y2="3"/>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function OrganizedEventsTabs({
    organizedEvents,
    coOrganizedEvents,
}: {
    organizedEvents: OrganizedEventItem[];
    coOrganizedEvents: OrganizedEventItem[];
}) {
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"organized" | "coOrganized">("organized");
    const normalizedQuery = query.trim().toLowerCase();
    const filterEvents = (events: OrganizedEventItem[]) => normalizedQuery
        ? events.filter((event) =>
            [event.title, event.location, event.organizer]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedQuery))
        )
        : events;
    const filteredOrganizedEvents = filterEvents(organizedEvents);
    const filteredCoOrganizedEvents = filterEvents(coOrganizedEvents);

    return (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "organized" | "coOrganized")} className="w-full">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="relative min-w-0 flex-1 sm:max-w-sm">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search events"
                        aria-label="Search events"
                        className="h-8 w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[12px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400"
                    />
                </div>
                <TabsList className="inline-flex h-8 w-fit shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
                    <TabsTrigger value="organized" className="h-6 flex-none justify-center rounded-md px-2 text-[11px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:px-2.5">
                        Organized
                    </TabsTrigger>
                    <TabsTrigger value="coOrganized" className="h-6 flex-none justify-center rounded-md px-2 text-[11px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:px-2.5">
                        Co-Organized
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="organized" className="mt-4">
                {organizedEvents.length > 0 && <OrganizedStats events={organizedEvents} />}
                {filteredOrganizedEvents.length === 0 && normalizedQuery ? (
                    <div className="py-16 text-center text-[13px] text-slate-500">No events match your search.</div>
                ) : (
                    <OrganizedEventGrid
                        events={filteredOrganizedEvents}
                        emptyTitle="No events yet"
                        emptyDescription="Create your first event and start managing attendees."
                        showCreateLink
                    />
                )}
            </TabsContent>

            <TabsContent value="coOrganized" className="mt-4">
                {filteredCoOrganizedEvents.length === 0 && normalizedQuery ? (
                    <div className="py-16 text-center text-[13px] text-slate-500">No events match your search.</div>
                ) : (
                    <OrganizedEventGrid
                        events={filteredCoOrganizedEvents}
                        emptyTitle="No co-organized events yet"
                        emptyDescription="Events you co-organize will appear here after you accept an invite."
                    />
                )}
            </TabsContent>
        </Tabs>
    );
}
