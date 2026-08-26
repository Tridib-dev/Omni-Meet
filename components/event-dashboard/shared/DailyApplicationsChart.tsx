"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

export function DailyApplicationsChart({
    data,
}: {
    data: { day: string; applications: number }[];
}) {
    if (!data.some((point) => point.applications > 0)) {
        return (
            <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200">
                <p className="text-[13px] text-slate-500">No application data yet.</p>
            </div>
        );
    }

    const trimmed = data.length > 14 ? data.slice(-14) : data;

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trimmed} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
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
    );
}
