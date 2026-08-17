import { HomeQuickActions } from "@/components/dashboard/home/HomeQuickActions";
import { RecommendedEventsCarousel } from "@/components/dashboard/home/RecommendedEventsCarousel";
import { UpcomingEventsSection, type UpcomingEventCardItem } from "@/components/dashboard/home/UpcomingEventsSection";
import { PersonalAnalyticsSummary } from "@/components/dashboard/analytics/PersonalAnalyticsSummary";
import { MonthlyOverviewSection } from "@/components/dashboard/analytics/MonthlyOverviewSection";
import { NativeTabs } from "@/components/uitripled/native-tabs-shadcnui";
import type { AttendedAnalyticsData, OrganizedAnalyticsData } from "@/lib/actions/overall-analytics";
import type { DiscoverCard } from "@/lib/discover-events";
import Image from "next/image";

type DashboardHomeProps = {
    userName: string;
    userImage?: string;
    recommendedEvents: DiscoverCard[];
    attendedEvents: UpcomingEventCardItem[];
    organizedEvents: UpcomingEventCardItem[];
    personalAnalytics: {
        attended: number;
        organized: number;
        spendings: number;
        revenue: number;
    };
    attendedAnalytics: Pick<AttendedAnalyticsData, "monthlyActivity" | "modeBreakdown" | "thisMonth" | "thisYear">;
    organizedAnalytics: Pick<OrganizedAnalyticsData, "monthlyActivity" | "modeBreakdown" | "thisMonth" | "thisYear">;
};

export function DashboardHome({
    userName,
    userImage,
    recommendedEvents,
    attendedEvents,
    organizedEvents,
    personalAnalytics,
    attendedAnalytics,
    organizedAnalytics,
}: DashboardHomeProps) {
    return (
        <div className="space-y-10">
            <section className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] sm:size-14">
                        {userImage ? (
                            <Image
                                src={userImage}
                                alt={userName}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-[13px] font-semibold tracking-[0.08em] text-white/80">
                                {userName.slice(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[12px] font-medium text-white/45 sm:text-[13px]">Welcome back</p>
                        <h1 className="truncate text-[24px] font-semibold tracking-[-0.03em] text-white sm:text-[32px] lg:text-[40px]">
                            {userName}
                        </h1>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_28%),rgba(255,255,255,0.025)] p-3 sm:p-4 lg:p-5">
                    <RecommendedEventsCarousel events={recommendedEvents} />
                </div>
            </section>

            <HomeQuickActions />

            <UpcomingEventsSection
                attendedEvents={attendedEvents}
                organizedEvents={organizedEvents}
            />

            <PersonalAnalyticsSummary
                attended={personalAnalytics.attended}
                organized={personalAnalytics.organized}
                spendings={personalAnalytics.spendings}
                revenue={personalAnalytics.revenue}
            />

            <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                            Monthly Overview
                        </p>
                        <h2 className="mt-1 text-[16px] font-semibold text-white/90 sm:text-[18px]">
                            Event rhythm at a glance
                        </h2>
                    </div>
                </div>

                <NativeTabs
                    defaultValue="attended"
                    className="w-full"
                    listClassName="rounded-full border border-white/8 bg-white/[0.04] p-1"
                    triggerClassName="rounded-full px-4 py-2 text-[13px]"
                    contentClassName="mt-5"
                    items={[
                        {
                            id: "attended",
                            label: "Attended",
                            content: (
                                <MonthlyOverviewSection
                                    title="Attended events"
                                    subtitle="How your attendance moves through the year."
                                    monthlyData={attendedAnalytics.monthlyActivity}
                                    modeBreakdown={attendedAnalytics.modeBreakdown}
                                    thisMonth={attendedAnalytics.thisMonth}
                                    thisYear={attendedAnalytics.thisYear}
                                    totalLabel="Attended"
                                />
                            ),
                        },
                        {
                            id: "organized",
                            label: "Organized",
                            content: (
                                <MonthlyOverviewSection
                                    title="Organized events"
                                    subtitle="How your event schedule evolves month by month."
                                    monthlyData={organizedAnalytics.monthlyActivity}
                                    modeBreakdown={organizedAnalytics.modeBreakdown}
                                    thisMonth={organizedAnalytics.thisMonth}
                                    thisYear={organizedAnalytics.thisYear}
                                    totalLabel="Organized"
                                />
                            ),
                        },
                    ]}
                />
            </section>
        </div>
    );
}
