"use client";

// app/(onboarding)/onboarding/profile/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { saveProfileStep } from "@/lib/actions/onboarding.actions";
import { toast } from "sonner";

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
        <div>
            <h1 className="text-[26px] font-bold text-white tracking-tight mb-1">
                Welcome to DevEvent
            </h1>
            <p className="text-[14px] text-white/40 mb-8">
                Let&apos;s set up your profile. This takes about 2 minutes.
            </p>

            {/* Avatar preview — from Clerk */}
            <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white">
                    {user?.imageUrl ? (
                        <Image src={user.imageUrl} alt={fullName} width={56} height={56} className="w-full h-full object-cover" />
                    ) : initials}
                </div>
                <div>
                    <p className="text-[14px] font-semibold text-white/90">{fullName}</p>
                    <p className="text-[12px] text-white/35">{user?.emailAddresses[0]?.emailAddress}</p>
                    <p className="text-[11px] text-white/25 mt-0.5">Photo pulled from your Google account</p>
                </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                    Bio <span className="text-white/20 normal-case font-normal">(optional)</span>
                </label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={200}
                    rows={4}
                    placeholder="Tell the community a bit about yourself — what you build, what events you love, or what you're looking for..."
                    className="w-full px-4 py-3 rounded-xl text-[13px] text-white/80 outline-none resize-none transition-colors"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(6,182,212,0.4)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <p className="text-[11px] text-white/20 text-right mt-1">{bio.length}/200</p>
            </div>

            <button
                onClick={handleContinue}
                disabled={saving}
                className="w-full py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: "#06b6d4", color: "#080c10" }}
            >
                {saving ? "Saving…" : "Continue →"}
            </button>
        </div>
    );
}