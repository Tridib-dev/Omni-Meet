"use client";

// components/dashboard/topbar.tsx
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";

const CRUMB_MAP: Record<string, string> = {
    dashboard: "Dashboard",
    attended: "My Tickets",
    saved: "Saved",
    organized: "My Events",
    profile: "Profile",
    settings: "Settings",
};

function useBreadcrumbs() {
    const pathname = usePathname() ?? "";
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, i) => ({
        label: CRUMB_MAP[seg] ?? seg,
        href: "/" + segments.slice(0, i + 1).join("/"),
        isLast: i === segments.length - 1,
    }));
}

export default function DashboardTopbar() {
    const crumbs = useBreadcrumbs();
    const [cmdOpen, setCmdOpen] = useState(false);
    const [query, setQuery] = useState("");

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            setCmdOpen((p) => !p);
        }
        if (e.key === "Escape") setCmdOpen(false);
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            <header
                className="sticky top-0 z-30 h-[52px] flex items-center justify-between px-5 flex-shrink-0"
                style={{
                    background: "rgba(8,12,16,0.9)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
            >
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1 text-[12.5px]">
                    {crumbs.map((crumb, i) => (
                        <span key={crumb.href} className="flex items-center gap-1">
                            {i > 0 && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/15">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            )}
                            {crumb.isLast ? (
                                <span className="text-white/80 font-medium">{crumb.label}</span>
                            ) : (
                                <Link href={crumb.href} className="text-white/30 hover:text-white/55 transition-colors">
                                    {crumb.label}
                                </Link>
                            )}
                        </span>
                    ))}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {/* Search pill */}
                    <button
                        onClick={() => setCmdOpen(true)}
                        className="flex items-center gap-2 h-7 px-3 rounded-md text-[12px] text-white/30 hover:text-white/55 transition-colors"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <span className="hidden sm:block">Search</span>
                        <kbd className="hidden sm:block text-[10px] font-mono text-white/20 ml-1">⌘K</kbd>
                    </button>

                    {/* Bell */}
                    <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors relative">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-cyan-400" />
                    </button>

                    {/* Clerk avatar */}
                    <div className="scale-[0.85] origin-center">
                        <UserButton />
                    </div>
                </div>
            </header>

            {/* Command palette */}
            {cmdOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]"
                    onClick={() => { setCmdOpen(false); setQuery(""); }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-[520px] rounded-xl overflow-hidden shadow-2xl"
                        style={{
                            background: "#0d1117",
                            border: "1px solid rgba(255,255,255,0.09)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Input */}
                        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/25 flex-shrink-0">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search events, pages, actions…"
                                className="flex-1 bg-transparent text-[13px] text-white placeholder-white/25 outline-none"
                            />
                            <kbd className="text-[10px] font-mono text-white/20 border border-white/[0.08] px-1.5 py-0.5 rounded">
                                ESC
                            </kbd>
                        </div>

                        {/* Quick nav links */}
                        <div className="py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20 px-4 py-1.5">
                                Navigation
                            </p>
                            {[
                                { label: "My Tickets", href: "/dashboard/attended", icon: "🎟️" },
                                { label: "Saved Events", href: "/dashboard/saved", icon: "🔖" },
                                { label: "My Events", href: "/dashboard/organized", icon: "📅" },
                                { label: "Profile", href: "/dashboard/profile", icon: "👤" },
                                { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
                            ]
                                .filter((item) =>
                                    query === "" || item.label.toLowerCase().includes(query.toLowerCase())
                                )
                                .map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => { setCmdOpen(false); setQuery(""); }}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.05] transition-colors"
                                    >
                                        <span className="text-[14px]">{item.icon}</span>
                                        <span className="text-[13px] text-white/70">{item.label}</span>
                                    </Link>
                                ))}
                        </div>

                        <div className="px-4 py-2.5 flex items-center gap-4 text-[11px] text-white/20 font-mono" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <span>↑↓ navigate</span>
                            <span>↵ open</span>
                            <span>ESC close</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}