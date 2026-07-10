"use client";

// app/(onboarding)/onboarding/interests/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveInterestsStep } from "@/lib/actions/onboarding.actions";
import { toast } from "sonner";

const ROLES = [
    { id: "attendee", label: "Event Attendee", desc: "I discover and attend events", icon: "🎟️" },
    { id: "organizer", label: "Event Organizer", desc: "I host and manage events", icon: "🎪" },
    { id: "both", label: "Both", desc: "I attend and organize events", icon: "⚡" },
];

const INTEREST_TAGS = [
    "Web Dev", "Mobile Dev", "AI / ML", "DevOps", "Cloud",
    "Blockchain", "Open Source", "Startups", "Design", "Data",
    "Security", "Gaming", "AR / VR", "Robotics", "Networking",
    "Hackathons", "Workshops", "Conferences", "Meetups", "Career",
];

export default function OnboardingInterests() {
    const router = useRouter();
    const [role, setRole] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const toggleInterest = (tag: string) => {
        setInterests((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const canContinue = role !== "" && interests.length >= 1;

    const handleContinue = async () => {
        if (!canContinue) return;
        setSaving(true);
        const result = await saveInterestsStep({ role, interests });
        if (result.success) {
            router.push("/onboarding/connect-tools");
        } else {
            toast.error("Failed to save. Try again.");
            setSaving(false);
        }
    };

    return (
        <div>
            <h1 className="text-[26px] font-bold text-white tracking-tight mb-1">
                What brings you here?
            </h1>
            <p className="text-[14px] text-white/40 mb-8">
                This helps us personalise your experience.
            </p>

            {/* Role selection */}
            <div className="mb-8">
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-white/40 mb-3">
                    I am primarily a…
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {ROLES.map((r) => {
                        const selected = role === r.id;
                        return (
                            <button
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all"
                                style={{
                                    background: selected ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${selected ? "rgba(6,182,212,0.35)" : "rgba(255,255,255,0.08)"}`,
                                }}
                            >
                                <span className="text-2xl">{r.icon}</span>
                                <div>
                                    <p className="text-[12px] font-semibold text-white/85">{r.label}</p>
                                    <p className="text-[10px] text-white/35 mt-0.5 leading-snug">{r.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Interest tags */}
            <div className="mb-8">
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                    Topics I care about
                </label>
                <p className="text-[11px] text-white/25 mb-3">Pick at least 1</p>
                <div className="flex flex-wrap gap-2">
                    {INTEREST_TAGS.map((tag) => {
                        const selected = interests.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleInterest(tag)}
                                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                                style={{
                                    background: selected ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                                    border: `1px solid ${selected ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.09)"}`,
                                    color: selected ? "#a78bfa" : "rgba(255,255,255,0.5)",
                                }}
                            >
                                {selected && <span className="mr-1">✓</span>}
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => router.back()}
                    className="px-5 py-3 rounded-xl text-[13px] text-white/40 hover:text-white/70 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                    ← Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!canContinue || saving}
                    className="flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
                    style={{ background: canContinue ? "#06b6d4" : "rgba(255,255,255,0.06)", color: canContinue ? "#080c10" : "rgba(255,255,255,0.3)" }}
                >
                    {saving ? "Saving…" : "Continue →"}
                </button>
            </div>
        </div>
    );
}
