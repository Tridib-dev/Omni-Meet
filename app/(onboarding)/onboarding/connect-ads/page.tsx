"use client";

// app/(onboarding)/onboarding/connect-ads/page.tsx
import { useRouter } from "next/navigation";
import InfoRow from "@/components/onboarding/InfoRow";
import StepNav from "@/components/onboarding/StepNav";

const AD_PLATFORMS = [
    { id: "meta", name: "Meta Ads", desc: "Promote events on Facebook & Instagram", icon: "📘", color: "#1877F2" },
    { id: "google", name: "Google Ads", desc: "Run search and display campaigns for your events", icon: "🔍", color: "#4285F4" },
    { id: "tiktok", name: "TikTok Ads", desc: "Reach younger audiences with video event ads", icon: "🎵", color: "#010101" },
];

export default function OnboardingConnectAds() {
    const router = useRouter();

    return (
        <>
            <p className="onb-step-eyebrow">Step 4 of 6</p>
            <h1 className="onb-step-title">Promote your events</h1>
            <p className="onb-step-subtitle">
                Connect ad accounts to manage campaigns from one place. Useful for organizers — skip if you&apos;re only attending events.
            </p>

            <div className="onb-step-body">
                {AD_PLATFORMS.map((platform) => (
                    <InfoRow
                        key={platform.id}
                        icon={<span style={{ fontSize: 18 }}>{platform.icon}</span>}
                        iconBg={`${platform.color}18`}
                        iconColor={platform.color}
                        title={platform.name}
                        description={platform.desc}
                    />
                ))}

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        padding: 14,
                        borderRadius: "var(--onb-radius-md)",
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.25)",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" style={{ flex: "none", marginTop: 2 }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5, margin: 0 }}>
                        Ad integrations require OAuth approval from each platform. We&apos;re working on getting
                        approved — this feature launches soon.
                    </p>
                </div>
            </div>

            <StepNav
                onBack={() => router.back()}
                onContinue={() => router.push("/onboarding/source")}
                continueLabel="Skip for now →"
            />
        </>
    );
}