"use client";

// components/profile/ShareSheet.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyFollowers } from "@/lib/actions/profile.actions";
import { toast } from "sonner";

const EXTERNAL_PLATFORMS = [
    {
        label: "X",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        getUrl: (url: string, name: string) =>
            `https://twitter.com/intent/tweet?text=Check+out+${encodeURIComponent(name)}+on+DevEvent&url=${encodeURIComponent(url)}`,
    },
    {
        label: "LinkedIn",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
        getUrl: (url: string) =>
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
        label: "WhatsApp",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
        ),
        getUrl: (url: string, name: string) =>
            `https://wa.me/?text=${encodeURIComponent(`Check out ${name} on DevEvent: ${url}`)}`,
    },
];

interface Props {
    open: boolean;
    onClose: () => void;
    profileUsername: string;
    profileName: string;
}

interface Follower {
    clerkId: string;
    firstName: string;
    lastName: string;
    photo: string;
    username: string;
}

export default function ShareSheet({ open, onClose, profileUsername, profileName }: Props) {
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const profileUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/profile/${profileUsername}`
            : `/profile/${profileUsername}`;

    useEffect(() => {
        if (!open) return;

        let active = true;

        const loadFollowers = async () => {
            setLoading(true);
            try {
                const data = await getMyFollowers();
                if (active) {
                    setFollowers(data);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadFollowers();

        return () => {
            active = false;
        };
    }, [open]);

    const toggleSelect = (clerkId: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(clerkId)) {
                next.delete(clerkId);
            } else {
                next.add(clerkId);
            }
            return next;
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        toast.success("Link copied!");
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden"
                        style={{
                            background: "#0d1117",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <p className="text-[14px] font-semibold text-white/90">Share profile</p>
                            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Send to followers */}
                        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
                                Send to
                            </p>
                            {loading ? (
                                <p className="text-[12px] text-white/25">Loading followers…</p>
                            ) : followers.length === 0 ? (
                                <p className="text-[12px] text-white/25">No followers yet.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                                    {followers.map((f) => {
                                        const isSelected = selected.has(f.clerkId);
                                        const initials = [f.firstName, f.lastName]
                                            .map((n: string) => n?.[0])
                                            .filter(Boolean)
                                            .join("")
                                            .toUpperCase();
                                        return (
                                            <button
                                                key={f.clerkId}
                                                onClick={() => toggleSelect(f.clerkId)}
                                                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors"
                                                style={{
                                                    background: isSelected ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.03)",
                                                    border: `1px solid ${isSelected ? "rgba(6,182,212,0.25)" : "rgba(255,255,255,0.07)"}`,
                                                }}
                                            >
                                                <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white">
                                                    {f.photo ? (
                                                        <img src={f.photo} alt={initials} className="w-full h-full object-cover" />
                                                    ) : initials}
                                                </div>
                                                <span className="text-[12px] text-white/70 truncate">
                                                    {[f.firstName, f.lastName].filter(Boolean).join(" ")}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {selected.size > 0 && (
                                <button
                                    className="mt-3 w-full py-2 rounded-lg text-[12px] font-medium transition-all"
                                    style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}
                                    onClick={() => {
                                        toast.success(`Shared with ${selected.size} follower${selected.size > 1 ? "s" : ""}`);
                                        setSelected(new Set());
                                        onClose();
                                    }}
                                >
                                    Send to {selected.size} {selected.size === 1 ? "person" : "people"}
                                </button>
                            )}
                        </div>

                        {/* External platforms */}
                        <div className="px-5 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
                                Share via
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {EXTERNAL_PLATFORMS.map((platform) => (
                                    <a
                                        key={platform.label}
                                        href={platform.getUrl(profileUrl, profileName)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl transition-colors"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            color: "rgba(255,255,255,0.6)",
                                            minWidth: 64,
                                        }}
                                    >
                                        {platform.icon}
                                        <span className="text-[10px]">{platform.label}</span>
                                    </a>
                                ))}
                                <button
                                    onClick={handleCopyLink}
                                    className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl transition-colors"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        color: "rgba(255,255,255,0.6)",
                                        minWidth: 64,
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect width="13" height="13" x="9" y="9" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                    </svg>
                                    <span className="text-[10px]">Copy link</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
