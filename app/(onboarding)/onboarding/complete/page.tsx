"use client";

// app/(onboarding)/onboarding/complete/page.tsx
import { useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { completeOnboarding } from "@/lib/actions/onboarding.actions";
import { motion } from "framer-motion";

export default function OnboardingComplete() {
    const { session } = useSession();
    const [completing, setCompleting] = useState(false);
    const [done, setDone] = useState(false);

    // Fire confetti on mount + mark onboarded
    useEffect(() => {
        // Confetti burst
        const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({ origin: { y: 0.55 }, ...opts, particleCount: Math.floor(200 * particleRatio) });
        };
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2,  { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1,  { spread: 120, startVelocity: 45 });

        // Mark onboarded in background
        completeOnboarding().then(() => setDone(true));
    }, []);

    const handleGo = async () => {
        setCompleting(true);

        // Force Clerk to fetch a fresh session token so the updated
        // `onboarded` claim is available before we hit middleware.
        session?.clearCache();
        await session?.getToken({ skipCache: true });

        window.location.replace("/dashboard");
    };

    return (
        <div className="flex flex-col items-center text-center py-8">
            {/* Success icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{
                    background: "rgba(6,182,212,0.12)",
                    border: "2px solid rgba(6,182,212,0.35)",
                }}
            >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-[28px] font-bold text-white tracking-tight mb-2"
            >
                You&apos;re all set! 🎉
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="text-[14px] text-white/45 max-w-sm leading-relaxed mb-10"
            >
                Your DevEvent profile is ready. Start discovering events,
                connect with the community, or host your first event.
            </motion.p>

            {/* Quick links */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="grid grid-cols-3 gap-3 w-full mb-10"
            >
                {[
                    { emoji: "🔍", label: "Discover events", href: "/events/discover" },
                    { emoji: "📅", label: "Create an event", href: "/create_event" },
                    { emoji: "👤", label: "View profile", href: "/dashboard/profile" },
                ].map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="text-[11px] text-white/50 leading-tight text-center">{item.label}</span>
                    </a>
                ))}
            </motion.div>

            <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                onClick={handleGo}
                disabled={completing || !done}
                className="w-full py-3.5 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: "#06b6d4", color: "#080c10" }}
            >
                {completing ? "Loading dashboard…" : !done ? "Setting up…" : "Go to my dashboard →"}
            </motion.button>
        </div>
    );
}
