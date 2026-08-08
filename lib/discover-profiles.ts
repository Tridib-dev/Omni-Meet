import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";
import type { PipelineStage } from "mongoose";

import { Follow } from "@/database/follow.model";
import { User } from "@/database/User.model";
import connectToDatabase from "@/lib/mongodb";

export const DISCOVER_PROFILES_CACHE_TAG = "discover-profiles";

export interface DiscoverProfileCard {
    clerkId: string;
    firstName: string;
    lastName: string;
    username: string;
    photo: string;
    bio: string;
    interests: string[];
    eventsHostedCount: number;
    followersCount: number;
    isFollowing: boolean;
    isOwner: boolean;
}

export interface DiscoverProfileFilters {
    q?: string;
    page?: number;
    limit?: number;
}

export interface DiscoverProfilesResult {
    profiles: DiscoverProfileCard[];
    total: number;
    page: number;
    totalPages: number;
}

type DiscoverProfileDocument = Omit<DiscoverProfileCard, "followersCount" | "isFollowing" | "isOwner">;

type DiscoverProfilesAggregateResult = {
    profiles?: DiscoverProfileDocument[];
    totalCount?: { total?: number }[];
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSearchValue = (value: string): string => value.trim().toLowerCase();

const tokenizeSearchValue = (value: string): string[] =>
    Array.from(
        new Set(
            normalizeSearchValue(value)
                .split(/[^a-z0-9]+/i)
                .map((token) => token.trim())
                .filter((token) => token.length >= 2 || /^\d+$/.test(token))
        )
    );

const buildTextExpression = (fields: string[]) => ({
    $toLower: {
        $concat: fields.flatMap((field) => [{ $ifNull: [`$${field}`, ""] }, " "]),
    },
});

const buildInterestExpression = () => ({
    $toLower: {
        $reduce: {
            input: { $ifNull: ["$interests", []] },
            initialValue: "",
            in: { $concat: ["$$value", " ", "$$this"] },
        },
    },
});

const buildMatchCountExpression = (inputExpr: string, tokens: string[]) => ({
    $sum: tokens.map((token) => ({
        $cond: [
            {
                $regexMatch: {
                    input: inputExpr,
                    regex: escapeRegex(token),
                    options: "i",
                },
            },
            1,
            0,
        ],
    })),
});

async function queryDiscoverProfiles(
    filters: DiscoverProfileFilters
): Promise<{ profiles: DiscoverProfileDocument[]; total: number }> {
    "use cache";
    cacheLife("minutes");
    cacheTag(DISCOVER_PROFILES_CACHE_TAG);

    await connectToDatabase();

    const page = Math.max(1, filters.page ?? 1);
    const limit = filters.limit ?? 24;
    const skip = (page - 1) * limit;
    const qTokens = tokenizeSearchValue(filters.q ?? "");
    const normalizedQuery = normalizeSearchValue(filters.q ?? "");

    const baseMatch: Record<string, unknown> = {
        onboarded: true,
        username: { $exists: true, $ne: "" },
    };

    const searchTextExpression = buildTextExpression([
        "firstName",
        "lastName",
        "username",
        "bio",
        "role",
    ]);
    const interestTextExpression = buildInterestExpression();
    const combinedSearchTextExpression = {
        $toLower: {
            $concat: [
                ...searchTextExpression.$toLower.$concat,
                " ",
                interestTextExpression,
            ],
        },
    };

    const scoreParts: Record<string, unknown>[] = [];

    if (qTokens.length > 0) {
        scoreParts.push({ $multiply: ["$qMatchCount", 10] });
        scoreParts.push({ $multiply: ["$interestMatchCount", 3] });
    }

    if (normalizedQuery) {
        scoreParts.push({
            $cond: [
                {
                    $regexMatch: {
                        input: "$username",
                        regex: `^${escapeRegex(normalizedQuery)}`,
                        options: "i",
                    },
                },
                24,
                0,
            ],
        });

        scoreParts.push({
            $cond: [
                {
                    $regexMatch: {
                        input: "$displayName",
                        regex: escapeRegex(normalizedQuery),
                        options: "i",
                    },
                },
                16,
                0,
            ],
        });
    }

    const pipeline: PipelineStage[] = [
        { $match: baseMatch },
        {
            $addFields: {
                searchText: combinedSearchTextExpression,
                interestText: interestTextExpression,
                displayName: {
                    $trim: {
                        input: {
                            $concat: [
                                { $ifNull: ["$firstName", ""] },
                                " ",
                                { $ifNull: ["$lastName", ""] },
                            ],
                        },
                    },
                },
            },
        },
    ];

    if (qTokens.length > 0) {
        pipeline.push({
            $addFields: {
                qMatchCount: buildMatchCountExpression("$searchText", qTokens),
                interestMatchCount: buildMatchCountExpression("$interestText", qTokens),
            },
        });
        pipeline.push({
            $match: {
                $expr: {
                    $gte: ["$qMatchCount", qTokens.length],
                },
            },
        });
    }

    pipeline.push({
        $addFields: {
            relevanceScore: scoreParts.length > 0 ? { $add: scoreParts } : 0,
        },
    });

    pipeline.push(
        { $sort: { relevanceScore: -1, eventsHostedCount: -1, createdAt: -1 } },
        {
            $facet: {
                profiles: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 0,
                            clerkId: 1,
                            firstName: 1,
                            lastName: 1,
                            username: 1,
                            photo: 1,
                            bio: 1,
                            interests: 1,
                            eventsHostedCount: 1,
                        },
                    },
                ],
                totalCount: [{ $count: "total" }],
            },
        }
    );

    const [result] = (await User.aggregate(pipeline).exec()) as DiscoverProfilesAggregateResult[];

    return {
        profiles: JSON.parse(JSON.stringify(result?.profiles ?? [])),
        total: result?.totalCount?.[0]?.total ?? 0,
    };
}

const normalizeProfiles = (
    profiles: DiscoverProfileDocument[],
    followingSet: Set<string>,
    followerCounts: Map<string, number>,
    viewerClerkId: string | null
): DiscoverProfileCard[] =>
    profiles.map((profile) => ({
        clerkId: profile.clerkId,
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        username: profile.username ?? "",
        photo: profile.photo ?? "",
        bio: profile.bio ?? "",
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        eventsHostedCount: profile.eventsHostedCount ?? 0,
        followersCount: followerCounts.get(profile.clerkId) ?? 0,
        isFollowing: followingSet.has(profile.clerkId),
        isOwner: viewerClerkId === profile.clerkId,
    }));

export const getDiscoverProfiles = async (
    filters: DiscoverProfileFilters
): Promise<DiscoverProfilesResult> => {
    const limit = filters.limit ?? 24;
    const page = Math.max(1, filters.page ?? 1);
    const { profiles, total } = await queryDiscoverProfiles({ ...filters, page, limit });
    const profileIds = profiles.map((profile) => profile.clerkId).filter(Boolean);

    const { userId: viewerClerkId } = await auth();
    await connectToDatabase();

    const [viewerFollows, followerCountRows] = await Promise.all([
        viewerClerkId && profileIds.length > 0
            ? Follow.find({ followerId: viewerClerkId, followingId: { $in: profileIds } })
                  .select("followingId")
                  .lean()
            : Promise.resolve([]),
        profileIds.length > 0
            ? Follow.aggregate<{ _id: string; total: number }>([
                  { $match: { followingId: { $in: profileIds } } },
                  { $group: { _id: "$followingId", total: { $sum: 1 } } },
              ]).exec()
            : Promise.resolve([]),
    ]);

    const followingSet = new Set((viewerFollows as { followingId: string }[]).map((edge) => edge.followingId));
    const followerCounts = new Map(followerCountRows.map((row) => [row._id, row.total]));

    return {
        profiles: normalizeProfiles(profiles, followingSet, followerCounts, viewerClerkId ?? null),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
};
