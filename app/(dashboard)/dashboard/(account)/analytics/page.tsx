import { PageHeader } from "@/components/dashboard/shell";
import { NativeTabs } from "@/components/uitripled/native-tabs-shadcnui";
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
                        className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[12px] text-cyan-200"
                    >
                        Live motion, not static numbers
                    </div>
                }
            />

            <div className="rounded-xl border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.10),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_32%),rgba(255,255,255,0.02)] p-4 sm:p-5">
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
                    listClassName="rounded-full border border-white/8 bg-white/[0.04] p-1"
                    triggerClassName="rounded-full px-4 py-2 text-[13px]"
                    contentClassName="mt-5"
                />
            </div>
        </div>
    );
}
