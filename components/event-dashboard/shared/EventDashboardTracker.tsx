"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

export default function EventDashboardTracker({ eventId }: { eventId: string }) {
    const pathname = usePathname();

    useEffect(() => {
        const page = pathname?.split("/").pop() ?? "overview";
        posthog.capture("event_dashboard_page_view", {
            event_id: eventId,
            page,
            path: pathname,
        });
    }, [eventId, pathname]);

    return null;
}
