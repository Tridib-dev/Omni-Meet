"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

export default function StatCard({
    label,
    value,
    sub,
    href,
    accent = edTokens.accent,
    index = 0,
}: {
    label: string;
    value: string | number;
    sub?: string;
    href?: string;
    accent?: string;
    index?: number;
}) {
    const content = (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            whileHover={href ? { scale: 1.02 } : undefined}
            className="group flex min-h-[104px] flex-col justify-between rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5"
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                    {label}
                </p>
                {href && (
                    <ArrowUpRight
                        size={14}
                        className="text-white/25 transition-colors group-hover:text-white/60"
                    />
                )}
            </div>
            <div>
                <p className="truncate text-[26px] font-bold leading-none sm:text-[30px]" style={{ color: accent }}>
                    {value}
                </p>
                {sub && <p className="mt-1.5 text-[11px] text-white/35">{sub}</p>}
            </div>
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        );
    }

    return content;
}
