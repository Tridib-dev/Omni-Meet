"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

function parseEventDate(date: string, time: string) {
    const datePart = date.trim().split("T")[0];
    const hasDatePart = /^\d{4}-\d{2}-\d{2}$/.test(datePart);
    const hasTimePart = /^\d{2}:\d{2}$/.test(time);

    if (hasDatePart) {
        const displayDate = new Date(`${datePart}T12:00:00.000Z`);
        const startDate = hasTimePart
            ? new Date(`${datePart}T${time}:00.000Z`)
            : new Date(`${datePart}T00:00:00.000Z`);

        return {
            displayDate: Number.isNaN(displayDate.getTime()) ? null : displayDate,
            startDate: Number.isNaN(startDate.getTime()) ? null : startDate,
        };
    }

    const fallback = new Date(date);
    return {
        displayDate: Number.isNaN(fallback.getTime()) ? null : fallback,
        startDate: Number.isNaN(fallback.getTime()) ? null : fallback,
    };
}

function formatCountdown(target: Date | null) {
    if (!target) return { label: "Date not set", parts: null };

    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { label: "Event started", parts: null };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
        label: null,
        parts: { days, hours, minutes, seconds },
    };
}

function formatEventDate(date: Date | null) {
    if (!date) return "Date not set";

    return new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

export default function EventHero({
    title,
    category,
    date,
    time,
}: {
    title: string;
    category: string;
    date: string;
    time: string;
}) {
    const { displayDate, startDate } = useMemo(() => parseEventDate(date, time), [date, time]);
    const [countdown, setCountdown] = useState<ReturnType<typeof formatCountdown> | null>(null);

    useEffect(() => {
        setCountdown(formatCountdown(startDate));
        const id = setInterval(() => setCountdown(formatCountdown(startDate)), 1000);
        return () => clearInterval(id);
    }, [startDate]);

    return (
        <section className="relative overflow-hidden px-2 py-0 sm:px-4 sm:py-1">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full blur-3xl"
                style={{ background: "rgba(51, 43, 224, 0.18)" }}
            />

            <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
                <h1 className="max-w-4xl text-balance text-[30px] font-semibold leading-tight text-white sm:text-[40px] lg:text-[48px]">
                    {title}
                </h1>

                <Badge
                    variant="secondary"
                    className="mt-4 border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-white/80"
                >
                    {category}
                </Badge>

                <p className="mt-4 text-[14px] text-white/55 sm:text-[15px]">
                    <span>{formatEventDate(displayDate)}</span>
                    {time ? <span className="mx-2 text-white/25">·</span> : null}
                    {time ? <span>{time}</span> : null}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {!countdown || countdown.label ? (
                        <div
                            className="rounded-full border px-4 py-2 text-sm font-medium text-white/80"
                            style={{
                                borderColor: edTokens.accentBorder,
                                background: edTokens.accentMuted,
                            }}
                        >
                            {countdown?.label ?? "Loading countdown"}
                        </div>
                    ) : (
                        (["days", "hours", "minutes", "seconds"] as const).map((unit) => (
                            <div
                                key={unit}
                                className="min-w-[86px] rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
                            >
                                <p
                                    className="text-[26px] font-semibold tabular-nums tracking-tight sm:text-[30px]"
                                    style={{ color: edTokens.accent }}
                                >
                                    {String(countdown.parts?.[unit] ?? 0).padStart(2, "0")}
                                </p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                                    {unit}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
