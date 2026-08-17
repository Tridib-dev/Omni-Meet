"use client";

import { usePathname } from "next/navigation";
import ActionCard from "@/components/event-dashboard/shared/ActionCard";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import type { EventDashboardNavItem } from "@/lib/event-dashboard/navigation";
import HorizontalScrollProgress from "@/components/event-dashboard/shared/HorizontalScrollProgress";

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
        <PageSection title={title} description={description} className="mt-8">
            <HorizontalScrollProgress className="pt-1" contentClassName="pb-1">
                <div className="grid auto-cols-[240px] grid-flow-col items-stretch gap-3">
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
            </HorizontalScrollProgress>
        </PageSection>
    );
}
