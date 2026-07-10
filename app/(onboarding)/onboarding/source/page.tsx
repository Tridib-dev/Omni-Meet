"use client";

// app/(onboarding)/onboarding/source/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSourceStep } from "@/lib/actions/onboarding.actions";
import { toast } from "sonner";

const SOURCES = [
    { id: "twitter_x", label: "X / Twitter" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "friend", label: "Friend or colleague" },
    { id: "google", label: "Google / Search" },
    { id: "github", label: "GitHub" },
    { id: "producthunt", label: "Product Hunt" },
    { id: "youtube", label: "YouTube" },
    { id: "podcast", label: "Podcast" },
    { id: "newsletter", label: "Newsletter / Email" },
    { id: "reddit", label: "Reddit" },
    { id: "other", label: "Other" },
];

export default function OnboardingSource() {
    const router = useRouter();
    const [selected, setSelected] = useState("");
    const [saving, setSaving] = useState(false);

    const handleContinue = async () => {
        if (!selected) return;
        setSaving(true);
        const result = await saveSourceStep(selected);
        if (result.success) {
            router.push("/onboarding/complete");
        } else {
            toast.error("Failed to save. Try again.");
            setSaving(false);
        }
    };

    return (
        <div>
            <h1 className="text-[26px] font-bold text-white tracking-tight mb-1">
                One last thing
            </h1>
            <p className="text-[14px] text-white/40 mb-8">
                How did you hear about DevEvent?
            </p>

            <div className="grid grid-cols-2 gap-2 mb-8">
                {SOURCES.map((source) => {
                    const isSelected = selected === source.id;
                    return (
                        <button
                            key={source.id}
                            onClick={() => setSelected(source.id)}
                            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all"
                            style={{
                                background: isSelected
                                    ? "rgba(6,182,212,0.1)"
                                    : "rgba(255,255,255,0.03)",
                                border: `1px solid ${isSelected
                                    ? "rgba(6,182,212,0.35)"
                                    : "rgba(255,255,255,0.08)"}`,
                            }}
                        >
                            <span
                                className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border transition-all"
                                style={{
                                    borderColor: isSelected ? "#06b6d4" : "rgba(255,255,255,0.2)",
                                    background: isSelected ? "#06b6d4" : "transparent",
                                }}
                            >
                                {isSelected && (
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#080c10" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5"/>
                                    </svg>
                                )}
                            </span>
                            <span
                                className="text-[13px] font-medium"
                                style={{ color: isSelected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}
                            >
                                {source.label}
                            </span>
                        </button>
                    );
                })}
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
                    disabled={!selected || saving}
                    className="flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
                    style={{
                        background: selected ? "#06b6d4" : "rgba(255,255,255,0.06)",
                        color: selected ? "#080c10" : "rgba(255,255,255,0.3)",
                    }}
                >
                    {saving ? "Saving…" : "Continue →"}
                </button>
            </div>
        </div>
    );
}