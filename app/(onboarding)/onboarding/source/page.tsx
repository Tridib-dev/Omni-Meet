"use client";

// app/(onboarding)/onboarding/source/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSourceStep } from "@/lib/actions/onboarding.actions";
import { toast } from "sonner";
import OptionCard from "@/components/onboarding/OptionCard";
import StepNav from "@/components/onboarding/StepNav";

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
        <>
            <p className="onb-step-eyebrow">Step 5 of 6</p>
            <h1 className="onb-step-title">One last thing</h1>
            <p className="onb-step-subtitle">How did you hear about DevEvent?</p>

            <div className="onb-step-body">
                <div className="onb-card-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                    {SOURCES.map((source) => (
                        <OptionCard
                            key={source.id}
                            variant="compact"
                            selected={selected === source.id}
                            title={source.label}
                            onSelect={() => setSelected(source.id)}
                        />
                    ))}
                </div>
            </div>

            <StepNav
                onBack={() => router.back()}
                onContinue={handleContinue}
                isContinueDisabled={!selected}
                isLoading={saving}
                continueLabel={saving ? "Saving…" : "Continue →"}
            />
        </>
    );
}