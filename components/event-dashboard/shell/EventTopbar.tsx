"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, Menu, Search } from "lucide-react";

import EventCommandPalette from "@/components/event-dashboard/shell/EventCommandPalette";
import { NotificationsBellTrigger } from "@/components/dashboard/notifications-bell";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import { getEventDashboardNav } from "@/lib/event-dashboard/navigation";

export default function EventTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const pathname = usePathname() ?? "";
    const { context } = useEventDashboard();
    const [cmdOpen, setCmdOpen] = useState(false);
    const nav = useMemo(() => getEventDashboardNav(context.eventId, context.normalizedMode), [context.eventId, context.normalizedMode]);
    const currentNav = nav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    const pageLabel = currentNav?.label ?? "Overview";

    return (
        <>
            <header
                className="sticky top-0 z-30"
            >
                <div className="relative flex h-[52px] items-center rounded-[16px] border border-slate-200/80 bg-white/95 px-3 shadow-[0_18px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-4">
                    <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
                        {onMenuClick && (
                            <button
                                type="button"
                                onClick={onMenuClick}
                                aria-label="Open menu"
                                className="grid size-[34px] place-items-center rounded-[12px] border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden"
                            >
                                <Menu size={17} />
                            </button>
                        )}

                        <div className="min-w-0 overflow-hidden whitespace-nowrap text-[11px] text-slate-500">
                            <div className="flex min-w-0 items-center gap-1.5">
                                <Link href="/dashboard" className="truncate transition-colors hover:text-slate-900">
                                    Dashboard
                                </Link>
                                <ChevronRight size={11} className="text-slate-300" />
                                <Link href="/dashboard/organized" className="truncate transition-colors hover:text-slate-900">
                                    My Events
                                </Link>
                                <ChevronRight size={11} className="text-slate-300" />
                                <span className="truncate text-slate-700">
                                    {pageLabel}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16">
                        <h1 className="min-w-0 truncate text-center text-[14px] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[15px]">
                            {pageLabel}
                        </h1>
                    </div>

                    <div className="relative z-10 flex items-center justify-end gap-2">
                        <Link
                            href={`/events/${context.slug}`}
                            className="hidden h-8 items-center rounded-[12px] border border-[#332be0]/18 bg-[#332be0]/10 px-3 text-[12px] text-[#332be0] transition-colors hover:bg-[#332be0]/15 sm:inline-flex"
                        >
                            View public page
                        </Link>

                        <button
                            type="button"
                            onClick={() => setCmdOpen(true)}
                            aria-label="Search event"
                            className="grid size-8 place-items-center rounded-[12px] border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            <Search size={15} />
                        </button>

                        <NotificationsBellTrigger variant="light" />
                    </div>
                </div>
            </header>

            <EventCommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
        </>
    );
}
