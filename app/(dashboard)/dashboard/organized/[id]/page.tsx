import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/shell";
import MetricCard from "@/components/dashboard/analytics/MetricCard";
import { ActivityHeatmap, TrendChart } from "@/components/dashboard/analytics/Charts";
import { getEventAnalytics } from "@/lib/actions/overall-analytics";

export const metadata = { title: "Event Analytics — DevEvent" };

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

export default async function EventAnalyticsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const data = await getEventAnalytics(id);

    if (!data.event) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <PageHeader
                kicker="Per-event analytics"
                title={data.event.title}
                description={`${data.event.location} · ${formatDate(data.event.date)} at ${formatTime(data.event.date)}`}
                right={
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/organized"
                            className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60 transition-colors hover:text-white/90"
                        >
                            Back to events
                        </Link>
                        <Link
                            href={`/events/${data.event.slug}`}
                            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[12px] text-cyan-200 transition-colors hover:bg-cyan-500/15"
                        >
                            View event
                        </Link>
                    </div>
                }
            />

            <section className="grid gap-3 md:grid-cols-4">
                <MetricCard label="Bookings" value={data.totalBookings} color="#67e8f9" sub="Free registrations" />
                <MetricCard label="Paid orders" value={data.totalPaidOrders} color="#a78bfa" sub="Completed purchases" index={1} />
                <MetricCard label="Revenue" value={data.totalRevenue} prefix="₹" color="#f59e0b" sub="Ticket revenue only" index={2} />
                <MetricCard label="Check-ins" value={data.checkedInCount} suffix={` / ${data.totalAttendees}`} color="#22c55e" sub={`${data.checkinRate}% of total reach`} index={3} />
            </section>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
                <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">Flow</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-white/90">Booking momentum over time</h2>
                        </div>
                        <span className="text-[11px] text-white/30">Last 12 months</span>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <TrendChart data={data.bookingTrend} dataKey="bookings" color="#67e8f9" label="Tickets" />
                    </div>
                </section>

                <section className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.12),transparent_38%),rgba(255,255,255,0.03)] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">Heat</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-white/90">When people book this event</h2>
                        </div>
                        <span className="text-[11px] text-white/30">Weekly</span>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <ActivityHeatmap data={data.weekdayHeatmap.map((item) => ({ month: item.day, count: item.bookings }))} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <InfoPill label="Type" value={data.event.mode} />
                        <InfoPill label="Category" value={data.event.category} />
                        <InfoPill label="Agenda items" value={data.event.agendaCount.toString()} />
                        <InfoPill label="Average order" value={data.avgOrderValue ? `₹${data.avgOrderValue.toLocaleString("en-IN")}` : "Free"} />
                    </div>
                </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">Recent</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-white/90">Latest activity</h2>
                        </div>
                        <span className="text-[11px] text-white/30">{data.recentActivity.length} items</span>
                    </div>

                    <div className="space-y-3">
                        {data.recentActivity.length > 0 ? (
                            data.recentActivity.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] text-white/82">{item.kind === "payment" ? "Paid order" : item.label}</p>
                                        <p className="mt-0.5 text-[11px] text-white/30">
                                            {formatDate(item.bookedAt)} · {formatTime(item.bookedAt)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-semibold text-white/82">
                                            {item.amount ? `₹${item.amount.toLocaleString("en-IN")}` : item.checkedIn ? "Checked in" : "Booked"}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                                            {item.kind}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
                                <p className="text-[13px] text-white/45">No activity yet.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(255,255,255,0.03))] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">Snapshot</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-white/90">Event health at a glance</h2>
                        </div>
                        <span className="text-[11px] text-amber-300/80">Alive</span>
                    </div>

                    <div className="space-y-3">
                        <InfoRow label="Check-in rate" value={`${data.checkinRate}%`} accent="#22c55e" />
                        <InfoRow label="Ticket mix" value={`${data.freeBookings} free / ${data.paidBookings} paid`} accent="#67e8f9" />
                        <InfoRow label="Total reach" value={data.totalAttendees.toLocaleString("en-IN")} accent="#ffffff" />
                        <InfoRow label="Revenue per order" value={data.avgOrderValue ? `₹${data.avgOrderValue.toLocaleString("en-IN")}` : "₹0"} accent="#f59e0b" />
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                        <p className="text-[12px] text-white/35 mb-3">Audience pulse</p>
                        <div className="flex flex-wrap gap-2">
                            {data.recentActivity.slice(0, 5).map((item) => (
                                <span
                                    key={item.id}
                                    className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] text-white/55"
                                >
                                    {item.kind === "payment" ? "Paid" : item.checkedIn ? "Checked in" : "Booked"} · {formatTime(item.bookedAt)}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function InfoPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/25">{label}</p>
            <p className="mt-1 text-[13px] font-semibold text-white/85">{value}</p>
        </div>
    );
}

function InfoRow({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <span className="text-[12px] text-white/40">{label}</span>
            <span className="text-[13px] font-semibold" style={{ color: accent }}>
                {value}
            </span>
        </div>
    );
}
