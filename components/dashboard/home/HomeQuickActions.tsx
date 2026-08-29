"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Calendar, Ticket } from "lucide-react";
import { motion } from "framer-motion";

const INDIGO = "#332be0";

const ACTIONS = [
    {
        title: "Saved events",
        description: "Jump back into the events you bookmarked.",
        href: "/dashboard/saved",
        icon: Bookmark,
    },
    {
        title: "My tickets",
        description: "Open your bookings and upcoming entries.",
        href: "/dashboard/attended",
        icon: Ticket,
    },
    {
        title: "My events",
        description: "Manage the events you created or co-host.",
        href: "/dashboard/organized",
        icon: Calendar,
    },
];

type Props = {
    compact?: boolean;
};

export function HomeQuickActions({ compact = false }: Props) {
    return (
        <section className={compact ? "space-y-3" : "space-y-4"}>
            <div className="space-y-1">
                <h2 className={compact ? "text-[16px] font-semibold text-slate-900" : "text-[18px] font-semibold text-slate-900"}>
                    Quick Actions
                </h2>
            </div>

            <div className={compact ? "grid grid-cols-3 gap-2.5" : "grid grid-cols-3 gap-3"}>
                {ACTIONS.map((action, index) => {
                    const Icon = action.icon;

                    return (
                        <motion.div
                            key={action.href}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06, duration: 0.35 }}
                            whileHover={{ y: -2 }}
                        >
                            <Link
                                href={action.href}
                                className={compact ? "group flex h-full min-h-[112px] flex-col justify-between rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/60 sm:min-h-[126px] sm:p-4" : "group flex h-full min-h-[144px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/60"}
                            >
                                <div className={compact ? "space-y-3" : "space-y-4"}>
                                    <div className={compact ? "flex size-8 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 sm:size-10 sm:rounded-2xl" : "flex size-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50"} style={{ color: INDIGO }}>
                                        <Icon size={compact ? 16 : 18} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className={compact ? "truncate text-[11px] font-semibold text-slate-900 sm:text-[14px]" : "text-[15px] font-semibold text-slate-900"}>{action.title}</p>
                                        <p className={compact ? "hidden text-[11px] leading-relaxed text-slate-500 sm:block" : "text-[12px] leading-relaxed text-slate-500"}>
                                            {action.description}
                                        </p>
                                    </div>
                                </div>

                                <div className={compact ? "mt-3 flex items-center gap-1 text-[10px] font-medium sm:mt-4 sm:text-[11px]" : "mt-5 flex items-center gap-1 text-[12px] font-medium"} style={{ color: INDIGO }}>
                                    <span className="hidden sm:inline">Open</span> <ArrowRight size={compact ? 13 : 14} />
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
