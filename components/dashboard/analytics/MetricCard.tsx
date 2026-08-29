"use client";

// components/dashboard/analytics/MetricCard.tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { NativeCounterUp } from "@/components/uitripled/native-counter-up-carbon";

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const w = 80, h = 28;
    const pts = data.map((v, i) => [
        (i / (data.length - 1)) * w,
        h - (v / max) * h,
    ]);
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <defs>
                <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#sg-${color.replace("#", "")})`} />
            <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
interface MetricCardProps {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    sub?: string;
    color?: string;
    sparkData?: number[];
    index?: number;
}

export default function MetricCard({
    label,
    value,
    prefix = "",
    suffix = "",
    sub,
    color = "#332be0",
    sparkData,
    index = 0,
}: MetricCardProps) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="flex cursor-default flex-col justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5"
            style={{
                minHeight: 110,
            }}
        >
            <div className="flex items-start justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {label}
                </p>
                {sparkData && <Sparkline data={sparkData} color={color} />}
            </div>

            <div>
                <div className="truncate text-[26px] leading-none sm:text-[30px]" style={{ color }}>
                    <NativeCounterUp
                        value={visible ? value : 0}
                        duration={1.1 + index * 0.08}
                        prefix={prefix}
                        suffix={suffix}
                        decimals={0}
                        className="font-bold"
                    />
                </div>
                {sub && (
                    <p className="mt-1 text-[11px] leading-snug text-slate-500">{sub}</p>
                )}
            </div>
        </motion.div>
    );
}
