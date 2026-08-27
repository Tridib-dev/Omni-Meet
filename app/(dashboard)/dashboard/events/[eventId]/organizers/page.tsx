import { notFound } from "next/navigation";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import StatCard from "@/components/event-dashboard/shared/StatCard";
import ActionCardRail from "@/components/event-dashboard/shared/ActionCardRail";
import OrganizersPanel from "@/components/event-dashboard/organizers/OrganizersPanel";
import { getEventOrganizers } from "@/lib/event-dashboard/organizers";
import { getEventDashboardContext } from "@/lib/event-dashboard/access";
import { getActionRailItems } from "@/lib/event-dashboard/navigation";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

export const metadata = { title: "Organizers — Event Dashboard" };

export default async function EventOrganizersPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;
    const context = await getEventDashboardContext(eventId);
    if (!context) notFound();

    const data = await getEventOrganizers(eventId);
    const actionItems = getActionRailItems(eventId, context.normalizedMode, "organizers");

    return (
        <div className="space-y-8">
            <PageSection
                title="Organizers"
                description="Co-organizers and invite status for your event committee."
            />

            <section className="grid grid-cols-2 gap-3">
                <StatCard
                    label="Team size"
                    value={data.committeeSize}
                    sub="Active co-organizers"
                    accent={edTokens.accent}
                />
                <StatCard
                    label="Pending invites"
                    value={data.pendingCount}
                    sub="Awaiting response"
                    accent={edTokens.warning}
                    index={1}
                />
            </section>

            <OrganizersPanel eventId={eventId} data={data} isCreator={context.isCreator} />

            <ActionCardRail items={actionItems} />
        </div>
    );
}
