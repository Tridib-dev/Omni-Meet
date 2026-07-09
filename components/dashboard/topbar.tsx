"use client";

// components/dashboard/topbar.tsx
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsBell from "./notifications-bell";

// ─── Dark theme tokens ────────────────────────────────────────────────────────
// Hardcoded for now (matches the sidebar's dark palette). When you build the
// light/dark toggle, swap these for values from theme-context's useAppTheme()
// — every className below already reads from this single object, so that
// swap is a one-line change, not a rewrite.
const COLOR = {
    bgTranslucent: "rgba(25,25,25,0.72)",
    surface: "#262626",
    border: "rgba(255,255,255,0.09)",
    textPrimary: "rgba(255,255,255,0.92)",
    textSecondary: "rgba(255,255,255,0.58)",
    textTertiary: "rgba(255,255,255,0.38)",
    hoverBg: "rgba(255,255,255,0.06)",
};

const CRUMB_MAP: Record<string, string> = {
    dashboard: "Dashboard",
    attended: "My Tickets",
    saved: "Saved",
    organized: "My Events",
    analytics: "Analytics",
    profile: "Profile",
    settings: "Settings",
};

// Monochrome line-icon set for the command palette — consistent with the
// sidebar's icons instead of platform emoji.
const NavIcon = {
    ticket: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
            <path d="M13 5v2M13 17v2M13 11v2"/>
        </svg>
    ),
    bookmark: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
    ),
    calendar: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
    ),
    analytics: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15l3-3 3 2 4-6"/>
            <circle cx="7" cy="15" r="1"/><circle cx="10" cy="12" r="1"/><circle cx="13" cy="14" r="1"/><circle cx="17" cy="8" r="1"/>
        </svg>
    ),
    user: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
    ),
    settings: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ),
};

const QUICK_NAV = [
    { label: "My Tickets", href: "/dashboard/attended", icon: NavIcon.ticket },
    { label: "Saved Events", href: "/dashboard/saved", icon: NavIcon.bookmark },
    { label: "My Events", href: "/dashboard/organized", icon: NavIcon.calendar },
    { label: "Analytics", href: "/dashboard/analytics", icon: NavIcon.analytics },
    { label: "Profile", href: "/dashboard/profile", icon: NavIcon.user },
    { label: "Settings", href: "/dashboard/settings", icon: NavIcon.settings },
];

function useBreadcrumbs() {
    const pathname = usePathname() ?? "";
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, i) => {
        const isEventAnalyticsRoute =
            segments[0] === "dashboard" &&
            segments[1] === "organized" &&
            segments.length === 3 &&
            i === 2;

        return {
            label: isEventAnalyticsRoute ? "Event Analytics" : (CRUMB_MAP[seg] ?? seg),
            href: "/" + segments.slice(0, i + 1).join("/"),
            isLast: i === segments.length - 1,
        };
    });
}

type Props = {
    /** Wire this to open your mobile sidebar drawer. Hamburger only renders if provided. */
    onMenuClick?: () => void;
};

export default function DashboardTopbar({ onMenuClick }: Props = {}) {
    const crumbs = useBreadcrumbs();
    const [cmdOpen, setCmdOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);

    const pageTitle = crumbs[crumbs.length - 1]?.label ?? "Dashboard";

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

    // Prevent body scroll while the command palette / mobile search sheet is open.
    useEffect(() => {
        if (cmdOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = prev; };
        }
    }, [cmdOpen]);

    // Subtle shadow once the page scrolls, so the bar reads as a distinct
    // surface floating over content rather than a flat strip.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <motion.header
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="sticky top-0 z-30 grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_minmax(0,420px)_1fr] xl:grid-cols-[1fr_minmax(0,640px)_1fr] items-center gap-2 sm:gap-3 lg:gap-4 h-13 lg:h-13 px-3 sm:px-4 lg:px-6 flex-shrink-0 transition-shadow duration-200"
                style={{
                    background: COLOR.bgTranslucent,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderBottom: `1px solid ${COLOR.border}`,
                    boxShadow: scrolled ? "0 4px 16px -8px rgba(0,0,0,0.45)" : "none",
                }}
            >
                {/* Left: full breadcrumbs on lg+ (guaranteed room), hamburger + page title through tablet */}
                <div className="flex items-center gap-2 min-w-0 justify-self-start">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            aria-label="Open menu"
                            className="md:hidden flex items-center justify-center w-9 h-9 -ml-1 rounded-md flex-shrink-0 hover:bg-white/[0.06] active:scale-90 transition-all duration-150"
                            style={{ color: COLOR.textSecondary }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>
                    )}

                    <span
                        className="lg:hidden text-[14.5px] font-medium truncate"
                        style={{ color: COLOR.textPrimary }}
                    >
                        {pageTitle}
                    </span>

                    <nav className="hidden lg:flex items-center gap-1.5 text-[13px] min-w-0">
                        {crumbs.map((crumb, i) => (
                            <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                                {i > 0 && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: COLOR.textTertiary }} className="flex-shrink-0">
                                        <path d="M9 18l6-6-6-6"/>
                                    </svg>
                                )}
                                {crumb.isLast ? (
                                    <span className="font-medium truncate max-w-[220px]" style={{ color: COLOR.textPrimary }}>
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="truncate max-w-[160px] transition-colors duration-150 hover:text-white/70"
                                        style={{ color: COLOR.textTertiary }}
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </span>
                        ))}
                    </nav>
                </div>

                {/* Center: search — compact icon through tablet, full pill from lg+ (real laptop/monitor width) */}
                <button
                    onClick={() => setCmdOpen(true)}
                    aria-label="Search"
                    className="hidden lg:flex items-center gap-2.5 h-10 w-full px-4 rounded-lg text-[13.5px] transition-all duration-150 justify-self-center hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15"
                    style={{
                        background: COLOR.surface,
                        border: `1px solid ${COLOR.border}`,
                        color: COLOR.textTertiary,
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <span className="flex-1 text-left truncate">Search events, pages, actions…</span>
                    <kbd
                        className="hidden xl:flex items-center gap-0.5 text-[10.5px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ border: `1px solid ${COLOR.border}`, color: COLOR.textTertiary }}
                    >
                        ⌘K
                    </kbd>
                </button>

                {/* Right: icon-only search (mobile + tablet) + notifications + avatar */}
                <div className="flex items-center justify-end gap-1 sm:gap-1.5 justify-self-end">
                    <button
                        onClick={() => setCmdOpen(true)}
                        aria-label="Search"
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md active:scale-90 transition-all duration-150"
                        style={{ color: COLOR.textSecondary }}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                    </button>

                    <div className="active:scale-90 transition-transform duration-150">
                        <NotificationsBell />
                    </div>

                    <div className="hidden sm:block w-px h-5 mx-1 flex-shrink-0" style={{ background: COLOR.border }} />

                    <div className="scale-90 origin-center rounded-full ring-0 hover:ring-2 hover:ring-white/10 transition-all duration-150">
                        <UserButton />
                    </div>
                </div>
            </motion.header>

            {/* Command palette / mobile search sheet */}
            <AnimatePresence>
                {cmdOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4"
                        onClick={() => { setCmdOpen(false); setQuery(""); }}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 8 }}
                            transition={{ duration: 0.16, ease: "easeOut" }}
                            className="relative w-full max-w-[560px] max-h-[76vh] sm:max-h-[70vh] rounded-xl overflow-hidden shadow-2xl flex flex-col"
                            style={{ background: COLOR.surface, border: `1px solid ${COLOR.border}` }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Input */}
                            <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${COLOR.border}` }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0" style={{ color: COLOR.textTertiary }}>
                                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                </svg>
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search events, pages, actions…"
                                    className="flex-1 bg-transparent text-[15px] sm:text-[14px] outline-none"
                                    style={{ color: COLOR.textPrimary }}
                                />
                                <button
                                    onClick={() => { setCmdOpen(false); setQuery(""); }}
                                    className="text-[10.5px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 hover:bg-white/[0.06] transition-colors"
                                    style={{ border: `1px solid ${COLOR.border}`, color: COLOR.textTertiary }}
                                >
                                    ESC
                                </button>
                            </div>

                            {/* Quick nav links */}
                            <div className="py-2 overflow-y-auto flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] px-4 py-1.5" style={{ color: COLOR.textTertiary }}>
                                    Navigation
                                </p>
                                {QUICK_NAV.filter((item) =>
                                    query === "" || item.label.toLowerCase().includes(query.toLowerCase())
                                ).map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => { setCmdOpen(false); setQuery(""); }}
                                        className="flex items-center gap-3 px-4 py-3 sm:py-2.5 transition-colors duration-150 hover:bg-white/[0.05] active:bg-white/[0.08]"
                                        style={{ color: COLOR.textSecondary }}
                                    >
                                        <span className="flex-shrink-0">{item.icon}</span>
                                        <span className="text-[14px] sm:text-[13.5px]">{item.label}</span>
                                    </Link>
                                ))}
                            </div>

                            <div
                                className="flex px-4 py-2.5 items-center gap-4 text-[10.5px] sm:text-[11px] font-mono flex-shrink-0"
                                style={{ borderTop: `1px solid ${COLOR.border}`, color: COLOR.textTertiary }}
                            >
                                <span>↑↓ navigate</span>
                                <span>↵ open</span>
                                <span>ESC close</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}