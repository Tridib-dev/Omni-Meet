"use client";

// components/dashboard/shell.tsx
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "./sidebar";
import DashboardTopbar from "./topbar";
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

                <main data-dashboard-main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
                {kicker && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-500/80 mb-1.5">
                        {kicker}
                    </p>
                )}
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
