import { notFound } from "next/navigation";
import EventHero from "@/components/event-dashboard/shared/EventHero";
import StatCard from "@/components/event-dashboard/shared/StatCard";
import ActionCard from "@/components/event-dashboard/shared/ActionCard";
import ActionCardRail from "@/components/event-dashboard/shared/ActionCardRail";
import ActivityFeed from "@/components/event-dashboard/shared/ActivityFeed";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import { DailyApplicationsChart } from "@/components/event-dashboard/shared/DailyApplicationsChart";
import { Card, CardContent } from "@/components/ui/card";
import { getEventOverview } from "@/lib/event-dashboard/overview";
import { getActionRailItems } from "@/lib/event-dashboard/navigation";
import { getOperationsForMode } from "@/lib/event-dashboard/mode";
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
    const operations = getOperationsForMode(data.event.normalizedMode);

    return (
        <div className="space-y-7">
            <EventHero
                title={data.event.title}
                category={data.event.category}
                date={data.event.date}
                time={data.event.time}
            />

            <section className="grid grid-cols-3 gap-3">
                <StatCard
                    label="Applicants"
                    value={data.applicantCount}
                    sub="Total registrations"
                    href={`${base}/applicants`}
                    accent={edTokens.info}
                />
                <StatCard
                    label="Analytics"
                    value={data.analyticsScore}
                    sub="Overall Score"
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
                <div className={`grid gap-3 ${operations.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {operations.includes("gate") && (
                        <ActionCard
                            title="Gate"
                            description="Scan tickets, verify attendees, and manage check-ins."
                            href={`${base}/operations/gate`}
                            eventId={eventId}
                            pageId="overview"
                            compact
                        />
                    )}
                    {operations.includes("room") && (
                        <ActionCard
                            title="Room"
                            description="Control the live room, stage, and online experience."
                            href={`${base}/operations/room`}
                            eventId={eventId}
                            pageId="overview"
                            compact
                        />
                    )}
                </div>
            </PageSection>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
                <Card className="flex h-full min-h-0 flex-col">
                    <CardContent className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
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
