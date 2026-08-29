"use client";

import { motion } from "framer-motion";

type PersonalAnalyticsSummaryProps = {
    attended: number;
    organized: number;
    spendings: number;
    revenue: number;
    compact?: boolean;
};

function SummaryCard({
    label,
    value,
    color,
    sub,
    compact = false,
}: {
    label: string;
    value: string;
    color: string;
    sub: string;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "rounded-[16px] border border-slate-200 bg-white px-3 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-3.5 sm:py-3.5" : "rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px]">
                {label}
            </p>
            <p className={compact ? "mt-2 truncate text-[19px] font-semibold tracking-[-0.04em] sm:text-[26px]" : "mt-2 truncate text-[28px] font-semibold tracking-[-0.04em] sm:text-[30px]"} style={{ color }}>
                {value}
            </p>
            <p className={compact ? "mt-1 hidden text-[10px] leading-snug text-slate-500 sm:block" : "mt-1 text-[11px] leading-snug text-slate-500"}>
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
    compact = false,
}: PersonalAnalyticsSummaryProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={compact ? "space-y-3" : "space-y-4"}
        >
            <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <h2 className={compact ? "mt-1 text-[15px] font-semibold text-slate-900 sm:text-[17px]" : "mt-1 text-[16px] font-semibold text-slate-900 sm:text-[18px]"}>
                        Personal Analytics
                    </h2>
                </div>
            </div>

            <div className={compact ? "grid grid-cols-2 gap-2.5 lg:grid-cols-4" : "grid grid-cols-2 gap-3 xl:grid-cols-4"}>
                <SummaryCard
                    compact={compact}
                    label="Attended"
                    value={attended.toString()}
                    color="#4c46ff"
                    sub="Events you booked and showed up for"
                />
                <SummaryCard
                    compact={compact}
                    label="Organized"
                    value={organized.toString()}
                    color="#332be0"
                    sub="Events currently under your host profile"
                />
                <SummaryCard
                    compact={compact}
                    label="Spendings"
                    value={formatMoney(spendings)}
                    color="#818cf8"
                    sub="Total amount spent on your own tickets"
                />
                <SummaryCard
                    compact={compact}
                    label="Revenue"
                    value={formatMoney(revenue)}
                    color="#a5a0ff"
                    sub="Total earnings from events you organized"
                />
            </div>
        </motion.section>
    );
}
