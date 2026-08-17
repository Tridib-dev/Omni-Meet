"use client";

import type { NormalizedEventMode } from "@/lib/event-dashboard/mode";
import type { AccessibleDashboardEvent, EventDashboardContext } from "@/lib/event-dashboard/access";
import { EventDashboardProvider } from "@/components/event-dashboard/shell/EventDashboardProvider";
import EventDashboardShellInner from "@/components/event-dashboard/shell/EventDashboardShellInner";

export default function EventDashboardShell({
    context,
    accessibleEvents,
    children,
}: {
    context: EventDashboardContext;
    accessibleEvents: AccessibleDashboardEvent[];
    children: React.ReactNode;
}) {
    return (
        <EventDashboardProvider context={context} accessibleEvents={accessibleEvents}>
            <EventDashboardShellInner>{children}</EventDashboardShellInner>
        </EventDashboardProvider>
    );
}

export type { NormalizedEventMode };
