"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    ChevronLeft,
    DoorOpen,
    LayoutDashboard,
    PanelLeft,
    PanelLeftClose,
    Settings,
    UserCog,
    Users,
    Video,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import EventSwitcher from "@/components/event-dashboard/shell/EventSwitcher";
import { getEventDashboardNav } from "@/lib/event-dashboard/navigation";
import type { EventDashboardPageId } from "@/lib/event-dashboard/navigation";

const ICONS: Record<EventDashboardPageId, ReactNode> = {
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

function NavIcon({ icon, active }: { icon: ReactNode; active: boolean }) {
    return (
        <span
            className={cn(
                "grid size-[26px] shrink-0 place-items-center rounded-xl ring-1 transition-colors",
                active
                    ? "bg-[#332be0]/10 text-[#332be0] ring-[#332be0]/20"
                    : "bg-white text-slate-500 ring-slate-200/80 group-hover:bg-slate-50 group-hover:text-slate-900"
            )}
        >
            {icon}
        </span>
    );
}

function SectionLink({
    href,
    label,
    description,
    icon,
    active,
    collapsed,
    onNavigate,
}: {
    href: string;
    label: string;
    description?: string;
    icon: ReactNode;
    active: boolean;
    collapsed: boolean;
    onNavigate?: () => void;
}) {
    return (
        <li>
            <Link
                href={href}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                    "group relative flex min-w-0 items-center gap-2 rounded-[12px] border px-2 py-2 transition-colors",
                    collapsed ? "justify-center px-0" : "justify-start",
                    active
                        ? "border-[#332be0]/20 bg-[#332be0]/10 text-slate-950 shadow-[0_10px_24px_rgba(51,43,224,0.08)]"
                        : "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                )}
            >
                <NavIcon icon={icon} active={active} />
                <motion.span
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                    transition={{ duration: 0.16 }}
                    className="min-w-0 overflow-hidden whitespace-nowrap text-[12px] font-medium"
                >
                    {label}
                </motion.span>
            </Link>
        </li>
    );
}

function Section({
    label,
    items,
    pathname,
    collapsed,
    onNavigate,
}: {
    label: string;
    items: ReturnType<typeof getEventDashboardNav>;
    pathname: string;
    collapsed: boolean;
    onNavigate?: () => void;
}) {
    if (!items.length) return null;

    return (
        <div className="min-w-0 space-y-1.5">
            <motion.p
                animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
                className="overflow-hidden px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400"
            >
                {label}
            </motion.p>
            <ul className="min-w-0 space-y-1">
                {items.map((item) => (
                    <SectionLink
                        key={item.id}
                        href={item.href}
                        label={item.label}
                        description={item.description}
                        icon={ICONS[item.id]}
                        active={isActive(pathname, item.href)}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                    />
                ))}
            </ul>
        </div>
    );
}

export default function EventSidebar({
    collapsed,
    onCollapsedChange,
    mobile = false,
    onNavigate,
}: {
    collapsed: boolean;
    onCollapsedChange: (value: boolean) => void;
    mobile?: boolean;
    onNavigate?: () => void;
}) {
    const pathname = usePathname() ?? "";
    const { context } = useEventDashboard();
    const nav = getEventDashboardNav(context.eventId, context.normalizedMode);
    const width = mobile ? "100%" : collapsed ? 72 : 238;
    const compact = collapsed && !mobile;

    const mainItems = nav.filter((item) => item.section === "main");
    const operationItems = nav.filter((item) => item.section === "operations");
    const settingsItem = nav.find((item) => item.section === "settings");

    return (
        <motion.aside
            animate={{ width }}
            transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.8 }}
            className={cn(
                "relative z-20 flex h-full min-h-0 min-w-0 flex-shrink-0 flex-col overflow-visible rounded-[18px] border border-slate-200/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl",
                mobile && "rounded-none border-0 shadow-none"
            )}
        >
            <div className="flex h-14 items-center gap-2 px-2 pt-2">
                <Link
                    href="/dashboard/organized"
                    onClick={onNavigate}
                    className={cn(
                        "flex min-w-0 items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-2 py-1.5 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950",
                        compact && "justify-center px-1.5"
                    )}
                >
                    <ChevronLeft size={15} className="shrink-0" />
                    {!compact && (
                        <motion.span animate={{ opacity: 1, width: "auto" }} className="min-w-0 overflow-hidden whitespace-nowrap text-[12px] font-semibold">
                            Go to My Events
                        </motion.span>
                    )}
                </Link>
            </div>

            <nav className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 px-1.5 pb-1">
                <div className="min-w-0">
                    <EventSwitcher compact={compact} />
                </div>

                <Section label="Manage" items={mainItems} pathname={pathname} collapsed={compact} onNavigate={onNavigate} />
                {operationItems.length > 0 && (
                    <Section label="Operations" items={operationItems} pathname={pathname} collapsed={compact} onNavigate={onNavigate} />
                )}
                {settingsItem && (
                    <Section label="Config" items={[settingsItem]} pathname={pathname} collapsed={compact} onNavigate={onNavigate} />
                )}

                {!mobile && (
                    <button
                        type="button"
                        aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
                        onClick={() => onCollapsedChange(!collapsed)}
                        className="absolute right-[-10px] top-[106px] z-30 grid size-[22px] place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        {compact ? <PanelLeft size={12} /> : <PanelLeftClose size={12} />}
                    </button>
                )}
            </nav>
        </motion.aside>
    );
}
