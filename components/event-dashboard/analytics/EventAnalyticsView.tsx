import StatCard from "@/components/event-dashboard/shared/StatCard";
import ActionCardRail from "@/components/event-dashboard/shared/ActionCardRail";
import { ActivityHeatmap, TrendChart } from "@/components/dashboard/analytics/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventAnalyticsDashboardData } from "@/lib/event-dashboard/analytics";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function EventAnalyticsView({
    data,
    actionItems,
}: {
    data: EventAnalyticsDashboardData;
    actionItems: Parameters<typeof ActionCardRail>[0]["items"];
}) {
    if (!data.event) return null;

    const funnel = [
        { label: "Total reach", value: data.totalAttendees, pct: 100 },
        {
            label: "Checked in",
            value: data.checkedInCount,
            pct: data.totalAttendees > 0 ? Math.round((data.checkedInCount / data.totalAttendees) * 100) : 0,
        },
        {
            label: "Paid orders",
            value: data.totalPaidOrders,
            pct: data.totalAttendees > 0 ? Math.round((data.totalPaidOrders / data.totalAttendees) * 100) : 0,
        },
    ];

    return (
        <div className="space-y-8">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Bookings" value={data.totalBookings} sub="Free registrations" accent={edTokens.info} />
                <StatCard label="Paid orders" value={data.totalPaidOrders} sub="Completed purchases" accent="#a78bfa" index={1} />
                <StatCard
                    label="Revenue"
                    value={`₹${data.totalRevenue.toLocaleString("en-IN")}`}
                    sub="Ticket revenue"
                    accent={edTokens.warning}
                    index={2}
                />
                <StatCard
                    label="Check-ins"
                    value={`${data.checkedInCount} / ${data.totalAttendees}`}
                    sub={`${data.checkinRate}% of total reach`}
                    accent={edTokens.success}
                    index={3}
                />
            </section>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
                <Card className="flex h-full min-h-0 flex-col overflow-hidden">
                    <CardContent className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
                        <TrendChart
                            data={data.bookingTrend}
                            dailyData={data.dailyBookingTrend}
                            dataKey="bookings"
                            color={edTokens.info}
                            label="Tickets"
                            title="Booking momentum"
                            light
                        />
                    </CardContent>
                </Card>

                <Card className="flex h-full min-h-0 flex-col overflow-hidden">
                    <CardHeader>
                        <CardTitle>Booking heatmap</CardTitle>
                    </CardHeader>
                    <CardContent className="flex min-h-0 flex-1 flex-col">
                        <ActivityHeatmap
                            data={data.weekdayHeatmap.map((item) => ({
                                month: item.day,
                                count: item.bookings,
                            }))}
                            light
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Conversion funnel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {funnel.map((item) => (
                            <div key={item.label}>
                                <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-mono text-slate-800">
                                        {item.value.toLocaleString("en-IN")}{" "}
                                        <span className="text-slate-400">({item.pct}%)</span>
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-[#332be0]"
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Recent activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.recentActivity.length === 0 ? (
                            <p className="text-[13px] text-slate-500">No activity yet.</p>
                        ) : (
                            data.recentActivity.slice(0, 8).map((item) => (
                                <div
                                    key={item.id}
                                    className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                                >
                                    <div>
                                        <p className="text-[13px] text-slate-800">
                                            {item.kind === "payment" ? "Paid order" : item.label}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {formatDate(item.bookedAt)} · {formatTime(item.bookedAt)}
                                        </p>
                                    </div>
                                    <p className="text-[12px] font-semibold text-slate-800 sm:text-right">
                                        {item.amount
                                            ? `₹${item.amount.toLocaleString("en-IN")}`
                                            : item.checkedIn
                                              ? "Checked in"
                                              : "Booked"}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <ActionCardRail items={actionItems} />
        </div>
    );
}
