"use client";

import { motion } from "framer-motion";

import MetricCard from "./MetricCard";
import { ActivityHeatmap, FunnelBar, RevenueBarChart, TrendChart } from "./Charts";
import type { OrganizedAnalyticsData } from "@/lib/actions/overall-analytics";

function StatRow({
    label,
    value,
    accent = "rgba(255,255,255,0.9)",
}: {
    label: string;
    value: string;
    accent?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <span className="text-[12px] text-white/40">{label}</span>
            <span className="text-[13px] font-semibold" style={{ color: accent }}>
                {value}
            </span>
        </div>
    );
}

export default function OrganizedAnalytics({ data }: { data: OrganizedAnalyticsData }) {
    const topRevenueEvent = data.revenueByEvent[0];

    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Events organized"
                    value={data.totalEvents}
                    color="#67e8f9"
                    sub="All published events in your host profile"
                />
                <MetricCard
                    label="Total attendees"
                    value={data.totalAttendees}
                    color="#a78bfa"
                    sub="Lifetime reach across all events"
                    index={1}
                />
                <MetricCard
                    label="Total revenue"
                    value={data.totalRevenue}
                    prefix="₹"
                    color="#f59e0b"
                    sub="Paid event earnings only"
                    index={2}
                />
                <MetricCard
                    label="Check-in rate"
                    value={data.checkinRate}
                    suffix="%"
                    color="#22c55e"
                    sub="Registered audience who actually showed up"
                    index={3}
                />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">Growth</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-white/90">Attendee growth over time</h2>
                        </div>
                        <span className="text-[11px] text-white/30">{data.repeatAttendeeRate}% repeat rate</span>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1fr_.82fr]">
                        <div className="rounded-xl border border-white/8 bg-black/20 p-4">
                            <TrendChart data={data.attendeeGrowth} dataKey="attendees" color="#67e8f9" label="Attendees" />
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
                                <p className="text-[12px] text-white/35 mb-3">Monthly pulse</p>
                                <ActivityHeatmap
                                    data={data.attendeeGrowth.map((month) => ({
                                        month: month.month,
                                        count: month.attendees,
                                    }))}
                                />
                            </div>

                            <div className="space-y-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
                                <StatRow label="Avg attendees / event" value={data.avgAttendeesPerEvent.toString()} accent="#67e8f9" />
                                <StatRow label="Avg revenue / attendee" value={`₹${data.avgRevenuePerAttendee.toLocaleString("en-IN")}`} accent="#fbbf24" />
                                <StatRow label="Repeat attendee rate" value={`${data.repeatAttendeeRate}%`} accent="#22c55e" />
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">Funnel</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-white/90">From RSVP to check-in</h2>
                        </div>
                        <span className="text-[11px] text-white/30">Planning signal</span>
                    </div>

                    <FunnelBar data={data.funnel} />

                    <div className="mt-5 rounded-xl border border-white/8 bg-black/20 p-4">
                        <p className="text-[12px] text-white/35 mb-3">Host summary</p>
                        <div className="space-y-3">
                            <StatRow label="Sold-out events" value="0 tracked" accent="#f59e0b" />
                            <StatRow label="Live revenue" value={`₹${data.totalRevenue.toLocaleString("en-IN")}`} accent="#67e8f9" />
                            <StatRow label="Top event" value={topRevenueEvent ? topRevenueEvent.title : "No revenue yet"} accent="#ffffff" />
                        </div>
                    </div>
                </motion.section>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_.95fr]">
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">Revenue</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-white/90">What each event contributed</h2>
                        </div>
                        <span className="text-[11px] text-white/30">{data.revenueByEvent.length} events</span>
                    </div>

                    <RevenueBarChart data={data.revenueByEvent} />
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/8 bg-[linear-gradient(180deg,rgba(34,197,94,0.08),rgba(255,255,255,0.03))] p-4 sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">Quality</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-white/90">Organizer health signals</h2>
                        </div>
                        <span className="text-[11px] text-emerald-300/80">Healthy</span>
                    </div>

                    <div className="space-y-3">
                        <StatRow label="Total attendees" value={data.totalAttendees.toLocaleString("en-IN")} accent="#67e8f9" />
                        <StatRow label="Tracked months" value={data.attendeeGrowth.length.toString()} accent="#a78bfa" />
                        <StatRow label="Revenue / event" value={`₹${Math.round(data.totalRevenue / Math.max(1, data.totalEvents)).toLocaleString("en-IN")}`} accent="#f59e0b" />
                    </div>

                    <div className="mt-5 rounded-xl border border-white/8 bg-black/20 p-4">
                        <p className="text-[12px] text-white/35 mb-3">Momentum heat</p>
                        <ActivityHeatmap
                            data={data.attendeeGrowth.map((month) => ({
                                month: month.month,
                                count: month.attendees,
                            }))}
                        />
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
