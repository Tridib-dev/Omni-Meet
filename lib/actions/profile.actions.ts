"use server";

import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/database/User.model";
import { SocialAccount, type SocialPlatform } from "@/database/social-account.model";
import { Follow } from "@/database/follow.model";
import { UserBadge } from "@/database/user-badge.model";
import { Booking } from "@/database/booking.model";
import { Order } from "@/database/Order.model";
import { Event } from "@/database/event.model";
import { Watchlist } from "@/database/watchlist.model";
import { BADGE_CATALOG } from "@/lib/constants/badges";
import { revalidatePath } from "next/cache";
import { notifyFollowCreated } from "@/lib/notifications";


// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicProfile {
    clerkId: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
    bio: string;
    followersCount: number;
    followingCount: number;
    eventsHostedCount: number;
    attendedCount: number;
    savedCount: number;
    isFollowing: boolean;       // whether the current viewer follows this profile
    isOwner: boolean;
    socialAccounts: {
        platform: SocialPlatform;
        handle: string;
        followersCount: number;
        profileUrl: string;
    }[];
    badges: {
        badgeId: string;
        unlocked: boolean;
        unlockedAt?: string;
        progress?: number;
    }[];
    organizedEvents: unknown[];
    attendedEvents: unknown[];
}

interface ProfileUserDoc {
    clerkId: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    photo?: string;
    bio?: string;
    eventsHostedCount?: number;
}

interface ProfileBadgeDoc {
    badgeId: string;
    unlockedAt?: Date;
}

interface ProfileEventDoc {
    eventId?: unknown;
}

interface ProfileSocialAccountDoc {
    platform: SocialPlatform;
    handle: string;
    followersCount: number;
    profileUrl: string;
}

export type ConnectionRelation = "followers" | "following";

export interface ProfileConnection {
    clerkId: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
    isFollowing: boolean;
}

const buildPublicProfile = async (
    profileUser: ProfileUserDoc,
    viewerClerkId: string | null
): Promise<PublicProfile> => {
    const targetClerkId = profileUser.clerkId;

    const [
        followersCount,
        followingCount,
        isFollowingDoc,
        socialAccounts,
        unlockedBadges,
        bookings,
        orders,
        savedCount,
        organizedEvents,
    ] = await Promise.all([
        Follow.countDocuments({ followingId: targetClerkId }),
        Follow.countDocuments({ followerId: targetClerkId }),
        viewerClerkId
            ? Follow.findOne({ followerId: viewerClerkId, followingId: targetClerkId })
            : Promise.resolve(null),
        SocialAccount.find({ clerkId: targetClerkId }).lean(),
        UserBadge.find({ clerkId: targetClerkId }).lean(),
        Booking.countDocuments({ clerkId: targetClerkId }),
        Order.countDocuments({ clerkId: targetClerkId, status: "paid" }),
        Watchlist.countDocuments({ clerkId: targetClerkId }),
        Event.find({ creatorClerkId: targetClerkId })
            .sort({ date: -1 })
            .limit(6)
            .lean(),
    ]);

    const [bookedEvents, paidEvents] = await Promise.all([
        Booking.find({ clerkId: targetClerkId }).populate("eventId").sort({ createdAt: -1 }).limit(6).lean(),
        Order.find({ clerkId: targetClerkId, status: "paid" }).populate("eventId").sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    const typedBookedEvents = bookedEvents as ProfileEventDoc[];
    const typedPaidEvents = paidEvents as ProfileEventDoc[];
    const typedUnlockedBadges = unlockedBadges as ProfileBadgeDoc[];
    const typedSocialAccounts = socialAccounts as ProfileSocialAccountDoc[];

    const attendedRaw = [
        ...typedBookedEvents.map((booking) => booking.eventId).filter(Boolean),
        ...typedPaidEvents.map((order) => order.eventId).filter(Boolean),
    ].slice(0, 6);

    const socialCount = socialAccounts.length;
    const attendedCount = bookings + orders;

    const badgeProgress: Record<string, number> = {
        event_master: profileUser.eventsHostedCount ?? 0,
        regular: attendedCount,
        networked: socialCount,
    };

    const unlockedIds = new Set(typedUnlockedBadges.map((b) => b.badgeId));

    const badges = BADGE_CATALOG.map((def) => ({
        badgeId: def.id,
        unlocked: unlockedIds.has(def.id),
        unlockedAt: typedUnlockedBadges.find((b) => b.badgeId === def.id)?.unlockedAt?.toISOString(),
        progress: def.threshold ? badgeProgress[def.id] : undefined,
    }));

    return {
        clerkId: targetClerkId,
        firstName: profileUser.firstName ?? "",
        lastName: profileUser.lastName ?? "",
        username: profileUser.username ?? "",
        photo: profileUser.photo ?? "",
        bio: profileUser.bio ?? "",
        followersCount,
        followingCount,
        eventsHostedCount: profileUser.eventsHostedCount ?? 0,
        attendedCount,
        savedCount,
        isFollowing: !!isFollowingDoc,
        isOwner: viewerClerkId === targetClerkId,
        socialAccounts: typedSocialAccounts.map((s) => ({
            platform: s.platform,
            handle: s.handle,
            followersCount: s.followersCount,
            profileUrl: s.profileUrl,
        })),
        badges,
        organizedEvents: JSON.parse(JSON.stringify(organizedEvents)),
        attendedEvents: JSON.parse(JSON.stringify(attendedRaw)),
    };
};

const getProfileByClerkId = cache(async (clerkId: string): Promise<PublicProfile | null> => {
    try {
        await connectToDatabase();

        const profileUser = (await User.findOne({ clerkId }).lean()) as ProfileUserDoc | null;
        if (!profileUser) return null;

        const { userId: viewerClerkId } = await auth();
        return await buildPublicProfile(profileUser, viewerClerkId ?? null);
    } catch (error) {
        console.error("[getProfileByClerkId]", error);
        return null;
    }
});

// ─── getPublicProfile ─────────────────────────────────────────────────────────

export const getPublicProfile = cache(async (username: string): Promise<PublicProfile | null> => {
    try {
        await connectToDatabase();

        const profileUser = (await User.findOne({ username }).lean()) as ProfileUserDoc | null;
        if (!profileUser) return null;

        const { userId: viewerClerkId } = await auth();
        return await buildPublicProfile(profileUser, viewerClerkId ?? null);
    } catch (error) {
        console.error("[getPublicProfile]", error);
        return null;
    }
});

export const getPublicProfileByClerkId = getProfileByClerkId;

// ─── getProfileConnections ───────────────────────────────────────────────────

export const getProfileConnections = async (targetClerkId: string, relation: ConnectionRelation) => {
    try {
        await connectToDatabase();

        const { userId: viewerClerkId } = await auth();
        const followFilter =
            relation === "followers"
                ? { followingId: targetClerkId }
                : { followerId: targetClerkId };
        const edgeField: "followerId" | "followingId" =
            relation === "followers" ? "followerId" : "followingId";

        const edges = (await Follow.find(followFilter)
            .sort({ createdAt: -1 })
            .select(edgeField)
            .lean()) as Record<typeof edgeField, string>[];

        const connectionIds = edges
            .map((edge) => edge[edgeField])
            .filter((clerkId): clerkId is string => !!clerkId && clerkId !== targetClerkId);

        if (connectionIds.length === 0) {
            return [] as ProfileConnection[];
        }

        const [users, viewerFollows] = await Promise.all([
            User.find({ clerkId: { $in: connectionIds } })
                .select("clerkId firstName lastName username photo")
                .lean(),
            viewerClerkId
                ? Follow.find({ followerId: viewerClerkId, followingId: { $in: connectionIds } })
                    .select("followingId")
                    .lean()
                : Promise.resolve([]),
        ]);

        const userMap = new Map(
            (users as ProfileConnection[]).map((user) => [user.clerkId, user])
        );
        const followingSet = new Set(
            (viewerFollows as { followingId: string }[]).map((edge) => edge.followingId)
        );

        return connectionIds
            .map((clerkId) => userMap.get(clerkId))
            .filter((user): user is ProfileConnection => !!user)
            .map((user) => ({
                clerkId: user.clerkId,
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                username: user.username ?? "",
                photo: user.photo ?? "",
                isFollowing: followingSet.has(user.clerkId),
            }));
    } catch (error) {
        console.error("[getProfileConnections]", error);
        return [] as ProfileConnection[];
    }
};

// ─── updateBio ────────────────────────────────────────────────────────────────

export const updateBio = async (bio: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false };
        await connectToDatabase();
        await User.findOneAndUpdate({ clerkId: userId }, { $set: { bio } });
        return { success: true };
    } catch {
        return { success: false };
    }
};

// ─── toggleFollow ─────────────────────────────────────────────────────────────

export const toggleFollow = async (targetClerkId: string) => {
    try {
        const { userId } = await auth();
        if (!userId || userId === targetClerkId) return { success: false };
        await connectToDatabase();

        const [actor, target] = await Promise.all([
            User.findOne({ clerkId: userId }).select("username firstName lastName photo").lean(),
            User.findOne({ clerkId: targetClerkId }).select("username").lean(),
        ]);

        const existing = await Follow.findOne({ followerId: userId, followingId: targetClerkId });
        if (existing) {
            await Follow.deleteOne({ _id: existing._id });
            if (target?.username) {
                revalidatePath(`/profile/${target.username}`);
            }
            if (actor?.username) {
                revalidatePath(`/profile/${actor.username}`);
            }
            return { success: true, following: false };
        }
        await Follow.create({ followerId: userId, followingId: targetClerkId });
        await notifyFollowCreated({
            followerClerkId: userId,
            followingClerkId: targetClerkId,
        });
        if (target?.username) {
            revalidatePath(`/profile/${target.username}`);
        }
        if (actor?.username) {
            revalidatePath(`/profile/${actor.username}`);
        }
        return { success: true, following: true };
    } catch {
        return { success: false, following: false };
    }
};

// ─── Social account actions ───────────────────────────────────────────────────

export const addSocialAccount = async (data: {
    platform: SocialPlatform;
    handle: string;
    followersCount: number;
    profileUrl: string;
}) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false };
        await connectToDatabase();

        await SocialAccount.findOneAndUpdate(
            { clerkId: userId, platform: data.platform },
            { $set: { ...data, clerkId: userId } },
            { upsert: true }
        );

        // Check if networked badge should unlock
        const count = await SocialAccount.countDocuments({ clerkId: userId });
        if (count >= 3) {
            await UserBadge.findOneAndUpdate(
                { clerkId: userId, badgeId: "networked" },
                { $setOnInsert: { clerkId: userId, badgeId: "networked", unlockedAt: new Date() } },
                { upsert: true }
            );
        }

        return { success: true };
    } catch {
        return { success: false };
    }
};

export const removeSocialAccount = async (platform: SocialPlatform) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false };
        await connectToDatabase();
        await SocialAccount.deleteOne({ clerkId: userId, platform });
        return { success: true };
    } catch {
        return { success: false };
    }
};

export const getMySocialAccounts = cache(async () => {
    try {
        const { userId } = await auth();
        if (!userId) return [];
        await connectToDatabase();
        const accounts = await SocialAccount.find({ clerkId: userId }).lean();
        return JSON.parse(JSON.stringify(accounts));
    } catch {
        return [];
    }
});

// ─── evaluateBadges ───────────────────────────────────────────────────────────
// Call after any action that could unlock a badge

export const evaluateBadges = async (clerkId: string) => {
    try {
        await connectToDatabase();

        const [, socialCount, attendedCount, organizedCount] = await Promise.all([
            User.findOne({ clerkId }).lean(),
            SocialAccount.countDocuments({ clerkId }),
            Booking.countDocuments({ clerkId }),
            Event.countDocuments({ creatorClerkId: clerkId }),
        ]);

        const checks: { badgeId: string; unlocked: boolean }[] = [
            { badgeId: "networked", unlocked: socialCount >= 3 },
            { badgeId: "event_master", unlocked: organizedCount >= 3 },
            { badgeId: "regular", unlocked: attendedCount >= 10 },
        ];

        for (const check of checks) {
            if (check.unlocked) {
                await UserBadge.findOneAndUpdate(
                    { clerkId, badgeId: check.badgeId },
                    { $setOnInsert: { clerkId, badgeId: check.badgeId, unlockedAt: new Date() } },
                    { upsert: true }
                );
            }
        }
    } catch (e) {
        console.error("[evaluateBadges]", e);
    }
};

// ─── getFollowers (for share sheet) ──────────────────────────────────────────

export const getMyFollowers = cache(async () => {
    try {
        const { userId } = await auth();
        if (!userId) return [];
        await connectToDatabase();

        const follows = (await Follow.find({ followingId: userId }).lean()) as { followerId: string }[];
        const followerIds = follows.map((f) => f.followerId);
        const users = await User.find({ clerkId: { $in: followerIds } })
            .select("clerkId firstName lastName photo username")
            .lean();
        return JSON.parse(JSON.stringify(users));
    } catch {
        return [];
    }
});
