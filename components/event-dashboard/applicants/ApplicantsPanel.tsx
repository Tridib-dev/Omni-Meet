"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DataTable from "@/components/event-dashboard/shared/DataTable";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApplicantFilter, EventApplicantsData } from "@/lib/event-dashboard/applicants";

const FILTERS: { id: ApplicantFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "checked-in", label: "Checked-in" },
    { id: "pending", label: "Pending" },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ApplicantsPanel({
    eventId,
    data,
    initialFilter,
}: {
    eventId: string;
    data: EventApplicantsData;
    initialFilter: ApplicantFilter;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState("");
    const [ticketFilter, setTicketFilter] = useState<"all" | "free" | "paid">("all");

    const filteredRows = useMemo(() => {
        let rows = data.rows;
        if (ticketFilter !== "all") {
            rows = rows.filter((row) => row.type === ticketFilter);
        }
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            rows = rows.filter(
                (row) =>
                    row.email.toLowerCase().includes(q) ||
                    row.name.toLowerCase().includes(q)
            );
        }
        return rows;
    }, [data.rows, query, ticketFilter]);

    function setFilter(filter: ApplicantFilter) {
        const params = new URLSearchParams(searchParams.toString());
        if (filter === "all") {
            params.delete("filter");
        } else {
            params.set("filter", filter);
        }
        router.push(`/dashboard/events/${eventId}/applicants?${params.toString()}`);
    }

    return (
        <div className="space-y-6">
            <PageSection
                title="Applicant list"
                description="Search and filter registrations for this event."
                action={
                    <Tabs
                        value={initialFilter}
                        onValueChange={(value) => setFilter(value as ApplicantFilter)}
                        className="w-fit self-end"
                    >
                        <TabsList className="inline-flex h-8 w-fit items-center justify-center rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
                            {FILTERS.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="h-6 flex-none justify-center rounded-md px-2 text-[11px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:px-2.5"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                }
            >
                <div className="mb-4 flex items-center gap-2 sm:gap-3">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by email…"
                        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400"
                    />
                    <select
                        value={ticketFilter}
                        onChange={(e) => setTicketFilter(e.target.value as "all" | "free" | "paid")}
                        className="h-10 w-[38%] min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-[13px] text-slate-900 outline-none sm:w-auto sm:min-w-[140px] sm:px-3"
                    >
                        <option value="all">All tickets</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>

                <DataTable
                    columns={[
                        {
                            key: "profile",
                            header: "Applicant",
                            cell: (row) => (
                                <div className="flex items-center gap-3">
                                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200">
                                        <Image
                                            src={row.photo || "https://placehold.co/32x32/111318/666?text=?"}
                                            alt={row.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[13px] text-slate-800">{row.name}</p>
                                        <p className="font-mono text-[11px] text-slate-500">{row.email}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: "type",
                            header: "Ticket",
                            cell: (row) => (
                                <Badge variant={row.type === "paid" ? "default" : "secondary"}>
                                    {row.type === "paid" ? "Paid" : "Free"}
                                </Badge>
                            ),
                        },
                        {
                            key: "status",
                            header: "Check-in",
                            cell: (row) =>
                                row.checkedIn ? (
                                    <Badge variant="success">Checked in</Badge>
                                ) : (
                                    <Badge variant="outline">Pending</Badge>
                                ),
                        },
                        {
                            key: "bookedAt",
                            header: "Registered",
                            cell: (row) => (
                                <span className="text-[12px] text-slate-500">{formatDate(row.bookedAt)}</span>
                            ),
                        },
                    ]}
                    rows={filteredRows}
                    emptyMessage="No applicants match your filters."
                />
            </PageSection>
        </div>
    );
}
