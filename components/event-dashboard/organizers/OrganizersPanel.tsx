"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import DataTable from "@/components/event-dashboard/shared/DataTable";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import EmptyState from "@/components/event-dashboard/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { removeCoOrganizer } from "@/lib/actions/gate.actions";
import type { EventOrganizersData } from "@/lib/event-dashboard/organizers";
import { AddCoOrganizerModal } from "@/components/profileCard";

type TabId = "all" | "active" | "pending" | "declined";

type CommitteeRow = {
    clerkId: string;
    name: string;
    photo: string;
    status: "active" | "pending" | "declined";
    sinceLabel: string;
    sinceValue: string;
    email?: string;
};

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
    const { user } = useUser();
    const [tab, setTab] = useState<TabId>("all");
    const [pending, startTransition] = useTransition();
    const [inviteOpen, setInviteOpen] = useState(false);

    function refresh() {
        router.refresh();
    }

    function handleRemove(targetClerkId: string) {
        startTransition(async () => {
            await removeCoOrganizer(eventId, targetClerkId);
            refresh();
        });
    }

    const allRows: CommitteeRow[] = [
        ...data.active.map((row) => ({
            clerkId: row.clerkId,
            name: row.name,
            photo: row.photo,
            email: row.email,
            status: "active" as const,
            sinceLabel: "Added",
            sinceValue: row.addedAt,
        })),
        ...data.pending.map((row) => ({
            clerkId: row.clerkId,
            name: row.name,
            photo: row.photo,
            status: "pending" as const,
            sinceLabel: "Invited",
            sinceValue: row.invitedAt,
        })),
        ...data.denied.map((row) => ({
            clerkId: row.clerkId,
            name: row.name,
            photo: row.photo,
            status: "declined" as const,
            sinceLabel: "Responded",
            sinceValue: row.respondedAt ?? row.invitedAt,
        })),
    ];

    const tabs: { id: TabId; label: string; count: number }[] = [
        { id: "all", label: "All", count: allRows.length },
        { id: "active", label: "Active", count: data.active.length },
        { id: "pending", label: "Pending", count: data.pending.length },
        { id: "declined", label: "Declined", count: data.denied.length },
    ];

    return (
        <div className="space-y-6">
            <PageSection
                title="Team Members"
                description="Manage co-organizers and track invite status."
                titleClassName="whitespace-nowrap"
                descriptionClassName="hidden sm:block"
                headerClassName="flex-row items-center justify-between sm:items-start"
                action={
                    <>
                        {isCreator && (
                            <button
                                type="button"
                                onClick={() => setInviteOpen(true)}
                                className="inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(51,43,224,0.22)] transition-colors hover:bg-indigo-700 sm:hidden"
                            >
                                + Add co-organizer
                            </button>
                        )}
                        <div className="hidden flex-col items-end gap-5 sm:flex">
                            {isCreator && (
                                <button
                                    type="button"
                                    onClick={() => setInviteOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(51,43,224,0.22)] transition-colors hover:bg-indigo-700"
                                >
                                    + Add co-organizer
                                </button>
                            )}
                            <Tabs
                                value={tab}
                                onValueChange={(value) => setTab(value as TabId)}
                                className="w-fit self-end"
                            >
                                <TabsList className="inline-flex h-8 w-fit items-center justify-center rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
                                    {tabs.map((item) => (
                                        <TabsTrigger
                                            key={item.id}
                                            value={item.id}
                                            className="h-6 flex-none justify-center rounded-md px-2 text-[11px] leading-none text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:px-2.5"
                                        >
                                            {item.label} ({item.count})
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>
                    </>
                }
            >
                <div className="space-y-6 sm:space-y-0">
                    <Tabs
                        value={tab}
                        onValueChange={(value) => setTab(value as TabId)}
                        className="w-fit sm:hidden"
                    >
                        <TabsList className="inline-flex h-8 w-fit items-center justify-center rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
                            {tabs.map((item) => (
                                <TabsTrigger
                                    key={item.id}
                                    value={item.id}
                                    className="h-6 flex-none justify-center rounded-md px-2 text-[11px] leading-none text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:px-2.5"
                                >
                                    {item.label} ({item.count})
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    {tab === "all" && (
                    <>
                        {allRows.length === 0 ? (
                            <EmptyState title="No co-organizers yet" description="Invite someone to help run this event." />
                        ) : (
                            <DataTable
                                columns={[
                                    {
                                        key: "name",
                                        header: "Invitee",
                                        cell: (row: CommitteeRow) => (
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
                                                    {row.email && <p className="text-[11px] text-slate-500">{row.email}</p>}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "status",
                                        header: "Status",
                                        cell: (row: CommitteeRow) =>
                                            row.status === "active" ? (
                                                <Badge variant="success">Active</Badge>
                                            ) : row.status === "pending" ? (
                                                <Badge variant="secondary">Pending</Badge>
                                            ) : (
                                                <Badge variant="destructive">Declined</Badge>
                                            ),
                                    },
                                    {
                                        key: "since",
                                        header: "Since",
                                        cell: (row: CommitteeRow) => (
                                            <span className="text-[12px] text-slate-500">
                                                {row.sinceLabel} {formatDate(row.sinceValue)}
                                            </span>
                                        ),
                                    },
                                ]}
                                rows={allRows}
                            />
                        )}
                    </>
                )}

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
                                                    <p className="text-[11px] text-slate-500">{row.email}</p>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "addedAt",
                                        header: "Added",
                                        cell: (row) => (
                                            <span className="text-[12px] text-slate-500">{formatDate(row.addedAt)}</span>
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
                                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200">
                                            <Image
                                                src={row.photo || "https://placehold.co/32x32/111318/666?text=?"}
                                                alt={row.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-[13px] text-slate-800">{row.name}</span>
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
                                    <span className="text-[12px] text-slate-500">{formatDate(row.invitedAt)}</span>
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
                                    <span className="text-[13px] text-slate-800">{row.name}</span>
                                ),
                            },
                            {
                                key: "status",
                                header: "Status",
                                cell: () => <Badge variant="destructive">Declined</Badge>,
                            },
                            {
                                key: "respondedAt",
                                header: "Responded",
                                cell: (row) => (
                                    <span className="text-[12px] text-slate-500">
                                        {row.respondedAt ? formatDate(row.respondedAt) : "—"}
                                    </span>
                                ),
                            },
                        ]}
                        rows={data.denied}
                        emptyMessage="No declined invites."
                    />
                    )}
                </div>
            </PageSection>
            <AddCoOrganizerModal
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                viewerClerkId={user?.id ?? ""}
                eventId={eventId}
                onChanged={refresh}
            />
        </div>
    );
}
