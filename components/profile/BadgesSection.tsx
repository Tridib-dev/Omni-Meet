"use client";

// components/profile/BadgesSection.tsx
import { BADGE_CATALOG } from "@/lib/constants/badges";

interface BadgeState {
    badgeId: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
}

function BadgeCard({ def, state }: {
    def: (typeof BADGE_CATALOG)[number];
    state: BadgeState;
}) {
    const { unlocked, progress } = state;
    const hasProgress = def.threshold !== undefined && progress !== undefined;
    const pct = hasProgress
        ? Math.min(100, Math.round((progress! / def.threshold!) * 100))
        : 0;

    return (
        <div
            className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl transition-all"
            style={{
                background: unlocked
                    ? "rgba(6,182,212,0.07)"
                    : "rgba(255,255,255,0.02)",
                border: `1px solid ${unlocked
                    ? "rgba(6,182,212,0.2)"
                    : "rgba(255,255,255,0.06)"}`,
                opacity: unlocked ? 1 : 0.6,
            }}
        >
            {/* Icon */}
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                    background: unlocked
                        ? "rgba(6,182,212,0.12)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${unlocked
                        ? "rgba(6,182,212,0.25)"
                        : "rgba(255,255,255,0.07)"}`,
                    filter: unlocked ? "none" : "grayscale(1)",
                }}
            >
                {unlocked ? (
                    <span>{def.icon}</span>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                )}
            </div>

            {/* Name */}
            <div>
                <p className="text-[12px] font-semibold text-white/80 leading-tight">{def.name}</p>
                <p className="text-[10px] text-white/35 mt-0.5 leading-snug">{def.description}</p>
            </div>

            {/* Progress bar for milestone badges */}
            {!unlocked && hasProgress && (
                <div className="w-full">
                    <div
                        className="h-1 rounded-full overflow-hidden w-full"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${pct}%`,
                                background: "linear-gradient(to right, #06b6d4, #8b5cf6)",
                            }}
                        />
                    </div>
                    <p className="text-[9px] text-white/25 mt-1">
                        {progress} / {def.threshold} {def.thresholdLabel}
                    </p>
                </div>
            )}

            {/* Unlocked date */}
            {unlocked && state.unlockedAt && (
                <p className="text-[9px] text-cyan-500/50">
                    Earned {new Date(state.unlockedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </p>
            )}
        </div>
    );
}

export default function BadgesSection({
    badges,
}: {
    badges: BadgeState[];
}) {
    const stateMap = Object.fromEntries(badges.map((b) => [b.badgeId, b]));
    const unlockedCount = badges.filter((b) => b.unlocked).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Achievements
                </p>
                <span className="text-[11px] text-white/30 font-mono">
                    {unlockedCount}/{BADGE_CATALOG.length} earned
                </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {BADGE_CATALOG.map((def) => (
                    <BadgeCard
                        key={def.id}
                        def={def}
                        state={stateMap[def.id] ?? { badgeId: def.id, unlocked: false, progress: 0 }}
                    />
                ))}
            </div>
        </div>
    );
}