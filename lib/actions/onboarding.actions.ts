"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/database/User.model";

type OnboardingMetadata = {
    onboarded?: boolean;
    [key: string]: unknown;
};

type OnboardingProgressRecord = {
    onboardingStep?: number;
    bio?: string;
    role?: string;
    interests?: string[];
    hearAboutUs?: string;
};

function mergePublicMetadata(existing: unknown, patch: OnboardingMetadata) {
    const base = existing && typeof existing === "object" ? (existing as Record<string, unknown>) : {};
    return {
        ...base,
        ...patch,
    };
}

// ─── Save Step 1: Profile (bio) ───────────────────────────────────────────────
export async function saveProfileStep(bio: string) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectToDatabase();
    await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: { bio: bio.trim(), onboardingStep: 1 } },
        { returnDocument: "after" }
    );
    return { success: true };
}

// ─── Save Step 2: Role + Interests ───────────────────────────────────────────
export async function saveInterestsStep(data: {
    role: string;
    interests: string[];
}) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectToDatabase();
    await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: { role: data.role, interests: data.interests, onboardingStep: 2 } },
        { returnDocument: "after" }
    );
    return { success: true };
}

// ─── Save Step 5: Attribution ─────────────────────────────────────────────────
export async function saveSourceStep(hearAboutUs: string) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectToDatabase();
    await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: { hearAboutUs, onboardingStep: 5 } },
        { returnDocument: "after" }
    );
    return { success: true };
}

// ─── Complete onboarding ──────────────────────────────────────────────────────
// Sets onboarded: true in BOTH MongoDB AND Clerk publicMetadata.
// The Clerk publicMetadata update makes it available in the JWT session claims
// so middleware can gate future requests without a DB round-trip.
export async function completeOnboarding() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectToDatabase();

    // 1. Update MongoDB
    await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: { onboarded: true, onboardingStep: 6 } },
        { returnDocument: "after" }
    );

    // 2. Update Clerk publicMetadata without overwriting existing settings.
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    await clerk.users.updateUserMetadata(userId, {
        publicMetadata: mergePublicMetadata(clerkUser.publicMetadata, { onboarded: true }),
    });

    return { success: true };
}

// ─── Get current onboarding progress ─────────────────────────────────────────
// Used by layout to determine which step to resume on
export async function getOnboardingProgress() {
    const { userId } = await auth();
    if (!userId) return { step: 0, bio: "", role: "", interests: [], hearAboutUs: "" };

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId })
        .select("onboardingStep bio role interests hearAboutUs")
        .lean<OnboardingProgressRecord | null>();

    return {
        step: user?.onboardingStep ?? 0,
        bio: user?.bio ?? "",
        role: user?.role ?? "",
        interests: user?.interests ?? [],
        hearAboutUs: user?.hearAboutUs ?? "",
    };
}
