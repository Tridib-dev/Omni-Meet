"use client";

import { motion } from "framer-motion";

import MetricCard from "./MetricCard";
import { ActivityHeatmap, FunnelBar, RevenueBarChart, TrendChart } from "./Charts";
import { MonthlyOverviewSection } from "./MonthlyOverviewSection";
import type { OrganizedAnalyticsData } from "@/lib/actions/overall-analytics";

function StatRow({
    label,
    value,
    accent = "#0f172a",
}: {
    label: string;
    value: string;
    accent?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-[12px] text-slate-500">{label}</span>
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
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <MetricCard
                    label="Events organized"
                    value={data.totalEvents}
                    color="#332be0"
                    sub="All published events in your host profile"
                />
                <MetricCard
                    label="Total attendees"
                    value={data.totalAttendees}
                    color="#4c46ff"
                    sub="Lifetime reach across all events"
                    index={1}
                />
                <MetricCard
                    label="Total revenue"
                    value={data.totalRevenue}
                    prefix="₹"
                    color="#818cf8"
                    sub="Paid event earnings only"
                    index={2}
                />
                <MetricCard
                    label="Check-in rate"
                    value={data.checkinRate}
                    suffix="%"
                    color="#332be0"
                    sub="Registered audience who actually showed up"
                    index={3}
                />
            </div>

            <MonthlyOverviewSection
                title="Organized events"
                subtitle="How your event schedule evolves month by month."
                monthlyData={data.monthlyActivity}
                modeBreakdown={data.modeBreakdown}
                thisMonth={data.thisMonth}
                thisYear={data.thisYear}
                totalLabel="Organized"
            />

            <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Growth</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">Attendee growth over time</h2>
                        </div>
                        <span className="text-[11px] text-slate-400">{data.repeatAttendeeRate}% repeat rate</span>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1fr_.82fr]">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <TrendChart data={data.attendeeGrowth} dataKey="attendees" color="#332be0" label="Attendees" />
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-3 text-[12px] text-slate-500">Monthly pulse</p>
                                <ActivityHeatmap
                                    data={data.attendeeGrowth.map((month) => ({
                                        month: month.month,
                                        count: month.attendees,
                                    }))}
                                />
                            </div>

                            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                                <StatRow label="Avg attendees / event" value={data.avgAttendeesPerEvent.toString()} accent="#332be0" />
                                <StatRow label="Avg revenue / attendee" value={`₹${data.avgRevenuePerAttendee.toLocaleString("en-IN")}`} accent="#4c46ff" />
                                <StatRow label="Repeat attendee rate" value={`${data.repeatAttendeeRate}%`} accent="#818cf8" />
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.10),transparent_45%),#ffffff] p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Funnel</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">From RSVP to check-in</h2>
                        </div>
                        <span className="text-[11px] text-slate-400">Planning signal</span>
                    </div>

                    <FunnelBar data={data.funnel} />

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-[12px] text-slate-500">Host summary</p>
                        <div className="space-y-3">
                            <StatRow label="Sold-out events" value="0 tracked" accent="#f59e0b" />
                            <StatRow label="Live revenue" value={`₹${data.totalRevenue.toLocaleString("en-IN")}`} accent="#4c46ff" />
                            <StatRow label="Top event" value={topRevenueEvent ? topRevenueEvent.title : "No revenue yet"} />
                        </div>
                    </div>
                </motion.section>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_.95fr]">
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Revenue</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">What each event contributed</h2>
                        </div>
                        <span className="text-[11px] text-slate-400">{data.revenueByEvent.length} events</span>
                    </div>

                    <RevenueBarChart data={data.revenueByEvent} />
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-[linear-gradient(180deg,rgba(34,197,94,0.08),#ffffff)] p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Quality</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">Organizer health signals</h2>
                        </div>
                        <span className="text-[11px] text-[#a5a0ff]">Healthy</span>
                    </div>

                    <div className="space-y-3">
                        <StatRow label="Total attendees" value={data.totalAttendees.toLocaleString("en-IN")} accent="#332be0" />
                        <StatRow label="Tracked months" value={data.attendeeGrowth.length.toString()} accent="#4c46ff" />
                        <StatRow label="Revenue / event" value={`₹${Math.round(data.totalRevenue / Math.max(1, data.totalEvents)).toLocaleString("en-IN")}`} accent="#818cf8" />
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-[12px] text-slate-500">Momentum heat</p>
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
