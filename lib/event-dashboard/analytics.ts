"use server";

import { cache } from "react";
import { getEventAnalytics, type EventAnalyticsData } from "@/lib/actions/overall-analytics";

export type EventAnalyticsDashboardData = EventAnalyticsData;

export const getEventAnalyticsDashboard = cache(
    async (eventId: string): Promise<EventAnalyticsDashboardData> => {
        return getEventAnalytics(eventId);
    }
);
