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
        <div className={compact ? "rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5" : "rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                {label}
            </p>
            <p className={compact ? "mt-1 text-[20px] font-semibold tracking-[-0.04em] text-white/95" : "mt-1 text-[24px] font-semibold tracking-[-0.04em] text-white/95"}>
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
            <div className={compact ? "grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,.75fr)]" : "grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.75fr)]"}>
                <div className={compact ? "rounded-xl border border-white/8 bg-white/[0.03] p-3.5 sm:p-4" : "rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5"}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-[12px] text-white/35">Monthly activity</p>
                        <span className="text-[11px] text-[#a5a0ff]">{totalLabel}</span>
                    </div>
                    <MonthlyBarChart data={monthlyData} label={totalLabel} />
                </div>

                <div className={compact ? "space-y-3" : "space-y-4"}>
                    <div className={compact ? "rounded-xl border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.12),transparent_35%),rgba(255,255,255,0.03)] p-3.5 sm:p-4" : "rounded-xl border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.12),transparent_35%),rgba(255,255,255,0.03)] p-4 sm:p-5"}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-[12px] text-white/35">Event mode</p>
                            <span className="text-[11px] text-white/30">Online / Offline / Hybrid</span>
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
