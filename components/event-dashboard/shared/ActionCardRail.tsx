"use client";

import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import ActionCard from "@/components/event-dashboard/shared/ActionCard";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import type { EventDashboardNavItem } from "@/lib/event-dashboard/navigation";

export default function ActionCardRail({
    title = "Get more info",
    description = "Explore every corner of your event dashboard.",
    items,
}: {
    title?: string;
    description?: string;
    items: EventDashboardNavItem[];
}) {
    const { context } = useEventDashboard();
    const pathname = usePathname();
    const pageId = pathname?.split("/").pop() ?? "overview";

    if (!items.length) return null;

    return (
        <PageSection title={title} description={description}>
            <ScrollArea className="pb-2">
                <div className="grid auto-cols-[minmax(220px,240px)] grid-flow-col gap-3">
                    {items.map((item, index) => (
                        <ActionCard
                            key={item.id}
                            title={item.label}
                            description={item.description}
                            href={item.href}
                            index={index}
                            eventId={context.eventId}
                            pageId={pageId}
                        />
                    ))}
                </div>
            </ScrollArea>
        </PageSection>
    );
}
