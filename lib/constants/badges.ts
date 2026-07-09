// lib/constants/badges.ts
// Badge catalog — hardcoded so it never needs a DB migration to add new badges.
// UserBadge only stores which ones a user has unlocked.

export type BadgeType = "milestone" | "manual" | "premium";

export interface BadgeDef {
    id: string;
    name: string;
    description: string;
    icon: string;       // emoji — renders anywhere without icon font dependency
    type: BadgeType;
    threshold?: number; // for milestone badges
    thresholdLabel?: string; // e.g. "events attended"
}

export const BADGE_CATALOG: BadgeDef[] = [
    {
        id: "verified",
        name: "Verified",
        description: "Identity confirmed by DevEvent",
        icon: "✓",
        type: "manual",
    },
    {
        id: "event_master",
        name: "Event Master",
        description: "Organized 3 or more events",
        icon: "🎪",
        type: "milestone",
        threshold: 3,
        thresholdLabel: "events organized",
    },
    {
        id: "regular",
        name: "Regular",
        description: "Attended 10 events",
        icon: "⭐",
        type: "milestone",
        threshold: 10,
        thresholdLabel: "events attended",
    },
    {
        id: "networked",
        name: "Network Effect",
        description: "Connected all 3 social accounts",
        icon: "🔗",
        type: "milestone",
        threshold: 3,
        thresholdLabel: "accounts connected",
    },
    {
        id: "early_adopter",
        name: "Early Adopter",
        description: "Joined DevEvent in the first wave",
        icon: "🚀",
        type: "manual",
    },
    {
        id: "community_builder",
        name: "Community Builder",
        description: "Organized an event with 50+ attendees",
        icon: "🏗️",
        type: "milestone",
        threshold: 50,
        thresholdLabel: "attendees in one event",
    },
];

export function getBadgeDef(id: string): BadgeDef | undefined {
    return BADGE_CATALOG.find((b) => b.id === id);
}
