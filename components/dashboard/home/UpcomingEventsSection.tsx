"use client";

import type { ReactNode } from "react";
import { NativeTabs } from "@/components/uitripled/native-tabs-shadcnui";
import { DashboardEventCard, type DashboardEventCardItem } from "@/components/dashboard/home/DashboardEventCard";

export type UpcomingEventCardItem = DashboardEventCardItem;

type Props = {
    attendedEvents: UpcomingEventCardItem[];
    organizedEvents: UpcomingEventCardItem[];
    compact?: boolean;
};

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <p className="text-[14px] font-medium text-slate-700">{title}</p>
            <p className="mt-1 text-[12px] text-slate-500">{description}</p>
        </div>
    );
}

function Row({ children }: { children: ReactNode }) {
    return (
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3">{children}</div>
        </div>
    );
}

export function UpcomingEventsSection({ attendedEvents, organizedEvents, compact = false }: Props) {
    return (
        <section className={compact ? "space-y-3" : "space-y-4"}>
            <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <h2 className={compact ? "mt-1 text-[16px] font-semibold text-slate-900 sm:text-[20px]" : "mt-1 text-[18px] font-semibold text-slate-900 sm:text-[22px]"}>
                        Upcoming events
                    </h2>
                </div>
            </div>

            <NativeTabs
                defaultValue="attended"
                className="w-full"
                listClassName="rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm"
                triggerClassName={compact ? "rounded-md px-3.5 py-1.5 text-[12px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm" : "rounded-md px-4 py-2 text-[13px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"}
                contentClassName={compact ? "mt-4" : "mt-5"}
                items={[
                    {
                        id: "attended",
                        label: (
                            <span className="inline-flex items-center gap-1.5">
                                Attended
                                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                                    {attendedEvents.length}
                                </span>
                            </span>
                        ),
                        content: attendedEvents.length > 0 ? (
                            <Row>
                                {attendedEvents.map((event) => (
                                    <div key={event.id} className="shrink-0">
                                        <DashboardEventCard
                                            event={event}
                                            badgeLabel="Attended"
                                            ctaLabel="Open"
                                            compact={compact}
                                        />
                                    </div>
                                ))}
                            </Row>
                        ) : (
                            <EmptyState
                                title="No attended events coming up"
                                description="Your upcoming bookings will appear here once you reserve something."
                            />
                        ),
                    },
                    {
                        id: "organized",
                        label: (
                            <span className="inline-flex items-center gap-1.5">
                                Organized
                                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                                    {organizedEvents.length}
                                </span>
                            </span>
                        ),
                        content: organizedEvents.length > 0 ? (
                            <Row>
                                {organizedEvents.map((event) => (
                                    <div key={event.id} className="shrink-0">
                                        <DashboardEventCard
                                            event={event}
                                            badgeLabel="Organized"
                                            ctaLabel="Manage"
                                            compact={compact}
                                        />
                                    </div>
                                ))}
                            </Row>
                        ) : (
                            <EmptyState
                                title="No organized events coming up"
                                description="Once you publish an event with an upcoming date, it will show here."
                            />
                        ),
                    },
                ]}
            />
        </section>
    );
}
