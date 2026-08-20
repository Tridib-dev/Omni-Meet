"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import { getEventDashboardNav } from "@/lib/event-dashboard/navigation";

export default function EventCommandPalette({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { context } = useEventDashboard();
    const [query, setQuery] = useState("");
    const nav = getEventDashboardNav(context.eventId, context.normalizedMode);

    const actions = [
        ...nav,
        {
            id: "public" as const,
            label: "View public event",
            href: `/events/${context.slug}`,
            description: "Open the public event page",
        },
    ];

    const filtered = actions.filter((item) =>
        query === "" || item.label.toLowerCase().includes(query.toLowerCase())
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                onOpenChange(!open);
            }
            if (e.key === "Escape") onOpenChange(false);
        },
        [open, onOpenChange]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (!open) setQuery("");
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
                    onClick={() => onOpenChange(false)}
                >
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 8 }}
                    className="relative flex max-h-[70vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5">
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search pages and actions…"
                            className="flex-1 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        <button
                            onClick={() => onOpenChange(false)}
                            className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500"
                        >
                            ESC
                        </button>
                    </div>
                    <div className="overflow-y-auto py-2">
                            {filtered.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => {
                                        posthog.capture("event_dashboard_command_palette_select", {
                                            event_id: context.eventId,
                                            target: item.label,
                                            href: item.href,
                                        });
                                        onOpenChange(false);
                                    }}
                                    className="block px-4 py-2.5 transition-colors hover:bg-slate-50"
                                >
                                    <p className="text-[13px] font-medium text-slate-900">{item.label}</p>
                                    {"description" in item && item.description && (
                                        <p className="text-[11px] text-slate-500">{item.description}</p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
