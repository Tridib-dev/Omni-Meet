// lib/discover-events.ts

import { cacheLife, cacheTag } from "next/cache";

import type { PipelineStage } from "mongoose";

import { Event } from "@/database/event.model";
import { CoOrganizer } from "@/database/coOrganizer.model";
import { User } from "@/database/User.model";
import connectToDatabase from "@/lib/mongodb";
import { SEO_EVENTS_CACHE_TAG, slugifySegment } from "@/lib/seo-events";
import { ALL_TAGS } from "@/lib/constants/event-taxonomy";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";
import { getModeLabelBySlug } from "./constants/event-mode";



export interface DiscoverCard {
    _id: any;                    // ← Added
    title: string;
    slug: string;
    description: string;
    location: string;
    date: string;
    time: string;
    image: string;
    tags: string[];
    mode: string;
    category: string;
    price?: number;              // ← Added
    organizer?: string;          // ← Added
    creatorClerkId?: string;
    organizers?: { name: string; avatar?: string }[];
}

export interface DiscoverFilters {
    q?: string;
    location?: string;
    category?: string;
    tags?: string[];
    mode?: string;
    page?: number;
    limit?: number;
}

export interface DiscoverResult {
    events: DiscoverCard[];
    total: number;
    page: number;
    totalPages: number;
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type DiscoverCardDocument = {
    title?: string;
    slug?: string;
    description?: string;
    location?: string;
    date?: string;
    time?: string;
    image?: string;
    tags?: string[];
    mode?: string;
    category?: string;
    creatorClerkId?: string;
    organizer?: string;
    price?: number;
    organizers?: { name?: string; avatar?: string }[];
};

type DiscoverAggregateResult = {
    events?: DiscoverCardDocument[];
    totalCount?: { total?: number }[];
};

const normalizeDiscoverCards = (events: any[]): DiscoverCard[] =>
    events.map((event) => ({
        _id: event._id,
        title: event.title ?? "",
        slug: event.slug ?? "",
        description: event.description ?? "",
        location: event.location ?? "",
        date: event.date ?? "",
        time: event.time ?? "",
        image: event.image ?? "",
        tags: Array.isArray(event.tags) ? event.tags : [],
        mode: event.mode ?? "",
        category: event.category ?? "",
        price: event.price ?? 0,
        organizer: event.organizer ?? "",
        creatorClerkId: event.creatorClerkId ?? "",
        organizers: Array.isArray(event.organizers)
            ? event.organizers.map((organizer: { name?: string; avatar?: string }) => ({ name: organizer.name ?? "", avatar: organizer.avatar ?? "" }))
            : [],
    }));

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

const buildTagExpression = () => ({
    $toLower: {
        $reduce: {
            input: { $ifNull: ["$tags", []] },
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

const resolveCategoryLabel = (categorySlug: string): string | null => {
    const normalized = slugifySegment(categorySlug);
    return EVENT_CATEGORIES.find((category) => slugifySegment(category) === normalized) ?? null;
};

const resolveTagLabels = (tagSlugs: string[]): string[] =>
    tagSlugs
        .map((slug) => {
            const normalized = slugifySegment(slug);
            return ALL_TAGS.find((entry) => slugifySegment(entry.tag) === normalized)?.tag;
        })
        .filter((tag): tag is string => Boolean(tag));

async function queryDiscoverEvents(
    filters: DiscoverFilters
): Promise<{ events: DiscoverCardDocument[]; total: number }> {
    "use cache";
    cacheLife("minutes");
    cacheTag(SEO_EVENTS_CACHE_TAG);

    await connectToDatabase();

    const page = Math.max(1, filters.page ?? 1);
    const limit = filters.limit ?? 24;
    const skip = (page - 1) * limit;

    const qTokens = tokenizeSearchValue(filters.q ?? "");
    const locationTokens = tokenizeSearchValue(filters.location ?? "");
    const normalizedQuery = normalizeSearchValue(filters.q ?? "");
    const normalizedLocation = normalizeSearchValue(filters.location ?? "");

    const baseMatch: Record<string, unknown> = {
        date: { $gte: new Date().toISOString() }, // upcoming events only
    };

    if (filters.category) {
        const label = resolveCategoryLabel(filters.category);
        if (label) baseMatch.category = label;
    }

    if (filters.mode) {
        const label = getModeLabelBySlug(filters.mode);
        if (label) baseMatch.mode = label;
    }

    if (filters.tags && filters.tags.length > 0) {
        const labels = resolveTagLabels(filters.tags);
        if (labels.length > 0) baseMatch.tags = { $in: labels };
    }

    const searchTextExpression = buildTextExpression([
        "title",
        "location",
        "city",
        "state",
        "country",
        "venue",
        "description",
        "overview",
        "category",
        "mode",
    ]);
    const locationTextExpression = buildTextExpression(["location", "city", "state", "country"]);
    const tagTextExpression = buildTagExpression();
    const combinedSearchTextExpression = {
        $toLower: {
            $concat: [
                ...searchTextExpression.$toLower.$concat,
                " ",
                tagTextExpression,
            ],
        },
    };

    const scoreParts: Record<string, unknown>[] = [];

    if (qTokens.length > 0) {
        scoreParts.push({
            $multiply: ["$qMatchCount", 10],
        });
    }

    if (locationTokens.length > 0) {
        scoreParts.push({
            $multiply: ["$locationMatchCount", 8],
        });
    }

    if (normalizedQuery) {
        scoreParts.push({
            $cond: [
                {
                    $regexMatch: {
                        input: "$title",
                        regex: escapeRegex(normalizedQuery),
                        options: "i",
                    },
                },
                20,
                0,
            ],
        });

        scoreParts.push({
            $cond: [
                {
                    $regexMatch: {
                        input: "$searchText",
                        regex: escapeRegex(normalizedQuery),
                        options: "i",
                    },
                },
                10,
                0,
            ],
        });
    }

    if (normalizedLocation) {
        scoreParts.push({
            $cond: [
                {
                    $regexMatch: {
                        input: "$locationText",
                        regex: escapeRegex(normalizedLocation),
                        options: "i",
                    },
                },
                10,
                0,
            ],
        });
    }

    if (qTokens.length > 0) {
        scoreParts.push({
            $cond: [
                {
                    $regexMatch: {
                        input: "$title",
                        regex: `^${escapeRegex(qTokens[0])}`,
                        options: "i",
                    },
                },
                12,
                0,
            ],
        });
        scoreParts.push({
            $cond: [
                {
                    $regexMatch: {
                        input: "$searchText",
                        regex: `^${escapeRegex(qTokens[0])}`,
                        options: "i",
                    },
                },
                6,
                0,
            ],
        });
    }

    if (locationTokens.length > 0) {
        scoreParts.push({
            $cond: [
                {
                    $regexMatch: {
                        input: "$locationText",
                        regex: `^${escapeRegex(locationTokens[0])}`,
                        options: "i",
                    },
                },
                8,
                0,
            ],
        });
    }

    if (qTokens.length > 0) {
        scoreParts.push({
            $multiply: ["$tagMatchCount", 2],
        });
    }

    const pipeline: PipelineStage[] = [
        { $match: baseMatch },
        {
        $addFields: {
                searchText: combinedSearchTextExpression,
                locationText: locationTextExpression,
                tagText: tagTextExpression,
            },
        },
    ];

    if (qTokens.length > 0) {
        pipeline.push({
            $addFields: {
                qMatchCount: buildMatchCountExpression("$searchText", qTokens),
                tagMatchCount: buildMatchCountExpression("$tagText", qTokens),
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

    if (locationTokens.length > 0) {
        pipeline.push({
            $addFields: {
                locationMatchCount: buildMatchCountExpression("$locationText", locationTokens),
            },
        });
        pipeline.push({
            $match: {
                $expr: {
                    $gte: ["$locationMatchCount", locationTokens.length],
                },
            },
        });
    }

    pipeline.push({
        $addFields: {
            relevanceScore:
                scoreParts.length > 0
                    ? {
                          $add: scoreParts,
                      }
                    : 0,
        },
    });

    pipeline.push(
        {
            $lookup: {
                from: CoOrganizer.collection.name,
                localField: "_id",
                foreignField: "eventId",
                as: "coOrganizerRecords",
            },
        },
        {
            $lookup: {
                from: User.collection.name,
                let: { organizerIds: { $concatArrays: [["$creatorClerkId"], "$coOrganizerRecords.clerkId"] } },
                pipeline: [
                    { $match: { $expr: { $in: ["$clerkId", "$$organizerIds"] } } },
                    { $project: { _id: 0, clerkId: 1, firstName: 1, lastName: 1, photo: 1 } },
                ],
                as: "organizerProfiles",
            },
        },
        { $sort: { relevanceScore: -1, date: 1 } },
        {
            $facet: {
                events: [
                    { $skip: skip },
                    { $limit: limit },
                        {
                            $project: {
                                title: 1,
                                slug: 1,
                                description: 1,
                                location: 1,
                                date: 1,
                                time: 1,
                            image: 1,
                            tags: 1,
                            mode: 1,
                                category: 1,
                                organizer: 1,
                                price: 1,
                                creatorClerkId: 1,
                                organizers: {
                                    $map: {
                                        input: "$organizerProfiles",
                                        as: "profile",
                                        in: {
                                            name: { $trim: { input: { $concat: ["$$profile.firstName", " ", { $ifNull: ["$$profile.lastName", ""] }] } } },
                                            avatar: "$$profile.photo",
                                        },
                                    },
                                },
                        },
                    },
                ],
                totalCount: [{ $count: "total" }],
            },
        }
    );

    const [result] = (await Event.aggregate(pipeline).exec()) as DiscoverAggregateResult[];
    const events = result?.events ?? [];
    const total = result?.totalCount?.[0]?.total ?? 0;

    // Strip BSON types (ObjectId, etc.) before this crosses the "use cache" boundary
    return { events: JSON.parse(JSON.stringify(events)), total };
}

export const getDiscoverEvents = async (filters: DiscoverFilters): Promise<DiscoverResult> => {
    const limit = filters.limit ?? 24;
    const page = Math.max(1, filters.page ?? 1);

    const { events, total } = await queryDiscoverEvents({ ...filters, page, limit });

    return {
        events: normalizeDiscoverCards(events),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
};
