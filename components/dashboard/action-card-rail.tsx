"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowRight, BarChart3, Bookmark, Calendar, Settings, Ticket, User } from "lucide-react";
import { motion } from "framer-motion";
import HorizontalScrollProgress from "@/components/event-dashboard/shared/HorizontalScrollProgress";

const INDIGO = "#332be0";

type ActionRailItem = {
    label: string;
    description: string;
    href: string;
    icon: ReactNode;
};

const ACTION_ITEMS: ActionRailItem[] = [
    {
        label: "My Tickets",
        description: "Review upcoming bookings and attended tickets.",
        href: "/dashboard/attended",
        icon: <Ticket size={18} />,
    },
    {
        label: "Saved Events",
        description: "Jump back into events you bookmarked for later.",
        href: "/dashboard/saved",
        icon: <Bookmark size={18} />,
    },
    {
        label: "My Events",
        description: "Manage events you created or co-host.",
        href: "/dashboard/organized",
        icon: <Calendar size={18} />,
    },
    {
        label: "Analytics",
        description: "See attendance, hosting, and profile insights.",
        href: "/dashboard/analytics",
        icon: <BarChart3 size={18} />,
    },
    {
        label: "Profile",
        description: "Edit your public profile and account identity.",
        href: "/dashboard/profile",
        icon: <User size={18} />,
    },
    {
        label: "Settings",
        description: "Update preferences and dashboard defaults.",
        href: "/dashboard/settings",
        icon: <Settings size={18} />,
    },
];

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

function DashboardActionCard({
    item,
    index,
}: {
    item: ActionRailItem;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="h-full"
        >
            <Link
                href={item.href}
                className="flex h-full min-h-[136px] min-w-[220px] flex-col justify-between rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-[#332be0]/30 hover:bg-[rgba(51,43,224,0.08)]"
            >
                <div className="space-y-3">
                    <div
                        className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"
                        style={{ color: INDIGO }}
                    >
                        {item.icon}
                    </div>
                    <div className="space-y-1">
                        <p className="line-clamp-1 text-[14px] font-semibold text-white/90">{item.label}</p>
                        <p className="line-clamp-2 text-[12px] leading-relaxed text-white/40">{item.description}</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[12px] font-medium" style={{ color: INDIGO }}>
                    Open <ArrowRight size={14} />
                </div>
            </Link>
        </motion.div>
    );
}

export default function DashboardActionCardRail({
    title = "Get more info",
    description = "Explore the rest of your dashboard.",
}: {
    title?: string;
    description?: string;
}) {
    const pathname = usePathname() ?? "";
    const items = ACTION_ITEMS.filter((item) => !isActive(pathname, item.href));

    if (!items.length) return null;

    return (
        <section className="space-y-4 pt-6">
            <div className="space-y-1">
                <h2 className="text-[18px] font-semibold text-white/90">{title}</h2>
                <p className="text-[13px] text-white/40">{description}</p>
            </div>
            <HorizontalScrollProgress className="pt-1" contentClassName="pb-1">
                <div className="grid auto-cols-[240px] grid-flow-col items-stretch gap-3">
                    {items.map((item, index) => (
                        <DashboardActionCard key={item.href} item={item} index={index} />
                    ))}
                </div>
            </HorizontalScrollProgress>
        </section>
    );
}
