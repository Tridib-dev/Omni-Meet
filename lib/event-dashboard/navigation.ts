import type { NormalizedEventMode, OperationSlug } from "@/lib/event-dashboard/mode";
import { getOperationsForMode } from "@/lib/event-dashboard/mode";

export type EventDashboardPageId =
    | "overview"
    | "applicants"
    | "organizers"
    | "analytics"
    | "gate"
    | "room"
    | "settings";

export interface EventDashboardNavItem {
    id: EventDashboardPageId;
    label: string;
    href: string;
    section?: "main" | "operations" | "settings";
    description?: string;
}

function eventBase(eventId: string) {
    return `/dashboard/events/${eventId}`;
}

export function getEventDashboardNav(
    eventId: string,
    mode: NormalizedEventMode
): EventDashboardNavItem[] {
    const base = eventBase(eventId);
    const operations = getOperationsForMode(mode);

    const main: EventDashboardNavItem[] = [
        {
            id: "overview",
            label: "Overview",
            href: `${base}/overview`,
            section: "main",
            description: "Event snapshot, metrics, and recent activity",
        },
        {
            id: "applicants",
            label: "Applicants",
            href: `${base}/applicants`,
            section: "main",
            description: "Manage registrations and check-ins",
        },
        {
            id: "organizers",
            label: "Organizers",
            href: `${base}/organizers`,
            section: "main",
            description: "Co-organizers and invite status",
        },
        {
            id: "analytics",
            label: "Analytics",
            href: `${base}/analytics`,
            section: "main",
            description: "Deep event performance analysis",
        },
    ];

    const operationItems: EventDashboardNavItem[] = operations.map((op) => ({
        id: op,
        label: op === "gate" ? "Gate" : "Room",
        href: `${base}/operations/${op}`,
        section: "operations" as const,
        description: op === "gate" ? "Check-in and attendee verification" : "Live room controls",
    }));

    const settings: EventDashboardNavItem = {
        id: "settings",
        label: "Settings",
        href: `${base}/settings`,
        section: "settings",
        description: "Event configuration",
    };

    return [...main, ...operationItems, settings];
}

export function getActionRailItems(
    eventId: string,
    mode: NormalizedEventMode,
    excludePage?: EventDashboardPageId
): EventDashboardNavItem[] {
    return getEventDashboardNav(eventId, mode).filter((item) => item.id !== excludePage);
}

export function getOperationLabel(operation: OperationSlug): string {
    return operation === "gate" ? "Gate" : "Room";
}
