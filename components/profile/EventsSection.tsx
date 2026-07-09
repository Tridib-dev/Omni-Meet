"use client";

// components/profile/EventsSection.tsx
import EventCardH from "../EventCardv3";
import { NativeTabs } from "@/components/uitripled/native-tabs-shadcnui";

type EventItem = {
    _id: string;
    title: string;
    slug: string;
    image: string;
    date: string;
    location: string;
    mode?: string;
    price?: number;
    category?: string;
    description?: string;   
    tags?: string[];        
};

function EventCard({ event }: { event: EventItem }) {
    return (
        <EventCardH
            eventId={event._id}
            slug={event.slug}
            title={event.title}
            description={event.description || ""}     // fallback
            image={event.image}
            category={event.category}
            location={event.location}
            date={event.date}
            tags={event.tags || []}
            price={event.price ?? 0}
            isSaved={false}
        />
    );
}

function EmptyState({ tab }: { tab: string }) {
    return (
        <div className="py-12 text-center">
            <p className="text-[13px] text-white/30">
                {tab === "organized"
                    ? "No events organized yet."
                    : "No events attended yet."}
            </p>
        </div>
    );
}

const TABS = [
    { key: "attended",  label: "Attended" },
    { key: "organized", label: "Organized" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function EventsSection({
    attendedEvents,
    organizedEvents,
}: {
    attendedEvents: EventItem[];
    organizedEvents: EventItem[];
}) {
    const lists: Record<TabKey, EventItem[]> = {
        attended: attendedEvents,
        organized: organizedEvents,
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Events
                </p>
                <span className="text-[11px] text-white/25 font-mono">
                    {lists.attended.length + lists.organized.length} total
                </span>
            </div>

            <NativeTabs
                defaultValue="attended"
                className="w-full"
                listClassName="w-full max-w-fit"
                triggerClassName="min-w-[92px]"
                contentClassName="mt-5"
                items={TABS.map((tab) => ({
                    id: tab.key,
                    label: (
                        <span className="inline-flex items-center gap-1.5">
                            {tab.label}
                            {lists[tab.key].length > 0 && (
                                <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-[10px] font-mono text-white/35">
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
                                lists[tab.key].map((ev) => (
                                    <div key={ev._id}>
                                        <EventCard event={ev} />
                                    </div>
                                ))
                            )}
                        </div>
                    ),
                }))}
            />
        </div>
    );
}
