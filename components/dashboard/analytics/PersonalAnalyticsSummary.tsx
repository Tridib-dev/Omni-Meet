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
        <div className={compact ? "rounded-[16px] border border-white/8 bg-white/[0.03] px-3.5 py-3.5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] transition-transform duration-200 hover:-translate-y-0.5" : "rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] transition-transform duration-200 hover:-translate-y-0.5"}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
                {label}
            </p>
            <p className={compact ? "mt-2 text-[24px] font-semibold tracking-[-0.04em] sm:text-[26px]" : "mt-2 text-[28px] font-semibold tracking-[-0.04em] sm:text-[30px]"} style={{ color }}>
                {value}
            </p>
            <p className={compact ? "mt-1 text-[10px] leading-snug text-white/38" : "mt-1 text-[11px] leading-snug text-white/38"}>
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
                    <h2 className={compact ? "mt-1 text-[15px] font-semibold text-white/90 sm:text-[17px]" : "mt-1 text-[16px] font-semibold text-white/90 sm:text-[18px]"}>
                        Personal Analytics
                    </h2>
                </div>
            </div>

            <div className={compact ? "grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"}>
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
