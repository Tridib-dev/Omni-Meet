import Link from "next/link";
import PageSection from "@/components/event-dashboard/shared/PageSection";
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
            <PageSection
                title={data.event.title}
                description={`${data.event.location} · ${formatDate(data.event.date)} at ${formatTime(data.event.date)}`}
                action={
                    <Link
                        href={`/events/${data.event.slug}`}
                        className="rounded-full border border-[#332be0]/30 bg-[#332be0]/10 px-3 py-1.5 text-[12px] text-[#a5a0ff] transition-colors hover:bg-[#332be0]/15"
                    >
                        View public event
                    </Link>
                }
            />

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
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Booking momentum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TrendChart data={data.bookingTrend} dataKey="bookings" color={edTokens.info} label="Tickets" />
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Booking heatmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ActivityHeatmap
                            data={data.weekdayHeatmap.map((item) => ({
                                month: item.day,
                                count: item.bookings,
                            }))}
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
                                    <span className="text-white/55">{item.label}</span>
                                    <span className="font-mono text-white/80">
                                        {item.value.toLocaleString("en-IN")}{" "}
                                        <span className="text-white/25">({item.pct}%)</span>
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
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
                            <p className="text-[13px] text-white/40">No activity yet.</p>
                        ) : (
                            data.recentActivity.slice(0, 8).map((item) => (
                                <div
                                    key={item.id}
                                    className="grid gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                                >
                                    <div>
                                        <p className="text-[13px] text-white/82">
                                            {item.kind === "payment" ? "Paid order" : item.label}
                                        </p>
                                        <p className="text-[11px] text-white/30">
                                            {formatDate(item.bookedAt)} · {formatTime(item.bookedAt)}
                                        </p>
                                    </div>
                                    <p className="text-[12px] font-semibold text-white/82 sm:text-right">
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
