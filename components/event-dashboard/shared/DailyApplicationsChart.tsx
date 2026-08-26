"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { edTokens } from "@/components/event-dashboard/theme/tokens";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ChartRange = "day" | "month";

function groupByMonth(data: { day: string; applications: number }[]) {
    const months = new Map<string, number>();

    for (const point of data) {
        const month = point.day.split(" ").slice(1).join(" ") || point.day;
        months.set(month, (months.get(month) ?? 0) + point.applications);
    }

    return Array.from(months, ([day, applications]) => ({ day, applications }));
}

export function DailyApplicationsChart({
    data,
}: {
    data: { day: string; applications: number }[];
}) {
    const [range, setRange] = useState<ChartRange>("day");
    const chartData = useMemo(
        () => (range === "month" ? groupByMonth(data) : data.length > 14 ? data.slice(-14) : data),
        [data, range]
    );

    return (
        <div className="flex h-full min-h-[220px] flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold leading-none tracking-tight text-slate-900">
                    Day-by-day applications
                </p>
                <Tabs value={range} onValueChange={(value) => setRange(value as ChartRange)}>
                    <TabsList className="h-8 rounded-lg border border-slate-200 bg-slate-50 p-1">
                        <TabsTrigger
                            value="day"
                            className="h-6 rounded-md px-2.5 text-[11px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                        >
                            Day
                        </TabsTrigger>
                        <TabsTrigger
                            value="month"
                            className="h-6 rounded-md px-2.5 text-[11px] text-slate-500 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                        >
                            Month
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {!data.some((point) => point.applications > 0) ? (
                <div
                    role="status"
                    className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center"
                >
                    {/* Replace this placeholder with the final chart-empty illustration. */}
                    {/*
                    <Image
                        src="/illustrations/no-data.svg"
                        alt=""
                        width={120}
                        height={96}
                        className="mb-3"
                    />
                    */}
                    <div
                        aria-hidden="true"
                        className="mb-3 grid size-12 place-items-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-400"
                    >
                        <span className="text-lg font-semibold">—</span>
                    </div>
                    <p className="text-[14px] font-semibold text-slate-800">No data yet</p>
                    <p className="mt-1 max-w-xs text-[12px] text-slate-500">
                        Application activity will appear here once registrations begin.
                    </p>
                </div>
            ) : (
                <div className="min-h-0 flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="day"
                                tick={{ fill: "#64748b", fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fill: "#94a3b8", fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 10,
                                    color: "#0f172a",
                                    fontSize: 12,
                                }}
                            />
                            <Bar dataKey="applications" fill={edTokens.accent} radius={[6, 6, 0, 0]} maxBarSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
