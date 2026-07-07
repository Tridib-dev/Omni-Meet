"use client";

// components/dashboard/shell.tsx
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "./sidebar";
import DashboardTopbar from "./topbar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: "#080c10" }}>
            <DashboardSidebar />

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <DashboardTopbar />

                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="mx-auto max-w-[1200px] px-8 pt-8 pb-24"
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
        <div className="flex items-start justify-between mb-8 gap-6">
            <div className="min-w-0">
                {kicker && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-500/80 mb-1.5">
                        {kicker}
                    </p>
                )}
                <h1 className="text-[28px] font-semibold text-white tracking-[-0.02em] leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1.5 text-[13px] text-white/40 leading-relaxed max-w-md">
                        {description}
                    </p>
                )}
            </div>
            {right && <div className="flex-shrink-0 pt-1">{right}</div>}
        </div>
    );
}