export const EVENT_MODES = [
    { slug: "in-person", label: "In-Person" },
    { slug: "online", label: "Online" },
    { slug: "hybrid", label: "Hybrid (In-Person & Online)" },
] as const;

export type EventModeSlug = (typeof EVENT_MODES)[number]["slug"];

export type NormalizedEventMode = "offline" | "online" | "hybrid";

const ONLINE_VALUES = new Set(["online", "Online"]);
const HYBRID_VALUES = new Set([
    "hybrid",
    "Hybrid",
    "Hybrid (In-Person & Online)",
    "hybrid (in-person & online)",
]);

/** Normalize stored event mode strings to offline | online | hybrid. */
export function normalizeEventMode(raw: string | undefined | null): NormalizedEventMode {
    const value = (raw ?? "").trim();
    if (!value) return "offline";
    if (HYBRID_VALUES.has(value) || value.toLowerCase().includes("hybrid")) return "hybrid";
    if (ONLINE_VALUES.has(value) || value.toLowerCase() === "online") return "online";
    return "offline";
}

export const getModeLabelBySlug = (slug: string): string | null =>
    EVENT_MODES.find((m) => m.slug === slug)?.label ?? null;
 