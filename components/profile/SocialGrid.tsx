"use client";

// components/profile/SocialGrid.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { addSocialAccount, removeSocialAccount } from "@/lib/actions/profile.actions";
import type { SocialPlatform } from "@/database/social-account.model";
import { BottomModal } from "@/components/uitripled/bottom-modal";

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: {
    id: SocialPlatform;
    label: string;
    color: string;
    urlPrefix: string;
    icon: React.ReactNode;
}[] = [
    {
        id: "instagram",
        label: "Instagram",
        color: "#e1306c",
        urlPrefix: "https://instagram.com/",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
        ),
    },
    {
        id: "x",
        label: "X (Twitter)",
        color: "#ffffff",
        urlPrefix: "https://x.com/",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
        ),
    },
    {
        id: "linkedin",
        label: "LinkedIn",
        color: "#0a66c2",
        urlPrefix: "https://linkedin.com/in/",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        ),
    },
];

type PlatformConfig = (typeof PLATFORMS)[number];

function formatFollowers(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

// ─── Add account form ─────────────────────────────────────────────────────────

function ConnectForm({
    platform,
    onClose,
    onAdded,
}: {
    platform: PlatformConfig;
    onClose: () => void;
    onAdded: () => void;
}) {
    const [handle, setHandle] = useState("");
    const [followers, setFollowers] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (!handle.trim()) return;
        setSaving(true);
        const result = await addSocialAccount({
            platform: platform.id,
            handle: handle.replace(/^@/, "").trim(),
            followersCount: parseInt(followers.replace(/,/g, "")) || 0,
            profileUrl: platform.urlPrefix + handle.replace(/^@/, "").trim(),
        });
        if (result.success) {
            toast.success(`${platform.label} connected!`);
            onAdded();
            onClose();
        } else {
            toast.error("Failed to connect. Try again.");
        }
        setSaving(false);
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span style={{ color: platform.color }} className="shrink-0">
                    {platform.icon}
                </span>
                <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white/85">Add your {platform.label} profile</p>
                    <p className="text-[11px] text-white/35">We’ll show it on your profile card.</p>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/35">
                        Handle
                    </label>
                    <input
                        autoFocus
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="@yourhandle"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white/85 outline-none transition-colors placeholder:text-white/20 focus:border-white/25"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/35">
                        Followers
                    </label>
                    <input
                        value={followers}
                        onChange={(e) => setFollowers(e.target.value)}
                        placeholder="e.g. 12000"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white/85 outline-none transition-colors placeholder:text-white/20 focus:border-white/25"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-1">
                <button
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white/85"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving || !handle.trim()}
                    className="flex-1 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all disabled:opacity-50"
                    style={{
                        background: `${platform.color}22`,
                        border: `1px solid ${platform.color}44`,
                        color: platform.color,
                    }}
                >
                    {saving ? "Connecting…" : "Connect"}
                </button>
            </div>
        </div>
    );
}

// ─── Single card ──────────────────────────────────────────────────────────────

function SocialCard({
    platform,
    account,
    isOwner,
    onRemoved,
    onOpenConnect,
}: {
    platform: PlatformConfig;
    account?: { handle: string; followersCount: number; profileUrl: string };
    isOwner: boolean;
    onRemoved: () => void;
    onOpenConnect: (platform: SocialPlatform) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleRemove = async () => {
        setRemoving(true);
        const result = await removeSocialAccount(platform.id);
        if (result.success) {
            toast.success(`${platform.label} disconnected.`);
            onRemoved();
        } else {
            toast.error("Failed to remove.");
        }
        setRemoving(false);
        setMenuOpen(false);
    };

    // ── Connected card ──
    if (account) {
        return (
            <div
                className="relative rounded-2xl p-4 flex flex-col gap-3 group"
                style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: `0 0 40px -10px ${platform.color}22`,
                }}
            >
                {/* Icon + platform */}
                <div className="flex items-center justify-between">
                    <span style={{ color: platform.color }}>{platform.icon}</span>
                    {isOwner && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen((p) => !p)}
                                className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                                </svg>
                            </button>

                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                        className="absolute right-0 top-8 z-20 w-44 rounded-xl overflow-hidden py-1"
                                        style={{
                                            background: "#12161b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                                        }}
                                    >
                                        <a
                                            href={account.profileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
                                            </svg>
                                            View profile
                                        </a>
                                        <button
                                            onClick={handleRemove}
                                            disabled={removing}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
                                            </svg>
                                            {removing ? "Removing…" : "Remove integration"}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Handle + followers */}
                <div>
                    <p className="text-[14px] font-semibold text-white/90">@{account.handle}</p>
                    <p className="text-[12px] text-white/35 mt-0.5">
                        {formatFollowers(account.followersCount)} followers
                    </p>
                </div>

                {/* View profile link (visitor view) */}
                {!isOwner && (
                    <a
                        href={account.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium transition-colors"
                        style={{ color: platform.color, opacity: 0.8 }}
                    >
                        View profile →
                    </a>
                )}
            </div>
        );
    }

    // ── Not connected — visitor ──
    if (!isOwner) {
        return (
            <div
                className="relative rounded-2xl p-4 flex flex-col gap-3"
                style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    opacity: 0.45,
                }}
            >
                <span style={{ color: "rgba(255,255,255,0.2)" }}>{platform.icon}</span>
                <div>
                    <p className="text-[13px] font-medium text-white/30">{platform.label}</p>
                    <p className="text-[11px] text-white/20 mt-0.5">Not connected</p>
                </div>
            </div>
        );
    }

    // ── Not connected — owner: dashed connect card ──
    return (
        <div className="relative">
            <button
                onClick={() => onOpenConnect(platform.id)}
                className="w-full rounded-2xl p-4 flex flex-col gap-3 text-left transition-all group"
                style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1.5px dashed rgba(255,255,255,0.1)",
                }}
            >
                <span style={{ color: `${platform.color}60` }}>{platform.icon}</span>
                <div>
                    <p className="text-[13px] font-medium text-white/40 group-hover:text-white/60 transition-colors">
                        + Connect {platform.label}
                    </p>
                    <p className="text-[11px] text-white/20 mt-0.5">Show your audience</p>
                </div>
            </button>
        </div>
    );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export default function SocialGrid({
    accounts: initialAccounts,
    isOwner,
}: {
    accounts: { platform: SocialPlatform; handle: string; followersCount: number; profileUrl: string }[];
    isOwner: boolean;
}) {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [activePlatform, setActivePlatform] = useState<SocialPlatform | null>(null);

    const getAccount = (platform: SocialPlatform) =>
        accounts.find((a) => a.platform === platform);

    const activePlatformConfig = activePlatform
        ? PLATFORMS.find((platform) => platform.id === activePlatform) ?? null
        : null;

    const handleAdded = async () => {
        // Refetch from server — simplest approach
        const { getMySocialAccounts } = await import("@/lib/actions/profile.actions");
        const fresh = await getMySocialAccounts();
        setAccounts(fresh);
        setActivePlatform(null);
    };

    const handleRemoved = (platform: SocialPlatform) => {
        setAccounts((prev) => prev.filter((a) => a.platform !== platform));
    };

    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/25 mb-4">
                Social profiles
            </p>
            <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map((platform) => (
                    <SocialCard
                        key={platform.id}
                        platform={platform}
                        account={getAccount(platform.id)}
                        isOwner={isOwner}
                        onRemoved={() => handleRemoved(platform.id)}
                        onOpenConnect={setActivePlatform}
                    />
                ))}
            </div>

            <BottomModal
                open={!!activePlatformConfig}
                onOpenChange={(open) => {
                    if (!open) setActivePlatform(null);
                }}
                title={activePlatformConfig ? `Connect ${activePlatformConfig.label}` : "Connect social profile"}
                description="Add your handle and follower count. We’ll save it to your profile immediately."
            >
                {activePlatformConfig ? (
                    <ConnectForm
                        platform={activePlatformConfig}
                        onClose={() => setActivePlatform(null)}
                        onAdded={handleAdded}
                    />
                ) : null}
            </BottomModal>
        </div>
    );
}
