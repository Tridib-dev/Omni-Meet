import { PageHeader } from "@/components/dashboard/shell";
import { NativeTabs } from "@/components/uitripled/native-tabs-shadcnui";
import { PersonalAnalyticsSummary } from "@/components/dashboard/analytics/PersonalAnalyticsSummary";
import AttendedAnalytics from "@/components/dashboard/analytics/AttendedAnalytics";
import OrganizedAnalytics from "@/components/dashboard/analytics/OrganizedAnalytics";
import {
    getAttendedAnalytics,
    getOrganizedAnalytics,
} from "@/lib/actions/overall-analytics";

export const metadata = { title: "Analytics — DevEvent" };

export default async function AnalyticsPage() {
    const [attended, organized] = await Promise.all([
        getAttendedAnalytics(),
        getOrganizedAnalytics(),
    ]);

    return (
        <div className="space-y-6">
            <PageHeader
                kicker="Insights"
                title="Analytics"
                description="Visual dashboards for how you attend and how you host."
                right={
                    <div
                        className="rounded-lg border border-[#332be0]/20 bg-[#332be0]/10 px-3 py-1.5 text-[12px] text-[#332be0]"
                    >
                        Live motion, not static numbers
                    </div>
                }
            />

            <PersonalAnalyticsSummary
                attended={attended.lifetime}
                organized={organized.totalEvents}
                spendings={attended.totalSpent}
                revenue={organized.totalRevenue}
            />

            <div className="rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.10),transparent_35%),radial-gradient(circle_at_top_right,rgba(129,140,248,0.08),transparent_32%),#ffffff] p-4 shadow-sm sm:p-5">
                <NativeTabs
                    defaultValue="attended"
                    items={[
                        {
                            id: "attended",
                            label: "Attended",
                            content: <AttendedAnalytics data={attended} />,
                        },
                        {
                            id: "organized",
                            label: "Organized",
                            content: <OrganizedAnalytics data={organized} />,
                        },
                    ]}
                    listClassName="rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-sm"
                    triggerClassName="rounded-md px-4 py-2 text-[13px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                    contentClassName="mt-5"
                />
            </div>
        </div>
    );
}
