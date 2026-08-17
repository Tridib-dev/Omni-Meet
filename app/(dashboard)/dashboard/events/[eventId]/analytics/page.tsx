import { notFound } from "next/navigation";
import EventAnalyticsView from "@/components/event-dashboard/analytics/EventAnalyticsView";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import { getEventAnalyticsDashboard } from "@/lib/event-dashboard/analytics";
import { getEventDashboardContext } from "@/lib/event-dashboard/access";
import { getActionRailItems } from "@/lib/event-dashboard/navigation";

export const metadata = { title: "Analytics — Event Dashboard" };

export default async function EventAnalyticsPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;
    const context = await getEventDashboardContext(eventId);
    if (!context) notFound();

    const data = await getEventAnalyticsDashboard(eventId);
    if (!data.event) notFound();

    const actionItems = getActionRailItems(eventId, context.normalizedMode, "analytics");

    return (
        <div className="space-y-8">
            <PageSection
                title="Analytics"
                description="Deep performance analysis for this event."
            />
            <EventAnalyticsView data={data} actionItems={actionItems} />
        </div>
    );
}
