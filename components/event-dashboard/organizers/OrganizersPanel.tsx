"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DataTable from "@/components/event-dashboard/shared/DataTable";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import EmptyState from "@/components/event-dashboard/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { addCoOrganizer, removeCoOrganizer } from "@/lib/actions/gate.actions";
import type { EventOrganizersData } from "@/lib/event-dashboard/organizers";

type TabId = "active" | "pending" | "declined";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function OrganizersPanel({
    eventId,
    data,
    isCreator,
}: {
    eventId: string;
    data: EventOrganizersData;
    isCreator: boolean;
}) {
    const router = useRouter();
    const [tab, setTab] = useState<TabId>("active");
    const [clerkId, setClerkId] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function refresh() {
        router.refresh();
    }

    function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!clerkId.trim()) return;
        setMessage(null);
        startTransition(async () => {
            const result = await addCoOrganizer(eventId, clerkId.trim());
            if (result.success) {
                setClerkId("");
                setMessage("Invite sent successfully.");
                refresh();
            } else {
                setMessage("Could not send invite. Check the Clerk ID and try again.");
            }
        });
    }

    function handleRemove(targetClerkId: string) {
        startTransition(async () => {
            await removeCoOrganizer(eventId, targetClerkId);
            refresh();
        });
    }

    const tabs: { id: TabId; label: string; count: number }[] = [
        { id: "active", label: "Active", count: data.active.length },
        { id: "pending", label: "Pending invites", count: data.pending.length },
        { id: "declined", label: "Declined", count: data.denied.length },
    ];

    return (
        <div className="space-y-6">
            {isCreator && (
                <PageSection title="Invite co-organizer" description="Send an invite by Clerk user ID.">
                    <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row">
                        <input
                            value={clerkId}
                            onChange={(e) => setClerkId(e.target.value)}
                            placeholder="Clerk user ID (user_…)"
                            className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#332be0]/40"
                        />
                        <button
                            type="submit"
                            disabled={pending || !clerkId.trim()}
                            className="h-10 rounded-lg bg-[#332be0] px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-50"
                        >
                            {pending ? "Sending…" : "Send invite"}
                        </button>
                    </form>
                    {message && <p className="mt-2 text-[12px] text-white/50">{message}</p>}
                </PageSection>
            )}

            <PageSection
                title="Committee"
                description="Manage co-organizers and track invite status."
                action={
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setTab(item.id)}
                                className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                                    tab === item.id
                                        ? "bg-[#332be0]/20 text-[#a5a0ff] border border-[#332be0]/30"
                                        : "bg-white/5 text-white/50 border border-white/8 hover:text-white/75"
                                }`}
                            >
                                {item.label} ({item.count})
                            </button>
                        ))}
                    </div>
                }
            >
                {tab === "active" && (
                    <>
                        {data.active.length === 0 ? (
                            <EmptyState title="No co-organizers yet" description="Invite someone to help run this event." />
                        ) : (
                            <DataTable
                                columns={[
                                    {
                                        key: "name",
                                        header: "Organizer",
                                        cell: (row) => (
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10">
                                                    <Image
                                                        src={row.photo || "https://placehold.co/32x32/111318/666?text=?"}
                                                        alt={row.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] text-white/85">{row.name}</p>
                                                    <p className="text-[11px] text-white/35">{row.email}</p>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "addedAt",
                                        header: "Added",
                                        cell: (row) => (
                                            <span className="text-[12px] text-white/45">{formatDate(row.addedAt)}</span>
                                        ),
                                    },
                                    ...(isCreator
                                        ? [
                                              {
                                                  key: "actions",
                                                  header: "",
                                                  cell: (row: (typeof data.active)[0]) => (
                                                      <button
                                                          type="button"
                                                          disabled={pending}
                                                          onClick={() => handleRemove(row.clerkId)}
                                                          className="text-[12px] text-red-400/80 hover:text-red-300"
                                                      >
                                                          Remove
                                                      </button>
                                                  ),
                                              },
                                          ]
                                        : []),
                                ]}
                                rows={data.active}
                            />
                        )}
                    </>
                )}

                {tab === "pending" && (
                    <DataTable
                        columns={[
                            {
                                key: "name",
                                header: "Invitee",
                                cell: (row) => (
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10">
                                            <Image
                                                src={row.photo || "https://placehold.co/32x32/111318/666?text=?"}
                                                alt={row.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-[13px] text-white/85">{row.name}</span>
                                    </div>
                                ),
                            },
                            {
                                key: "status",
                                header: "Status",
                                cell: () => <Badge variant="secondary">Pending</Badge>,
                            },
                            {
                                key: "invitedAt",
                                header: "Invited",
                                cell: (row) => (
                                    <span className="text-[12px] text-white/45">{formatDate(row.invitedAt)}</span>
                                ),
                            },
                        ]}
                        rows={data.pending}
                        emptyMessage="No pending invites."
                    />
                )}

                {tab === "declined" && (
                    <DataTable
                        columns={[
                            {
                                key: "name",
                                header: "Invitee",
                                cell: (row) => (
                                    <span className="text-[13px] text-white/85">{row.name}</span>
                                ),
                            },
                            {
                                key: "status",
                                header: "Status",
                                cell: () => <Badge variant="outline">Declined</Badge>,
                            },
                            {
                                key: "respondedAt",
                                header: "Responded",
                                cell: (row) => (
                                    <span className="text-[12px] text-white/45">
                                        {row.respondedAt ? formatDate(row.respondedAt) : "—"}
                                    </span>
                                ),
                            },
                        ]}
                        rows={data.denied}
                        emptyMessage="No declined invites."
                    />
                )}
            </PageSection>
        </div>
    );
}
