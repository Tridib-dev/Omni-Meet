"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    UserCog,
    BarChart3,
    DoorOpen,
    Video,
    Settings,
    ChevronLeft,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { edTokens } from "@/components/event-dashboard/theme/tokens";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import { getEventDashboardNav } from "@/lib/event-dashboard/navigation";
import type { EventDashboardPageId } from "@/lib/event-dashboard/navigation";

const ICONS: Record<EventDashboardPageId, React.ReactNode> = {
    overview: <LayoutDashboard size={16} />,
    applicants: <Users size={16} />,
    organizers: <UserCog size={16} />,
    analytics: <BarChart3 size={16} />,
    gate: <DoorOpen size={16} />,
    room: <Video size={16} />,
    settings: <Settings size={16} />,
};

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function EventSidebar({
    collapsed,
    onCollapsedChange,
    mobile = false,
}: {
    collapsed: boolean;
    onCollapsedChange: (value: boolean) => void;
    mobile?: boolean;
}) {
    const pathname = usePathname() ?? "";
    const { context } = useEventDashboard();
    const nav = getEventDashboardNav(context.eventId, context.normalizedMode);
    const width = mobile ? "100%" : collapsed ? 56 : 220;

    const mainItems = nav.filter((item) => item.section === "main");
    const operationItems = nav.filter((item) => item.section === "operations");
    const settingsItem = nav.find((item) => item.section === "settings");

    return (
        <LayoutGroup id="event-sidebar">
            <motion.aside
                animate={{ width }}
                transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.8 }}
                className={cn(
                    "relative z-20 flex h-dvh flex-shrink-0 flex-col bg-[#111318]",
                    mobile ? "border-r-0" : "border-r border-white/8"
                )}
            >
                <div className="flex h-[52px] flex-shrink-0 items-center overflow-hidden border-b border-white/8 px-3">
                    <Link href="/dashboard/organized" className="flex min-w-0 items-center gap-2.5">
                        <Image src="/icons/logo.png" alt="DevEvent" width={22} height={22} className="flex-shrink-0 opacity-90" />
                        <motion.span
                            animate={{ opacity: collapsed && !mobile ? 0 : 1 }}
                            className="truncate text-[13px] font-semibold text-white/90"
                        >
                            Event Dashboard
                        </motion.span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
                    <Link
                        href="/dashboard/organized"
                        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/90"
                    >
                        <ChevronLeft size={15} />
                        <motion.span
                            animate={{ opacity: collapsed && !mobile ? 0 : 1, width: collapsed && !mobile ? 0 : "auto" }}
                            className="overflow-hidden whitespace-nowrap text-[12.5px]"
                        >
                            Back to My Events
                        </motion.span>
                    </Link>

                    <NavSection
                        label="Manage"
                        collapsed={collapsed && !mobile}
                        items={mainItems}
                        pathname={pathname}
                    />

                    {operationItems.length > 0 && (
                        <NavSection
                            label="Operations"
                            collapsed={collapsed && !mobile}
                            items={operationItems}
                            pathname={pathname}
                        />
                    )}

                    {settingsItem && (
                        <NavSection
                            label="Config"
                            collapsed={collapsed && !mobile}
                            items={[settingsItem]}
                            pathname={pathname}
                        />
                    )}
                </nav>

                {!mobile && (
                    <div className="flex-shrink-0 border-t border-white/8 p-2">
                        <button
                            onClick={() => onCollapsedChange(!collapsed)}
                            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
                        >
                            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
                            <motion.span
                                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                                className="overflow-hidden whitespace-nowrap text-[12px]"
                            >
                                {collapsed ? "Expand" : "Collapse"}
                            </motion.span>
                        </button>
                    </div>
                )}
            </motion.aside>
        </LayoutGroup>
    );
}

function NavSection({
    label,
    collapsed,
    items,
    pathname,
}: {
    label: string;
    collapsed: boolean;
    items: ReturnType<typeof getEventDashboardNav>;
    pathname: string;
}) {
    return (
        <div>
            <motion.p
                animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
                className="mb-1 overflow-hidden px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30"
            >
                {label}
            </motion.p>
            <ul className="m-0 list-none space-y-px p-0">
                {items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                        <li key={item.id} className="relative">
                            {active && (
                                <motion.span
                                    layoutId="event-sidebar-active"
                                    className="absolute inset-0 rounded-md bg-[#332be0]/15"
                                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                />
                            )}
                            <Link
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
                                    active
                                        ? "text-white"
                                        : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                                )}
                            >
                                <span className="flex-shrink-0" style={{ color: active ? edTokens.accent : undefined }}>
                                    {ICONS[item.id]}
                                </span>
                                <motion.span
                                    animate={{
                                        opacity: collapsed ? 0 : 1,
                                        width: collapsed ? 0 : "auto",
                                        fontWeight: active ? 500 : 400,
                                    }}
                                    className="overflow-hidden whitespace-nowrap text-[13px]"
                                >
                                    {item.label}
                                </motion.span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
