"use client";

// components/gate/GateStats.tsx
// Departures-board style count strip: checked in / remaining / total.
// Polls every 30s and re-fetches immediately when refreshKey changes
// (i.e. right after a check-in elsewhere in the UI).

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import StatCard from "@/components/event-dashboard/shared/StatCard";
import { fetchAttendees } from "./gate-client";

export interface GateStatsProps {
  eventSlug: string;
  refreshKey: number;
  variant?: "gate" | "dashboard";
}

function CountUp({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: "easeOut" });
    prev.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <motion.span className={`font-[family-name:var(--font-mono)] tabular-nums ${className ?? ""}`}>
      {rounded}
    </motion.span>
  );
}

export default function GateStats({ eventSlug, refreshKey, variant = "gate" }: GateStatsProps) {
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await fetchAttendees(eventSlug);
      if (!cancelled) {
        setStats({ total: data.total, checkedIn: data.checkedIn, remaining: data.remaining });
        setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [eventSlug, refreshKey]);

  const isDashboard = variant === "dashboard";

  if (isDashboard) {
    return (
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Checked in"
          value={stats.checkedIn}
          sub="Successfully"
          accent="#16a34a"
          index={0}
        />
        <StatCard
          label="Remaining"
          value={stats.remaining}
          sub="Awaiting check-in"
          accent="#f59e0b"
          index={1}
        />
        <StatCard
          label="Total"
          value={stats.total}
          sub="All registrations"
          accent="#4f46e5"
          index={2}
        />
        {loading && <div className="col-span-3 h-0.5 animate-pulse bg-indigo-600/40" aria-hidden />}
      </div>
    );
  }

  const cardClass = "flex flex-col items-center gap-0.5 px-2 py-3";
  const labelClass = "text-[10px] uppercase tracking-wider text-[var(--gv-ink-dim)]";

  return (
    <div className="grid grid-cols-3 divide-x divide-[var(--gv-line)] overflow-hidden rounded-xl border border-[var(--gv-line)] bg-[var(--gv-panel)]">
      <div className={cardClass}>
        <CountUp value={stats.checkedIn} className="text-2xl font-bold text-[var(--gv-go)]" />
        <span className={labelClass}>Checked in</span>
      </div>
      <div className={cardClass}>
        <CountUp value={stats.remaining} className="text-2xl font-bold text-[var(--gv-wait)]" />
        <span className={labelClass}>Remaining</span>
      </div>
      <div className={cardClass}>
        <CountUp value={stats.total} className="text-2xl font-bold text-[var(--gv-ink)]" />
        <span className={labelClass}>Total</span>
      </div>
      {loading && (
        <div className="col-span-3 h-0.5 animate-pulse bg-[var(--gv-scan)]/40" aria-hidden />
      )}
    </div>
  );
}
