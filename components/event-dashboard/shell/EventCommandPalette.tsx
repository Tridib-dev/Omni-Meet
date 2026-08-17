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
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 8 }}
                        className="relative flex max-h-[70vh] w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#171a21] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search pages and actions…"
                                className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/30"
                            />
                            <button
                                onClick={() => onOpenChange(false)}
                                className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/40"
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
                                    className="block px-4 py-2.5 transition-colors hover:bg-white/[0.05]"
                                >
                                    <p className="text-[13px] font-medium text-white/85">{item.label}</p>
                                    {"description" in item && item.description && (
                                        <p className="text-[11px] text-white/35">{item.description}</p>
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
