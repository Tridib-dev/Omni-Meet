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
                <p className={compact ? "text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30" : "text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30"}>
                    Quick actions
                </p>
                <h2 className={compact ? "text-[16px] font-semibold text-white/90" : "text-[18px] font-semibold text-white/90"}>
                    Fast paths to the places you use most
                </h2>
            </div>

            <div className={compact ? "grid gap-2.5 md:grid-cols-3" : "grid gap-3 md:grid-cols-3"}>
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
                                className={compact ? "group flex h-full min-h-[126px] flex-col justify-between rounded-[18px] border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-[#332be0]/30 hover:bg-[rgba(51,43,224,0.08)]" : "group flex h-full min-h-[144px] flex-col justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:border-[#332be0]/30 hover:bg-[rgba(51,43,224,0.08)]"}
                            >
                                <div className={compact ? "space-y-3" : "space-y-4"}>
                                    <div className={compact ? "flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]" : "flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"} style={{ color: INDIGO }}>
                                        <Icon size={compact ? 16 : 18} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className={compact ? "text-[14px] font-semibold text-white/90" : "text-[15px] font-semibold text-white/90"}>{action.title}</p>
                                        <p className={compact ? "text-[11px] leading-relaxed text-white/40" : "text-[12px] leading-relaxed text-white/40"}>
                                            {action.description}
                                        </p>
                                    </div>
                                </div>

                                <div className={compact ? "mt-4 flex items-center gap-1 text-[11px] font-medium" : "mt-5 flex items-center gap-1 text-[12px] font-medium"} style={{ color: INDIGO }}>
                                    Open <ArrowRight size={compact ? 13 : 14} />
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
