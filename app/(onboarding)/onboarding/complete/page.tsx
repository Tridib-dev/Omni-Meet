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
    const [isHovering, setIsHovering] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({
                origin: { y: 0.55 },
                colors: ["#008AF7", "#0068C4", "#12B76A", "#ffffff"],
                ...opts,
                particleCount: Math.floor(200 * particleRatio),
            });
        };
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });

        completeOnboarding().then(() => setDone(true));
    }, []);

    const handleGo = async () => {
        setCompleting(true);
        session?.clearCache();
        await session?.getToken({ skipCache: true });
        window.location.replace("/dashboard");
    };

    const btnState = completing || !done ? "loading" : isPressed ? "active" : isHovering ? "hover" : "normal";

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    background: "var(--onb-blue-tint)",
                    border: "2px solid var(--onb-blue)",
                }}
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#008AF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{ fontSize: 24, fontWeight: 700, color: "var(--onb-ink)", margin: "0 0 8px" }}
            >
                You&apos;re all set! 🎉
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{ fontSize: 13.5, color: "var(--onb-ink-soft)", maxWidth: 360, lineHeight: 1.6, margin: "0 0 28px" }}
            >
                Your DevEvent profile is ready. Start discovering events, connect with the community, or host your first event.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%", marginBottom: 24 }}
            >
                {[
                    { emoji: "🔍", label: "Discover events", href: "/events/discover" },
                    { emoji: "📅", label: "Create an event", href: "/create_event" },
                    { emoji: "👤", label: "View profile", href: "/dashboard/profile" },
                ].map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className="onb-option-card onb-option-card--centered"
                        style={{ cursor: "pointer", transition: "transform 0.18s var(--onb-ease)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                        <span style={{ fontSize: 22 }}>{item.emoji}</span>
                        <span className="onb-option-card-label" style={{ fontSize: 11.5 }}>{item.label}</span>
                    </a>
                ))}
            </motion.div>

            <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                onClick={handleGo}
                disabled={completing || !done}
                className="onb-btn onb-btn-primary"
                data-state={btnState}
                style={{ width: "100%" }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                    setIsHovering(false);
                    setIsPressed(false);
                }}
                onPointerDown={() => setIsPressed(true)}
                onPointerUp={() => setIsPressed(false)}
            >
                {completing ? "Loading dashboard…" : !done ? "Setting up…" : "Go to my dashboard →"}
                {(completing || !done) && <span className="onb-btn-spinner" aria-hidden="true" />}
            </motion.button>
        </div>
    );
}