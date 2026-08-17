"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import EventCommandPalette from "@/components/event-dashboard/shell/EventCommandPalette";
import NotificationsBell from "@/components/dashboard/notifications-bell";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import { getEventDashboardNav } from "@/lib/event-dashboard/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useState } from "react";

export default function EventTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const pathname = usePathname() ?? "";
    const { context } = useEventDashboard();
    const [cmdOpen, setCmdOpen] = useState(false);
    const nav = getEventDashboardNav(context.eventId, context.normalizedMode);
    const current = nav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

    return (
        <>
            <header
                className="sticky top-0 z-30 flex h-[52px] flex-shrink-0 items-center gap-3 border-b border-white/8 px-3 sm:px-4 lg:px-6"
                style={{
                    background: "rgba(17,19,24,0.85)",
                    backdropFilter: "blur(16px)",
                }}
            >
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] md:hidden"
                        aria-label="Open menu"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                )}

                <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-3">
                    <Breadcrumb className="min-w-0 flex-1">
                        <BreadcrumbList className="text-[12px] text-white/40">
                            <BreadcrumbItem className="lg:hidden">
                                <BreadcrumbLink asChild>
                                    <Link href="/dashboard/organized" className="text-white/40 hover:text-white/70">
                                        My Events
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-white/25 lg:hidden" />
                            <BreadcrumbItem className="hidden lg:flex">
                                <BreadcrumbLink asChild>
                                    <Link href="/dashboard" className="text-white/40 hover:text-white/70">
                                        Dashboard
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden text-white/25 lg:flex" />
                            <BreadcrumbItem className="hidden lg:flex">
                                <BreadcrumbLink asChild>
                                    <Link href="/dashboard/organized" className="text-white/40 hover:text-white/70">
                                        My Events
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden text-white/25 lg:flex" />
                            <BreadcrumbItem className="min-w-0">
                                <BreadcrumbPage className="truncate font-medium text-white/80">
                                    {current?.label ?? "Overview"}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <button
                    onClick={() => setCmdOpen(true)}
                    className="hidden h-9 min-w-[200px] items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 text-[13px] text-white/40 transition-colors hover:text-white/60 lg:flex xl:min-w-[280px]"
                >
                    <Search size={14} />
                    <span className="flex-1 text-left">Search this event…</span>
                    <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
                </button>

                <button
                    onClick={() => setCmdOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 hover:bg-white/[0.06] lg:hidden"
                    aria-label="Search"
                >
                    <Search size={17} />
                </button>

                <Link
                    href={`/events/${context.slug}`}
                    className="hidden rounded-full border border-[#332be0]/25 bg-[#332be0]/10 px-3 py-1.5 text-[12px] text-[#a5a0ff] transition-colors hover:bg-[#332be0]/15 sm:inline-flex"
                >
                    View public event
                </Link>

                <NotificationsBell />
                <UserButton />
            </header>

            <EventCommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
        </>
    );
}
