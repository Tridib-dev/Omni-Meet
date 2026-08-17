"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";
import posthog from "posthog-js";
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

export default function EventSwitcher() {
    const { context, accessibleEvents } = useEventDashboard();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex max-w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#332be0]/40">
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-white/10">
                    <Image
                        src={context.image || "https://placehold.co/64x64/111318/666?text=E"}
                        alt={context.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white/90">{context.title}</p>
                    <p className="truncate text-[11px] text-white/40">{formatDate(context.date)}</p>
                </div>
                <ChevronDown size={14} className="flex-shrink-0 text-white/40" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[320px] border-white/10 bg-[#171a21] text-white">
                <DropdownMenuLabel className="text-white/50">Switch event</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {accessibleEvents.length === 0 ? (
                    <DropdownMenuItem disabled>No accessible events</DropdownMenuItem>
                ) : (
                    accessibleEvents.map((event) => {
                        const active = event.id === context.eventId;
                        return (
                            <DropdownMenuItem key={event.id} asChild>
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
                                    <div className="relative h-9 w-9 overflow-hidden rounded-md border border-white/10">
                                        <Image
                                            src={event.image || "https://placehold.co/64x64/111318/666?text=E"}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-medium">{event.title}</p>
                                        <p className="truncate text-[11px] text-white/40">
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
