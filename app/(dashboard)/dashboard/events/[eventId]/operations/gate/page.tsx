import { notFound, redirect } from "next/navigation";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import ActionCardRail from "@/components/event-dashboard/shared/ActionCardRail";
import DashboardGate from "@/components/gate/DashboardGate";
import { getEventDashboardContext } from "@/lib/event-dashboard/access";
import { getActionRailItems } from "@/lib/event-dashboard/navigation";
import { isOperationAvailable } from "@/lib/event-dashboard/mode";

export const metadata = { title: "Gate — Event Dashboard" };

export default async function EventGatePage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;
    const context = await getEventDashboardContext(eventId);
    if (!context) notFound();

    if (!isOperationAvailable(context.normalizedMode, "gate")) {
        redirect(`/dashboard/events/${eventId}/overview`);
    }

    const actionItems = getActionRailItems(eventId, context.normalizedMode, "gate");

    return (
        <div className="space-y-8">
            <PageSection
                title="Gate"
                description="Scan tickets, verify attendees, and manage check-ins."
            />

            <DashboardGate eventId={context.eventId} eventSlug={context.slug} />

            <ActionCardRail items={actionItems} />
        </div>
    );
}
