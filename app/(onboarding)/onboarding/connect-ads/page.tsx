"use client";

// app/(onboarding)/onboarding/connect-ads/page.tsx
import { useRouter } from "next/navigation";

const AD_PLATFORMS = [
    {
        id: "meta",
        name: "Meta Ads",
        desc: "Promote events on Facebook & Instagram",
        icon: "📘",
        color: "#1877F2",
    },
    {
        id: "google",
        name: "Google Ads",
        desc: "Run search and display campaigns for your events",
        icon: "🔍",
        color: "#4285F4",
    },
    {
        id: "tiktok",
        name: "TikTok Ads",
        desc: "Reach younger audiences with video event ads",
        icon: "🎵",
        color: "#010101",
    },
];

export default function OnboardingConnectAds() {
    const router = useRouter();

    return (
        <div>
            <h1 className="text-[26px] font-bold text-white tracking-tight mb-1">
                Promote your events
            </h1>
            <p className="text-[14px] text-white/40 mb-2">
                Connect ad accounts to manage event campaigns from one place.
            </p>
            <p className="text-[12px] text-white/25 mb-8">
                Useful for organizers. Skip this if you&apos;re only attending events.
            </p>

            <div className="space-y-3 mb-8">
                {AD_PLATFORMS.map((platform) => (
                    <div
                        key={platform.id}
                        className="flex items-center gap-4 p-4 rounded-xl"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                            style={{ background: `${platform.color}18` }}
                        >
                            {platform.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-white/85">{platform.name}</p>
                            <p className="text-[11px] text-white/35 mt-0.5">{platform.desc}</p>
                        </div>
                        <span
                            className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.3)",
                            }}
                        >
                            Coming soon
                        </span>
                    </div>
                ))}
            </div>

            <div
                className="flex items-start gap-3 p-4 rounded-xl mb-8"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
                <span className="text-amber-400 flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                    </svg>
                </span>
                <p className="text-[12px] text-amber-400/70 leading-relaxed">
                    Ad integrations require OAuth approval from each platform.
                    We&apos;re working on getting approved — this feature launches soon.
                </p>
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
                    onClick={() => router.push("/onboarding/source")}
                    className="flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98]"
                    style={{ background: "#06b6d4", color: "#080c10" }}
                >
                    Skip for now →
                </button>
            </div>
        </div>
    );
}