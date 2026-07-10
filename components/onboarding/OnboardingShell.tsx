"use client";

// components/onboarding/OnboardingShell.tsx
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const STEPS = [
    { path: "/onboarding/profile",       label: "Profile",       num: 1 },
    { path: "/onboarding/interests",     label: "Interests",     num: 2 },
    { path: "/onboarding/connect-tools", label: "Tools",         num: 3 },
    { path: "/onboarding/connect-ads",   label: "Ads",           num: 4 },
    { path: "/onboarding/source",        label: "How you heard", num: 5 },
    { path: "/onboarding/complete",      label: "Done",          num: 6 },
];

export default function OnboardingShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const currentIndex = STEPS.findIndex((s) => s.path === pathname);
    const current = STEPS[currentIndex] ?? STEPS[0];
    const progress = ((currentIndex + 1) / STEPS.length) * 100;

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: "#080c10" }}
        >
            {/* Top bar */}
            <div
                className="flex items-center justify-between px-6 h-14 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/icons/logo.png" alt="DevEvent" width={22} height={22} />
                    <span className="text-[14px] font-semibold text-white/80">DevEvent</span>
                </Link>

                <span className="text-[12px] text-white/30 font-mono">
                    Step {current.num} of {STEPS.length}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                    className="h-full"
                    style={{ background: "linear-gradient(to right, #06b6d4, #8b5cf6)" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>

            {/* Step pills */}
            <div className="flex items-center justify-center gap-2 pt-6 pb-2 flex-wrap px-4">
                {STEPS.map((step, i) => {
                    const isDone = i < currentIndex;
                    const isCurrent = i === currentIndex;
                    return (
                        <div
                            key={step.path}
                            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full transition-all"
                            style={{
                                background: isCurrent
                                    ? "rgba(6,182,212,0.12)"
                                    : isDone
                                    ? "rgba(34,197,94,0.08)"
                                    : "rgba(255,255,255,0.03)",
                                border: `1px solid ${isCurrent
                                    ? "rgba(6,182,212,0.3)"
                                    : isDone
                                    ? "rgba(34,197,94,0.2)"
                                    : "rgba(255,255,255,0.07)"}`,
                                color: isCurrent
                                    ? "#67e8f9"
                                    : isDone
                                    ? "#22c55e"
                                    : "rgba(255,255,255,0.25)",
                            }}
                        >
                            {isDone ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            ) : (
                                <span className="font-mono">{step.num}</span>
                            )}
                            <span className="hidden sm:block">{step.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Page content */}
            <div className="flex-1 flex items-start justify-center px-4 py-8 overflow-y-auto">
                <div className="w-full max-w-lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
