"use server";

import User from "@/database/User.model";
import connectToDatabase from "@/lib/mongodb";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateUserParams {
    clerkId: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    photo: string;
    onboarded?: boolean;
    onboardingStep?: number;
}

export interface UpdateUserParams {
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
}

export interface ClerkUserSnapshot {
    id: string;
    emailAddresses: { emailAddress: string }[];
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Called by the Clerk webhook when a user.created event fires.
 * Persists the new Clerk user into MongoDB.
 */
export const createUser = async (params: CreateUserParams) => {
    try {
        await connectToDatabase();

        const user = await User.create({
            ...params,
            onboarded: params.onboarded ?? false,
            onboardingStep: params.onboardingStep ?? 0,
        });
        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("[createUser]", error);
        throw new Error("Failed to create user in database.");
    }
};

/**
 * Ensures a MongoDB user exists for the current Clerk user.
 * Used as a fallback for accounts created before webhook sync was available.
 */
export const upsertUserFromClerk = async (clerkUser: ClerkUserSnapshot) => {
    try {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) return null;

        await connectToDatabase();

        const user = await User.findOneAndUpdate(
            { clerkId: clerkUser.id },
            {
                $set: {
                    clerkId: clerkUser.id,
                    email,
                    username: clerkUser.username ?? email.split("@")[0],
                    firstName: clerkUser.firstName ?? "",
                    lastName: clerkUser.lastName ?? "",
                    photo: clerkUser.imageUrl ?? "",
                    onboarded: false,
                    onboardingStep: 0,
                },
            },
            { upsert: true, returnDocument: "after" , setDefaultsOnInsert: true }
        );

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("[upsertUserFromClerk]", error);
        return null;
    }
};

/**
 * Called by the Clerk webhook when a user.updated event fires.
 * Keeps MongoDB in sync when the user updates their Clerk profile.
 */
export const updateUser = async (
    clerkId: string,
    params: UpdateUserParams
) => {
    try {
        await connectToDatabase();

        const updatedUser = await User.findOneAndUpdate(
            { clerkId },
            { $set: params },
            { returnDocument: "after" }
        );

        if (!updatedUser) throw new Error(`User not found: ${clerkId}`);

        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        console.error("[updateUser]", error);
        throw new Error("Failed to update user in database.");
    }
};

/**
 * Called by the Clerk webhook when a user.deleted event fires.
 * Hard-deletes the user record from MongoDB.
 */
export const deleteUser = async (clerkId: string) => {
    try {
        await connectToDatabase();

        const deletedUser = await User.findOneAndDelete({ clerkId });

        if (!deletedUser) {
            console.warn(`[deleteUser] No user found with clerkId: ${clerkId}`);
            return null;
        }

        return JSON.parse(JSON.stringify(deletedUser));
    } catch (error) {
        console.error("[deleteUser]", error);
        throw new Error("Failed to delete user from database.");
    }
};

/**
 * Fetch a user document from MongoDB using their Clerk user ID.
 * Useful anywhere you need the DB record (e.g. profile pages, booking flows).
 */
export const getUserByClerkId = async (clerkId: string) => {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) return null;

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("[getUserByClerkId]", error);
        return null;
    }
};
