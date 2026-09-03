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
    const pageGap = compact ? "space-y-6 lg:space-y-7" : "space-y-10";
    return (
        <div className={`${shellWidth} ${pageGap}`}>
            <section className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 sm:size-12">
                        {userImage ? (
                            <Image
                                src={userImage}
                                alt={userName}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-[12px] font-semibold tracking-[0.08em] text-slate-600">
                                {userName.slice(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-500 sm:text-[12px]">Welcome back</p>
                        <h1 className="truncate text-[22px] font-semibold tracking-[-0.03em] text-slate-900 sm:text-[28px] lg:text-[34px]">
                            {userName}
                        </h1>
                    </div>
                </div>

                <div className="p-0 overflow-hidden">
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
                            <h2 className="mt-1 text-[15px] font-semibold text-slate-900 sm:text-[18px]">
                            Monthly Overview
                        </h2>
                    </div>
                </div>

                <NativeTabs
                    defaultValue="attended"
                    className="w-full"
                    listClassName="rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm"
                    triggerClassName="rounded-md px-3.5 py-1.5 text-[12px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:px-4 sm:py-2 sm:text-[13px]"
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
