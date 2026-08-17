"use client";

import { motion } from "framer-motion";

type PersonalAnalyticsSummaryProps = {
    attended: number;
    organized: number;
    spendings: number;
    revenue: number;
};

function SummaryCard({
    label,
    value,
    color,
    sub,
}: {
    label: string;
    value: string;
    color: string;
    sub: string;
}) {
    return (
        <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] transition-transform duration-200 hover:-translate-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
                {label}
            </p>
            <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em] sm:text-[30px]" style={{ color }}>
                {value}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-white/38">
                {sub}
            </p>
        </div>
    );
}

function formatMoney(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
}

export function PersonalAnalyticsSummary({
    attended,
    organized,
    spendings,
    revenue,
}: PersonalAnalyticsSummaryProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                        Personal Analytics
                    </p>
                    <h2 className="mt-1 text-[16px] font-semibold text-white/90 sm:text-[18px]">
                        A quick snapshot of your activity
                    </h2>
                </div>
                <p className="hidden text-[12px] text-white/35 md:block">
                    Attendance, hosting, and money at a glance.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    label="Attended"
                    value={attended.toString()}
                    color="#4c46ff"
                    sub="Events you booked and showed up for"
                />
                <SummaryCard
                    label="Organized"
                    value={organized.toString()}
                    color="#332be0"
                    sub="Events currently under your host profile"
                />
                <SummaryCard
                    label="Spendings"
                    value={formatMoney(spendings)}
                    color="#818cf8"
                    sub="Total amount spent on your own tickets"
                />
                <SummaryCard
                    label="Revenue"
                    value={formatMoney(revenue)}
                    color="#a5a0ff"
                    sub="Total earnings from events you organized"
                />
            </div>
        </motion.section>
    );
}
