"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function EventSwitcher({ compact = false }: { compact?: boolean }) {
    const { context, accessibleEvents } = useEventDashboard();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    "flex max-w-full items-center gap-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#332be0]/20",
                    compact
                        ? "h-11 w-11 justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                        : "w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 hover:bg-slate-50"
                )}
            >
                <div className={cn("relative flex-shrink-0 overflow-hidden rounded-md border border-slate-200", compact ? "h-7 w-7" : "h-8 w-8")}>
                    <Image
                        src={context.image || "https://placehold.co/64x64/111318/666?text=E"}
                        alt={context.title}
                        fill
                        className="object-cover"
                    />
                </div>
                {!compact && (
                    <>
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-slate-900">{context.title}</p>
                            <p className="truncate text-[11px] text-slate-500">{formatDate(context.date)}</p>
                        </div>
                        <ChevronDown size={14} className="ml-auto flex-shrink-0 text-slate-400" />
                    </>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[320px] border-slate-200 bg-white text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                <DropdownMenuLabel className="text-slate-500">Switch event</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200" />
                {accessibleEvents.length === 0 ? (
                    <DropdownMenuItem disabled>No accessible events</DropdownMenuItem>
                ) : (
                    accessibleEvents.map((event) => {
                        const active = event.id === context.eventId;
                        return (
                            <DropdownMenuItem
                                key={event.id}
                                asChild
                                className="rounded-md hover:bg-slate-50 focus:bg-slate-50 data-[highlighted]:bg-slate-50 focus:text-slate-900"
                            >
                                <Link
                                    href={`/dashboard/events/${event.id}/overview`}
                                    onClick={() => {
                                        if (event.id !== context.eventId) {
                                            posthog.capture("event_switcher_change", {
                                                from_event_id: context.eventId,
                                                to_event_id: event.id,
                                            });
                                        }
                                    }}
                                    className="flex items-center gap-3 py-2"
                                >
                                    <div className="relative h-9 w-9 overflow-hidden rounded-md border border-slate-200">
                                        <Image
                                            src={event.image || "https://placehold.co/64x64/111318/666?text=E"}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-medium">{event.title}</p>
                                        <p className="truncate text-[11px] text-slate-500">
                                            {formatDate(event.date)} · {event.location}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant={event.role === "creator" ? "default" : "secondary"}>
                                            {event.role === "creator" ? "Creator" : "Co-org"}
                                        </Badge>
                                        {active && <Check size={14} style={{ color: edTokens.accent }} />}
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        );
                    })
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
