"use client";

import type { ReactNode } from "react";
import { NativeTabs } from "@/components/uitripled/native-tabs-shadcnui";
import { DashboardEventCard, type DashboardEventCardItem } from "@/components/dashboard/home/DashboardEventCard";

export type UpcomingEventCardItem = DashboardEventCardItem;

type Props = {
    attendedEvents: UpcomingEventCardItem[];
    organizedEvents: UpcomingEventCardItem[];
};

function getRelativeLabel(date: string) {
    const eventDate = new Date(date);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfEvent = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const diffDays = Math.round((startOfEvent.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
            <p className="text-[14px] font-medium text-white/65">{title}</p>
            <p className="mt-1 text-[12px] text-white/35">{description}</p>
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

export function UpcomingEventsSection({ attendedEvents, organizedEvents }: Props) {
    return (
        <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                        Upcoming events
                    </p>
                    <h2 className="mt-1 text-[18px] font-semibold text-white/90 sm:text-[22px]">
                        Coming soon
                    </h2>
                </div>
            </div>

            <NativeTabs
                defaultValue="attended"
                className="w-full"
                listClassName="rounded-full border border-white/8 bg-white/[0.04] p-1"
                triggerClassName="rounded-full px-4 py-2 text-[13px]"
                contentClassName="mt-5"
                items={[
                    {
                        id: "attended",
                        label: (
                            <span className="inline-flex items-center gap-1.5">
                                Attended
                                <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-[10px] font-mono text-white/35">
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
                                            topRightLabel={getRelativeLabel(event.date)}
                                            ctaLabel="Open"
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
                                <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-[10px] font-mono text-white/35">
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
                                            topRightLabel={getRelativeLabel(event.date)}
                                            ctaLabel="Manage"
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
