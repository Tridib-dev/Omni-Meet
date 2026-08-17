"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { edTokens } from "@/components/event-dashboard/theme/tokens";
import EventSidebar from "@/components/event-dashboard/shell/EventSidebar";
import EventTopbar from "@/components/event-dashboard/shell/EventTopbar";
import EventDashboardTracker from "@/components/event-dashboard/shared/EventDashboardTracker";
import { useEventDashboard } from "@/components/event-dashboard/shell/EventDashboardProvider";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function EventDashboardShellInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { context } = useEventDashboard();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div
            className="flex h-dvh min-h-0 overflow-hidden"
            style={{ background: edTokens.canvas, color: edTokens.textPrimary }}
        >
            <EventDashboardTracker eventId={context.eventId} />
            <div className="hidden md:block">
                <EventSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent showCloseButton={false} side="left" className="!w-[220px] !max-w-[220px] gap-0 overflow-hidden border-white/8 bg-[#111318] p-0 md:hidden">
                    <EventSidebar collapsed={false} onCollapsedChange={() => setMobileOpen(false)} mobile />
                </SheetContent>
            </Sheet>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <EventTopbar onMenuClick={() => setMobileOpen(true)} />

                <main data-dashboard-main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full px-4 pb-20 pt-4 sm:px-5 sm:pt-5 lg:px-6 xl:px-8"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
