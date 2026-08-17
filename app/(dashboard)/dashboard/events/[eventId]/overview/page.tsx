import { notFound } from "next/navigation";
import EventHero from "@/components/event-dashboard/shared/EventHero";
import StatCard from "@/components/event-dashboard/shared/StatCard";
import ActionCard from "@/components/event-dashboard/shared/ActionCard";
import ActionCardRail from "@/components/event-dashboard/shared/ActionCardRail";
import ActivityFeed from "@/components/event-dashboard/shared/ActivityFeed";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import ModeGate from "@/components/event-dashboard/shared/ModeGate";
import { DailyApplicationsChart } from "@/components/event-dashboard/shared/DailyApplicationsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventOverview } from "@/lib/event-dashboard/overview";
import { getActionRailItems } from "@/lib/event-dashboard/navigation";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

export const metadata = { title: "Overview — Event Dashboard" };

export default async function EventOverviewPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;
    const data = await getEventOverview(eventId);

    if (!data.event) notFound();

    const base = `/dashboard/events/${eventId}`;
    const actionItems = getActionRailItems(eventId, data.event.normalizedMode, "overview");

    return (
        <div className="space-y-8">
            <EventHero
                title={data.event.title}
                category={data.event.category}
                date={data.event.date}
                time={data.event.time}
            />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label="Applicants"
                    value={data.applicantCount}
                    sub="Total registrations"
                    href={`${base}/applicants`}
                    accent={edTokens.info}
                />
                <StatCard
                    label="Analytics score"
                    value={data.analyticsScore}
                    sub="Overall event health"
                    href={`${base}/analytics`}
                    accent={edTokens.accent}
                    index={1}
                />
                <StatCard
                    label="Committee"
                    value={data.coOrganizerCount}
                    sub="Co-organizers"
                    href={`${base}/organizers`}
                    accent={edTokens.warning}
                    index={2}
                />
            </section>

            <PageSection title="Operations" description="Run day-of event workflows from here.">
                <div className="grid gap-3 sm:grid-cols-2">
                    <ModeGate mode={data.event.normalizedMode} operation="gate">
                        <ActionCard
                            title="Gate"
                            description="Scan tickets, verify attendees, and manage check-ins."
                            href={`${base}/operations/gate`}
                            eventId={eventId}
                            pageId="overview"
                        />
                    </ModeGate>
                    <ModeGate mode={data.event.normalizedMode} operation="room">
                        <ActionCard
                            title="Room"
                            description="Control the live room, stage, and online experience."
                            href={`${base}/operations/room`}
                            eventId={eventId}
                            pageId="overview"
                        />
                    </ModeGate>
                </div>
            </PageSection>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Day-by-day applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DailyApplicationsChart data={data.dailyApplications} />
                    </CardContent>
                </Card>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {data.keyMetrics.map((metric, index) => (
                        <StatCard
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                            sub={metric.sub}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            <ActivityFeed items={data.recentActivity} />

            <ActionCardRail items={actionItems} />
        </div>
    );
}
