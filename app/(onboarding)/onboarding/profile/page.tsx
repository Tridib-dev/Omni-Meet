"use client";

// app/(onboarding)/onboarding/profile/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { saveProfileStep } from "@/lib/actions/onboarding.actions";
import { toast } from "sonner";
import StepNav from "@/components/onboarding/StepNav";

export default function OnboardingProfile() {
    const { user } = useUser();
    const router = useRouter();
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    const initials = [user?.firstName, user?.lastName].map((n) => n?.[0]).filter(Boolean).join("").toUpperCase();

    const handleContinue = async () => {
        setSaving(true);
        const result = await saveProfileStep(bio);
        if (result.success) {
            router.push("/onboarding/interests");
        } else {
            toast.error("Failed to save. Try again.");
            setSaving(false);
        }
    };

    return (
        <>
            <p className="onb-step-eyebrow">Step 1 of 6</p>
            <h1 className="onb-step-title">Welcome to DevEvent</h1>
            <p className="onb-step-subtitle">Let&apos;s set up your profile. This takes about 2 minutes.</p>

            <div className="onb-step-body">
                <div className="onb-avatar-card">
                    <div className="onb-avatar-circle">
                        {user?.imageUrl ? (
                            <Image src={user.imageUrl} alt={fullName} width={52} height={52} />
                        ) : (
                            initials
                        )}
                    </div>
                    <div>
                        <p className="onb-avatar-name">{fullName}</p>
                        <p className="onb-avatar-email">{user?.emailAddresses[0]?.emailAddress}</p>
                        <p className="onb-avatar-caption">Photo pulled from your Google account</p>
                    </div>
                </div>

                <div className="onb-field">
                    <label htmlFor="bio">
                        Bio <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                    </label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={200}
                        rows={4}
                        placeholder="Tell the community a bit about yourself — what you build, what events you love, or what you're looking for..."
                    />
                    <p className="onb-field-hint" style={{ textAlign: "right" }}>
                        {bio.length}/200
                    </p>
                </div>
            </div>

            <StepNav
                isFirstStep
                onContinue={handleContinue}
                isLoading={saving}
                continueLabel={saving ? "Saving…" : "Continue →"}
            />
        </>
    );
}