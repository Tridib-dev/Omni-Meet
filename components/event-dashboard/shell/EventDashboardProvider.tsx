"use client";

import { createContext, useContext } from "react";
import type { AccessibleDashboardEvent, EventDashboardContext } from "@/lib/event-dashboard/access";

interface EventDashboardProviderValue {
    context: EventDashboardContext;
    accessibleEvents: AccessibleDashboardEvent[];
}

const EventDashboardContextClient = createContext<EventDashboardProviderValue | null>(null);

export function EventDashboardProvider({
    context,
    accessibleEvents,
    children,
}: EventDashboardProviderValue & { children: React.ReactNode }) {
    return (
        <EventDashboardContextClient.Provider value={{ context, accessibleEvents }}>
            {children}
        </EventDashboardContextClient.Provider>
    );
}

export function useEventDashboard() {
    const value = useContext(EventDashboardContextClient);
    if (!value) {
        throw new Error("useEventDashboard must be used within EventDashboardProvider");
    }
    return value;
}
