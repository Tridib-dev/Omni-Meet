"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

export default function ActionCard({
    title,
    description,
    href,
    index = 0,
    eventId,
    pageId,
}: {
    title: string;
    description?: string;
    href: string;
    index?: number;
    eventId?: string;
    pageId?: string;
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
                href={href}
                onClick={() => {
                    posthog.capture("event_dashboard_action_card_click", {
                        event_id: eventId,
                        from_page: pageId,
                        target: title,
                        href,
                    });
                }}
                className="flex h-full min-h-[136px] min-w-[220px] flex-col justify-between rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-[#332be0]/30 hover:bg-[#332be0]/8 sm:p-5"
            >
                <div className="space-y-1">
                    <p className="line-clamp-1 text-[14px] font-semibold text-white/90">{title}</p>
                    {description && (
                        <p className="line-clamp-2 text-[12px] leading-relaxed text-white/40">{description}</p>
                    )}
                </div>
                <div className="mt-4 flex items-center gap-1 text-[12px] font-medium" style={{ color: edTokens.accent }}>
                    Open <ArrowRight size={14} />
                </div>
            </Link>
        </motion.div>
    );
}
