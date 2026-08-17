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

export function HomeQuickActions() {
    return (
        <section className="space-y-4">
            <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                    Quick actions
                </p>
                <h2 className="text-[18px] font-semibold text-white/90">
                    Fast paths to the places you use most
                </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
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
                                className="group flex h-full min-h-[144px] flex-col justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:border-[#332be0]/30 hover:bg-[rgba(51,43,224,0.08)]"
                            >
                                <div className="space-y-4">
                                    <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]" style={{ color: INDIGO }}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[15px] font-semibold text-white/90">{action.title}</p>
                                        <p className="text-[12px] leading-relaxed text-white/40">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center gap-1 text-[12px] font-medium" style={{ color: INDIGO }}>
                                    Open <ArrowRight size={14} />
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
