"use client";

// components/dashboard/analytics/Charts.tsx
// All chart components in one file to keep imports clean.

import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const tooltipStyle = {
    backgroundColor: "#0d1117",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    padding: "6px 10px",
};

type TrendPoint = {
    month: string;
    count?: number;
    attendees?: number;
    revenue?: number;
    [key: string]: number | string | undefined;
};

const INDIGO_SCALE = ["#332be0", "#4c46ff", "#818cf8", "#a5a0ff"];

// ─── CategoryRadar ────────────────────────────────────────────────────────────
export function CategoryRadar({
    data,
}: {
    data: { category: string; count: number }[];
}) {
    if (!data.length) return <EmptyChart label="No category data yet" />;

    const max = Math.max(...data.map((d) => d.count), 1);
    const radarData = data.map((d) => ({
        subject: d.category.length > 10 ? d.category.slice(0, 10) + "…" : d.category,
        value: d.count,
        fullMark: max,
    }));

    return (
        <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                />
                <Radar
                    name="Events"
                    dataKey="value"
                    stroke="#332be0"
                    fill="#332be0"
                    fillOpacity={0.18}
                    strokeWidth={2}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}

// ─── TrendChart ───────────────────────────────────────────────────────────────
export function TrendChart({
    data,
    dataKey = "count",
    color = "#332be0",
    label = "Events",
}: {
    data: TrendPoint[];
    dataKey?: keyof TrendPoint;
    color?: string;
    label?: string;
}) {
    if (!data.some((d) => Number(d[dataKey] ?? 0) > 0)) {
        return <EmptyChart label="No trend data yet" />;
    }

    return (
        <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: -20 }}>
                <defs>
                    <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    name={label}
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad-${color.replace("#", "")})`}
                    dot={false}
                    activeDot={{ r: 4, fill: color }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ─── RevenueBarChart ──────────────────────────────────────────────────────────
export function RevenueBarChart({
    data,
}: {
    data: { title: string; revenue: number; attendees: number }[];
}) {
    if (!data.some((d) => d.revenue > 0)) {
        return <EmptyChart label="No revenue data yet" />;
    }

    const trimmed = data.map((d) => ({
        ...d,
        name: d.title.length > 14 ? d.title.slice(0, 14) + "…" : d.title,
    }));

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trimmed} margin={{ top: 10, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="name"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#332be0" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── MonthlyBarChart ──────────────────────────────────────────────────────────
export function MonthlyBarChart({
    data,
    label = "Events",
    color = "#332be0",
}: {
    data: TrendPoint[];
    label?: string;
    color?: string;
}) {
    if (!data.some((d) => Number(d.count ?? 0) > 0)) {
        return <EmptyChart label="No monthly data yet" />;
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    formatter={(v: number) => [v.toLocaleString("en-IN"), label]}
                />
                <Bar dataKey="count" name={label} fill={color} radius={[8, 8, 0, 0]} maxBarSize={28} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── ModeDonutChart ───────────────────────────────────────────────────────────
export function ModeDonutChart({
    data,
}: {
    data: { mode: string; count: number }[];
}) {
    if (!data.some((d) => d.count > 0)) {
        return <EmptyChart label="No mode data yet" />;
    }

    const total = data.reduce((sum, item) => sum + item.count, 0);
    const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 3);

    return (
        <div className="space-y-4">
            <div className="relative mx-auto h-[220px] max-w-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(v: number, name: string) => [v.toLocaleString("en-IN"), name]}
                        />
                        <Pie
                            data={sorted}
                            dataKey="count"
                            nameKey="mode"
                            innerRadius={64}
                            outerRadius={92}
                            paddingAngle={4}
                            stroke="rgba(13,17,23,0.9)"
                        >
                            {sorted.map((entry, index) => (
                                <Cell key={entry.mode} fill={INDIGO_SCALE[index % INDIGO_SCALE.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
                    <div>
                        <p className="text-[28px] font-semibold tracking-[-0.04em] text-white/95">{total}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/30">Total</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {sorted.map((item, index) => (
                    <div key={item.mode} className="flex items-center justify-between gap-3 text-[12px]">
                        <span className="inline-flex items-center gap-2 text-white/65">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: INDIGO_SCALE[index % INDIGO_SCALE.length] }}
                            />
                            {item.mode}
                        </span>
                        <span className="font-medium text-white/85">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── FunnelBar ────────────────────────────────────────────────────────────────
export function FunnelBar({
    data,
}: {
    data: { label: string; value: number; pct: number }[];
}) {
    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.35 }}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] text-white/55">{item.label}</span>
                        <span className="text-[12px] font-semibold text-white/80 font-mono">
                            {item.value.toLocaleString("en-IN")}
                            <span className="text-white/25 font-normal ml-1.5">({item.pct}%)</span>
                        </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: i === 0
                                    ? "linear-gradient(to right, #332be0, #4c46ff)"
                                    : "linear-gradient(to right, #4c46ff, #818cf8)",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ delay: i * 0.1 + 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// ─── ActivityHeatmap ──────────────────────────────────────────────────────────
// Simple bar-based heatmap showing 12 months of activity
export function ActivityHeatmap({
    data,
}: {
    data: { month: string; count: number }[];
}) {
    const max = Math.max(...data.map((d) => d.count), 1);

    return (
        <div className="flex items-end gap-1.5">
            {data.map((d, i) => {
                const intensity = d.count / max;
                return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1" title={`${d.month}: ${d.count}`}>
                        <motion.div
                            className="w-full rounded-sm"
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(4, intensity * 48) }}
                            transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                background: d.count === 0
                                    ? "rgba(255,255,255,0.05)"
                                    : `rgba(51,43,224,${0.2 + intensity * 0.8})`,
                            }}
                        />
                        {data.length <= 7 || i % 3 === 0 ? (
                            <span className="text-[8px] text-white/20">{d.month.split(" ")[0]}</span>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyChart({ label }: { label: string }) {
    return (
        <div className="h-[160px] flex items-center justify-center">
            <p className="text-[12px] text-white/25">{label}</p>
        </div>
    );
}
