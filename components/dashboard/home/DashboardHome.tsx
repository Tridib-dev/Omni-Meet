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
    compact?: boolean;
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
    compact = false,
}: DashboardHomeProps) {
    const shellWidth = compact ? "mx-auto w-full max-w-[1180px]" : "mx-auto w-full max-w-[1320px]";
    const pageGap = compact ? "space-y-8 lg:space-y-9" : "space-y-10";
    return (
        <div className={`${shellWidth} ${pageGap}`}>
            <section className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] sm:size-12">
                        {userImage ? (
                            <Image
                                src={userImage}
                                alt={userName}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-[12px] font-semibold tracking-[0.08em] text-white/80">
                                {userName.slice(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[11px] font-medium text-white/45 sm:text-[12px]">Welcome back</p>
                        <h1 className="truncate text-[22px] font-semibold tracking-[-0.03em] text-white sm:text-[28px] lg:text-[34px]">
                            {userName}
                        </h1>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_28%),rgba(255,255,255,0.025)] p-2.5 sm:p-3 lg:p-4">
                    <RecommendedEventsCarousel events={recommendedEvents} compact={compact} />
                </div>
            </section>

            <HomeQuickActions compact={compact} />

            <UpcomingEventsSection
                attendedEvents={attendedEvents}
                organizedEvents={organizedEvents}
                compact={compact}
            />

            <PersonalAnalyticsSummary
                attended={personalAnalytics.attended}
                organized={personalAnalytics.organized}
                spendings={personalAnalytics.spendings}
                revenue={personalAnalytics.revenue}
                compact={compact}
            />

            <section className={compact ? "space-y-3" : "space-y-4"}>
                <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="mt-1 text-[15px] font-semibold text-white/90 sm:text-[18px]">
                            Monthly Overview
                        </h2>
                    </div>
                </div>

                <NativeTabs
                    defaultValue="attended"
                    className="w-full"
                    listClassName="rounded-full border border-white/8 bg-white/[0.04] p-1"
                    triggerClassName="rounded-full px-3.5 py-1.5 text-[12px] sm:px-4 sm:py-2 sm:text-[13px]"
                    contentClassName="mt-4 sm:mt-5"
                    items={[
                        {
                            id: "attended",
                            label: "Attended",
                            content: (
                                <MonthlyOverviewSection
                                    title=""
                                    subtitle="How your attendance moves through the year."
                                    monthlyData={attendedAnalytics.monthlyActivity}
                                    modeBreakdown={attendedAnalytics.modeBreakdown}
                                    thisMonth={attendedAnalytics.thisMonth}
                                    thisYear={attendedAnalytics.thisYear}
                                    totalLabel="Attended"
                                    compact={compact}
                                />
                            ),
                        },
                        {
                            id: "organized",
                            label: "Organized",
                            content: (
                                <MonthlyOverviewSection
                                    title=""
                                    subtitle="How your event schedule evolves month by month."
                                    monthlyData={organizedAnalytics.monthlyActivity}
                                    modeBreakdown={organizedAnalytics.modeBreakdown}
                                    thisMonth={organizedAnalytics.thisMonth}
                                    thisYear={organizedAnalytics.thisYear}
                                    totalLabel="Organized"
                                    compact={compact}
                                />
                            ),
                        },
                    ]}
                />
            </section>
        </div>
    );
}
