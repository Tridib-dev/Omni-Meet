import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import StatCard from "@/components/event-dashboard/shared/StatCard";
import ActionCardRail from "@/components/event-dashboard/shared/ActionCardRail";
import ApplicantsPanel from "@/components/event-dashboard/applicants/ApplicantsPanel";
import { getEventApplicants, type ApplicantFilter } from "@/lib/event-dashboard/applicants";
import { getEventDashboardContext } from "@/lib/event-dashboard/access";
import { getActionRailItems } from "@/lib/event-dashboard/navigation";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

export const metadata = { title: "Applicants — Event Dashboard" };

const VALID_FILTERS = new Set<ApplicantFilter>(["all", "checked-in", "pending"]);

export default async function EventApplicantsPage({
    params,
    searchParams,
}: {
    params: Promise<{ eventId: string }>;
    searchParams: Promise<{ filter?: string }>;
}) {
    const { eventId } = await params;
    const { filter: rawFilter } = await searchParams;
    const filter: ApplicantFilter = VALID_FILTERS.has(rawFilter as ApplicantFilter)
        ? (rawFilter as ApplicantFilter)
        : "all";

    const context = await getEventDashboardContext(eventId);
    if (!context) notFound();

    const data = await getEventApplicants(eventId, filter);
    const actionItems = getActionRailItems(eventId, context.normalizedMode, "applicants");

    return (
        <div className="space-y-8">
            <PageSection
                title="Applicants"
                description="Registrations, check-ins, and ticket types for this event."
            />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Total" value={data.total} sub="All registrations" accent={edTokens.info} />
                <StatCard
                    label="Check-in rate"
                    value={`${data.checkinRate}%`}
                    sub={`${data.checkedIn} checked in`}
                    accent={edTokens.success}
                    index={1}
                />
                <StatCard
                    label="Today's signups"
                    value={data.todaySignups}
                    sub="Since midnight"
                    accent={edTokens.warning}
                    index={2}
                />
            </section>

            <Suspense fallback={<div className="text-white/40">Loading applicants…</div>}>
                <ApplicantsPanel eventId={eventId} data={data} initialFilter={filter} />
            </Suspense>

            <ActionCardRail items={actionItems} />
        </div>
    );
}
