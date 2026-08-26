"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
    const isOverviewPage = pathname.endsWith("/overview");
    const { context } = useEventDashboard();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const mainRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if ("scrollRestoration" in history) {
            const prev = history.scrollRestoration;
            history.scrollRestoration = "manual";
            return () => {
                history.scrollRestoration = prev;
            };
        }
    }, []);

    useLayoutEffect(() => {
        const main = mainRef.current;
        if (!main) return;

        main.scrollTop = 0;
        main.scrollLeft = 0;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        const raf1 = requestAnimationFrame(() => {
            main.scrollTop = 0;
            main.scrollLeft = 0;
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
        const raf2 = requestAnimationFrame(() => {
            main.scrollTop = 0;
            main.scrollLeft = 0;
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });

        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [pathname]);

    return (
        <div
            data-event-dashboard
            className="h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-2.5 sm:p-3"
            style={{ backgroundColor: edTokens.canvas, color: edTokens.textPrimary }}
        >
            <EventDashboardTracker eventId={context.eventId} />
            <div className="flex h-full min-h-0 gap-2.5 sm:gap-3">
                <div className="hidden md:block">
                    <EventSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
                </div>

                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent
                        showCloseButton={false}
                        side="left"
                        className="!w-[75vw] !max-w-[245px] gap-0 overflow-hidden border-slate-200 bg-white p-0 md:hidden"
                    >
                        <EventSidebar
                            collapsed={false}
                            onCollapsedChange={() => setMobileOpen(false)}
                            onNavigate={() => setMobileOpen(false)}
                            mobile
                        />
                    </SheetContent>
                </Sheet>

                <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-3">
                    <EventTopbar onMenuClick={() => setMobileOpen(true)} />

                    <main
                        ref={mainRef}
                        data-dashboard-main
                        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]"
                        style={{ overflowAnchor: "none", scrollBehavior: "auto" }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                                className={`w-full px-3.5 pb-20 ${isOverviewPage ? "pt-0" : "pt-5"} sm:px-5 lg:px-7 xl:px-9`}                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
}
