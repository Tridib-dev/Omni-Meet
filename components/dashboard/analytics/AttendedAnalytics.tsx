"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import MetricCard from "./MetricCard";
import { ActivityHeatmap, CategoryRadar } from "./Charts";
import { MonthlyOverviewSection } from "./MonthlyOverviewSection";
import type { AttendedAnalyticsData } from "@/lib/actions/overall-analytics";

function MoneyLine({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[12px] text-slate-500">{label}</p>
            <p className="text-[13px] font-semibold text-slate-900">{value}</p>
        </div>
    );
}

export default function AttendedAnalytics({ data }: { data: AttendedAnalyticsData }) {
    const nextDate = data.nextEvent
        ? new Date(data.nextEvent.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
          })
        : null;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <MetricCard
                    label="Lifetime attended"
                    value={data.lifetime}
                    color="#332be0"
                    sub="All ticket entries on your profile"
                    index={0}
                />
                <MetricCard
                    label="This year"
                    value={data.thisYear}
                    color="#4c46ff"
                    sub="Events attended since January"
                    index={1}
                />
                <MetricCard
                    label="Upcoming"
                    value={data.upcomingCount}
                    color="#818cf8"
                    sub={data.nextEventCountdown ? `Next: ${data.nextEventCountdown}` : "No upcoming events"}
                    index={2}
                />
                <MetricCard
                    label="Streak"
                    value={data.streak}
                    suffix=" months"
                    color="#332be0"
                    sub="Consecutive months with at least one event"
                    index={3}
                />
            </div>

            <MonthlyOverviewSection
                title="Attended events"
                subtitle="How your attendance moves through the year."
                monthlyData={data.monthlyActivity}
                modeBreakdown={data.modeBreakdown}
                thisMonth={data.thisMonth}
                thisYear={data.thisYear}
                totalLabel="Attended"
            />

            <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Taste profile</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">Where your attention clusters</h2>
                        </div>
                        <span className="text-[11px] text-slate-400">
                            {data.lifetime ? "Live mix" : "No activity yet"}
                        </span>
                    </div>

                    <CategoryRadar data={data.categoryBreakdown} />
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.10),transparent_45%),#ffffff] p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Next pulse</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">Upcoming event snapshot</h2>
                        </div>
                        <span className="text-[11px] text-[#a5a0ff]">{data.nextEventCountdown ?? "No countdown"}</span>
                    </div>

                    {data.nextEvent ? (
                        <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[12px] text-slate-500">{nextDate}</p>
                                <Link href={`/events/${data.nextEvent.slug}`} className="mt-1 block text-[20px] font-semibold tracking-[-0.02em] text-slate-900 transition-colors hover:text-indigo-700">
                                    {data.nextEvent.title}
                                </Link>
                                <p className="mt-2 text-[12px] text-slate-500">Starts {data.nextEventCountdown}</p>
                            </div>

                            <div className="grid gap-3">
                                <MoneyLine label="Total spent" value={`₹${data.totalSpent.toLocaleString("en-IN")}`} />
                                <MoneyLine label="Average ticket" value={data.avgTicketPrice ? `₹${data.avgTicketPrice.toLocaleString("en-IN")}` : "Free events"} />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                            <p className="text-[13px] text-slate-500">No upcoming events on the books yet.</p>
                        </div>
                    )}
                </motion.section>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Momentum</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">Your monthly attendance rhythm</h2>
                        </div>
                        <span className="text-[11px] text-slate-400">{data.monthlyActivity.length} months</span>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1fr_.75fr]">
                        <TrendCard data={data.monthlyActivity} />
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-3 text-[12px] text-slate-500">Attendance heat</p>
                            <ActivityHeatmap data={data.monthlyActivity} />
                            <div className="mt-4 space-y-2">
                                {data.favoriteOrganizers.slice(0, 3).map((organizer) => (
                                    <div key={organizer.name} className="flex items-center justify-between gap-3">
                                        <span className="truncate text-[12px] text-slate-600">{organizer.name}</span>
                                        <span className="text-[12px] font-semibold text-slate-900">{organizer.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-200 bg-[linear-gradient(180deg,rgba(245,158,11,0.08),#ffffff)] p-4 shadow-sm sm:p-5"
                >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Value</p>
                            <h2 className="mt-1 text-[16px] font-semibold text-slate-900">What you spend and save</h2>
                        </div>
                        <span className="text-[11px] text-amber-600">Spent</span>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <p className="text-[12px] text-slate-500">Total spend</p>
                            <p className="mt-2 truncate text-[26px] font-semibold text-amber-600 sm:text-[30px]">
                                ₹{data.totalSpent.toLocaleString("en-IN")}
                            </p>
                            <p className="mt-2 text-[12px] text-slate-500">
                                Average ticket price: {data.avgTicketPrice > 0 ? `₹${data.avgTicketPrice.toLocaleString("en-IN")}` : "Free events"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="mb-3 text-[12px] text-slate-500">Top organizers</p>
                            <div className="space-y-3">
                                {data.favoriteOrganizers.length > 0 ? (
                                    data.favoriteOrganizers.map((organizer, index) => (
                                        <div key={organizer.name} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[12px]">
                                                <span className="text-slate-700">{organizer.name}</span>
                                                <span className="text-slate-500">{organizer.count} events</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${Math.max(18, (organizer.count / (data.favoriteOrganizers[0]?.count || 1)) * 100)}%`,
                                                        background: index === 0
                                                            ? "linear-gradient(90deg, #332be0, #4c46ff)"
                                                            : "linear-gradient(90deg, #818cf8, #a78bfa)",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[12px] text-slate-500">No repeated organizers yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}

function TrendCard({ data }: { data: AttendedAnalyticsData["monthlyActivity"] }) {
    const max = Math.max(...data.map((item) => item.count), 1);

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] text-slate-500">12 month trend</p>
                <p className="text-[12px] text-slate-400">Peak {max}</p>
            </div>

            <div className="flex items-end gap-1.5 h-[180px]">
                {data.map((item) => (
                    <div key={item.month} className="flex-1 h-full flex flex-col justify-end gap-2">
                        <div
                            className="rounded-t-lg"
                            style={{
                                height: `${Math.max(8, (item.count / max) * 100)}%`,
                                background: item.count === 0
                                    ? "#e2e8f0"
                                    : "linear-gradient(180deg, rgba(51,43,224,0.95), rgba(51,43,224,0.18))",
                            }}
                        />
                        <span className="text-center text-[9px] text-slate-400">{item.month.split(" ")[0]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
