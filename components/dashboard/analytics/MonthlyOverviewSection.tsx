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
};

function StatPill({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                {label}
            </p>
            <p className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-white/95">
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
}: MonthlyOverviewSectionProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                        Monthly Overview
                    </p>
                    <h2 className="mt-1 text-[16px] font-semibold text-white/90 sm:text-[18px]">
                        {title}
                    </h2>
                </div>
                <p className="hidden text-[12px] text-white/35 md:block">
                    {subtitle}
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.75fr)]">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-[12px] text-white/35">Monthly activity</p>
                        <span className="text-[11px] text-[#a5a0ff]">{totalLabel}</span>
                    </div>
                    <MonthlyBarChart data={monthlyData} label={totalLabel} />
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.12),transparent_35%),rgba(255,255,255,0.03)] p-4 sm:p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-[12px] text-white/35">Event mode</p>
                            <span className="text-[11px] text-white/30">Online / Offline / Hybrid</span>
                        </div>
                        <ModeDonutChart data={modeBreakdown} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <StatPill label="This month" value={thisMonth} />
                        <StatPill label="This year" value={thisYear} />
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
