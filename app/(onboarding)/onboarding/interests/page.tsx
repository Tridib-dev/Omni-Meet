"use client";

// app/(onboarding)/onboarding/interests/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveInterestsStep } from "@/lib/actions/onboarding.actions";
import { toast } from "sonner";
import OptionCard from "@/components/onboarding/OptionCard";
import TagToggleGrid from "@/components/onboarding/TagToggleGrid";
import StepNav from "@/components/onboarding/StepNav";

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
        <>
            <p className="onb-step-eyebrow">Step 2 of 6</p>
            <h1 className="onb-step-title">What brings you here?</h1>
            <p className="onb-step-subtitle">This helps us personalise your experience.</p>

            <div className="onb-step-body">
                <div className="onb-field">
                    <label>I am primarily a…</label>
                    <div className="onb-card-grid">
                        {ROLES.map((r) => (
                            <OptionCard
                                key={r.id}
                                variant="centered"
                                selected={role === r.id}
                                title={r.label}
                                description={r.desc}
                                icon={r.icon}
                                onSelect={() => setRole(r.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="onb-field">
                    <label>Topics I care about</label>
                    <p className="onb-field-hint">Pick at least 1</p>
                    <TagToggleGrid options={INTEREST_TAGS} selected={interests} onToggle={toggleInterest} />
                </div>
            </div>

            <StepNav
                onBack={() => router.back()}
                onContinue={handleContinue}
                isContinueDisabled={!canContinue}
                isLoading={saving}
                continueLabel={saving ? "Saving…" : "Continue →"}
            />
        </>
    );
}