"use client";

import { motion } from "framer-motion";
import { MonthlyBarChart, ModeDonutChart } from "./Charts";

type MonthlyOverviewSectionProps = {
    title: string;
    subtitle: string;
    monthlyData: { month: string; count: number }[];
    modeBreakdown: { mode: string; count: number }[];
    thisMonth: number;
    thisYear: number;
    totalLabel: string;
    compact?: boolean;
};

function StatPill({
    label,
    value,
    compact = false,
}: {
    label: string;
    value: number;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm" : "rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {label}
            </p>
            <p className={compact ? "mt-1 text-[20px] font-semibold tracking-[-0.04em] text-slate-900" : "mt-1 text-[24px] font-semibold tracking-[-0.04em] text-slate-900"}>
                {value}
            </p>
        </div>
    );
}

export function MonthlyOverviewSection({
    title,
    subtitle,
    monthlyData,
    modeBreakdown,
    thisMonth,
    thisYear,
    totalLabel,
    compact = false,
}: MonthlyOverviewSectionProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={compact ? "space-y-3" : "space-y-4"}
        >
            <div className={compact ? "grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,.75fr)]" : "grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.75fr)]"}>
                <div className={compact ? "flex min-h-[360px] flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4" : "flex min-h-[380px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-[12px] text-slate-500">Monthly activity</p>
                        <span className="text-[11px] text-indigo-600">{totalLabel}</span>
                    </div>
                    <div className="min-h-[240px] flex-1">
                        <MonthlyBarChart data={monthlyData} label={totalLabel} fillHeight />
                    </div>
                </div>

                <div className={compact ? "space-y-3" : "space-y-4"}>
                    <div className={compact ? "rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.10),transparent_35%),#ffffff] p-3.5 shadow-sm sm:p-4" : "rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.10),transparent_35%),#ffffff] p-4 shadow-sm sm:p-5"}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-[12px] text-slate-500">Event mode</p>
                            <span className="text-[11px] text-slate-400">Online / Offline / Hybrid</span>
                        </div>
                        <ModeDonutChart data={modeBreakdown} />
                    </div>

                    <div className={compact ? "grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"}>
                        <StatPill compact={compact} label="This month" value={thisMonth} />
                        <StatPill compact={compact} label="This year" value={thisYear} />
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
