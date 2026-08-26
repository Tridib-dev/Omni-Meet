"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DataTable from "@/components/event-dashboard/shared/DataTable";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import { Badge } from "@/components/ui/badge";
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
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFilter(tab.id)}
                                className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                                    initialFilter === tab.id
                                        ? "bg-[#332be0]/20 text-[#a5a0ff] border border-[#332be0]/30"
                                        : "bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-900"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                }
            >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by email…"
                        className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400"
                    />
                    <select
                        value={ticketFilter}
                        onChange={(e) => setTicketFilter(e.target.value as "all" | "free" | "paid")}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none"
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
