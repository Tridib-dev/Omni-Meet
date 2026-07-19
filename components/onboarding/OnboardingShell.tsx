"use client";

// components/onboarding/OnboardingShell.tsx
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingTopBar, { OnboardingStepDef } from "./OnboardingTopBar";
import { ONBOARDING_ILLUSTRATIONS } from "./illustrations";
import "./styles/onboarding-theme.css";

const STEPS: OnboardingStepDef[] = [
    { path: "/onboarding/profile", label: "Profile" },
    { path: "/onboarding/interests", label: "Interests" },
    { path: "/onboarding/connect-tools", label: "Tools" },
    { path: "/onboarding/connect-ads", label: "Ads" },
    { path: "/onboarding/source", label: "How you heard" },
    { path: "/onboarding/complete", label: "Done" },
];

export default function OnboardingShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const currentIndex = Math.max(0, STEPS.findIndex((s) => s.path === pathname));
    const [topbarHeight, setTopbarHeight] = useState<number | null>(null);
    const heroDoodle = ONBOARDING_ILLUSTRATIONS[pathname];

    return (
        <div className="onb-scope">
            <OnboardingTopBar steps={STEPS} currentIndex={currentIndex} onHeightChange={setTopbarHeight} />

            <div className="onb-page" style={topbarHeight !== null ? { paddingTop: topbarHeight } : undefined}>
                <div className="onb-card">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {heroDoodle && (
                                <motion.div
                                    className="onb-hero-doodle"
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
                                >
                                    <div className="onb-halo onb-halo--breathing" aria-hidden="true" />
                                    {heroDoodle}
                                </motion.div>
                            )}
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}