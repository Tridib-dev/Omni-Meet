"use client";

// components/dashboard/shell.tsx
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "./sidebar";
import DashboardTopbar from "./topbar";
import DashboardActionCardRail from "@/components/dashboard/action-card-rail";
import type { AccessibleDashboardEvent } from "@/lib/event-dashboard/access";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardShell({
    children,
    recentEvents = [],
}: {
    children: React.ReactNode;
    recentEvents?: AccessibleDashboardEvent[];
}) {
    const pathname = usePathname();
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
        <div className="flex h-dvh min-h-0 overflow-hidden" style={{ background: "#080c10" }}>
            <div className="hidden md:block">
                <DashboardSidebar />
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent showCloseButton={false} side="left" className="!w-[220px] !max-w-[220px] gap-0 overflow-hidden border-white/8 bg-[#1f1f1f] p-0 md:hidden">
                    <DashboardSidebar mobile onNavigate={() => setMobileOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <DashboardTopbar onMenuClick={() => setMobileOpen(true)} recentEvents={recentEvents} />

                <main
                    ref={mainRef}
                    data-dashboard-main
                    className="min-h-0 flex-1 overscroll-y-none overflow-y-auto overflow-x-hidden"
                    style={{ overflowAnchor: "none", scrollBehavior: "auto" }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full px-4 pb-20 pt-0 sm:px-5 lg:px-6 xl:px-8"
                        >
                            <div className="space-y-8">
                                {children}
                                <DashboardActionCardRail />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// ─── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({
    kicker,
    title,
    description,
    right,
}: {
    kicker?: string;
    title: string;
    description?: string;
    right?: React.ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:mb-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
                <h1 className="text-[24px] font-semibold leading-tight text-white sm:text-[28px]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1.5 text-[13px] text-white/40 leading-relaxed max-w-md">
                        {description}
                    </p>
                )}
            </div>
            {right && <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0 lg:pt-1">{right}</div>}
        </div>
    );
}
