"use client";

// components/dashboard/sidebar.tsx
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
// Notion-style neutral palette. Everything below is grayscale on purpose —
// no accent color — so the sidebar reads as calm, high-contrast UI chrome.
//
// To wire this up to `next-themes` later: replace the `mode` useState below
// with `const { resolvedTheme } = useTheme()` and use `resolvedTheme` in its
// place. Nothing else needs to change since every color reference here
// flows through the single `theme` object.
type Mode = "light" | "dark";

const THEME: Record<Mode, Record<string, string>> = {
    dark: {
        bg: "#1f1f1f",
        border: "rgba(255,255,255,0.09)",
        textPrimary: "rgba(255,255,255,0.92)",
        textSecondary: "rgba(255,255,255,0.58)",
        textTertiary: "rgba(255,255,255,0.38)",
        hoverBg: "rgba(255,255,255,0.06)",
        activeBg: "rgba(255,255,255,0.10)",
        avatarBg: "#3a3a3a",
        avatarText: "rgba(255,255,255,0.85)",
    },
    light: {
        bg: "#fbfbfa",
        border: "rgba(0,0,0,0.09)",
        textPrimary: "rgba(0,0,0,0.88)",
        textSecondary: "rgba(0,0,0,0.55)",
        textTertiary: "rgba(0,0,0,0.36)",
        hoverBg: "rgba(0,0,0,0.055)",
        activeBg: "rgba(0,0,0,0.07)",
        avatarBg: "#e0e0de",
        avatarText: "rgba(0,0,0,0.7)",
    },
};

// ─── Icons (inline SVG — no extra deps) ──────────────────────────────────────
const Icon = {
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
            <path d="M4 19V5"/>
            <path d="M4 19h16"/>
            <path d="M7 15l3-3 3 2 4-6"/>
            <circle cx="7" cy="15" r="1"/>
            <circle cx="10" cy="12" r="1"/>
            <circle cx="13" cy="14" r="1"/>
            <circle cx="17" cy="8" r="1"/>
        </svg>
    ),
    user: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
    ),
    settings: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    chevronLeft: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
        </svg>
    ),
    home: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    ),
    sun: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
    ),
    moon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    ),
};

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
    {
        label: "Wallet",
        items: [
            { label: "My Tickets", href: "/dashboard/attended", icon: Icon.ticket },
            { label: "Saved", href: "/dashboard/saved", icon: Icon.bookmark },
        ],
    },
    {
        label: "Host",
        items: [
            { label: "My Events", href: "/dashboard/organized", icon: Icon.calendar },
        ],
    },
    {
        label: "Insights",
        items: [
            { label: "Analytics", href: "/dashboard/analytics", icon: Icon.analytics },
        ],
    },
    {
        label: "Account",
        items: [
            { label: "Profile", href: "/dashboard/profile", icon: Icon.user },
            { label: "Settings", href: "/dashboard/settings", icon: Icon.settings },
        ],
    },
];

function isNavItemActive(pathname: string | null, href: string) {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function DashboardSidebar({
    mobile = false,
    onNavigate,
}: {
    mobile?: boolean;
    onNavigate?: () => void;
} = {}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mode, setMode] = useState<Mode>("dark");
    const pathname = usePathname();
    const { user } = useUser();

    const W = mobile ? "100%" : collapsed ? 56 : 220;
    const t = THEME[mode];

    // CSS custom properties scoped to the sidebar. Tailwind's arbitrary-value
    // syntax (e.g. `hover:bg-[var(--hover-bg)]`) reads these directly, which is
    // what lets hover states react to the theme without duplicating classes
    // per-mode. Swap `t` for values from a theme provider later and everything
    // downstream keeps working unchanged.
    const themeVars = {
        "--sidebar-bg": t.bg,
        "--sidebar-border": t.border,
        "--text-primary": t.textPrimary,
        "--text-secondary": t.textSecondary,
        "--text-tertiary": t.textTertiary,
        "--hover-bg": t.hoverBg,
        "--active-bg": t.activeBg,
    } as React.CSSProperties;

    return (
        <LayoutGroup id="sidebar">
            <motion.aside
                animate={{ width: W }}
                transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.8 }}
                className="relative z-20 flex h-dvh flex-shrink-0 flex-col"
                style={{
                    background: "var(--sidebar-bg)",
                    borderRight: mobile ? "none" : "1px solid var(--sidebar-border)",
                    ...themeVars,
                }}
            >
                {/* Logo */}
                <div
                    className="flex items-center h-[52px] px-3 flex-shrink-0 overflow-hidden"
                    style={{ borderBottom: "1px solid var(--sidebar-border)" }}
                >
                    <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 min-w-0">
                        <Image
                            src="/icons/logo.svg"
                            alt="Your Lobby"
                            width={22}
                            height={22}
                            className="flex-shrink-0 opacity-90"
                        />
                        <motion.span
                            animate={{ opacity: collapsed ? 0 : 1 }}
                            transition={{ duration: 0.15 }}
                            className="text-[13.5px] font-semibold text-[var(--text-primary)] whitespace-nowrap overflow-hidden"
                        >
                            DevEvent
                        </motion.span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
                    {/* Back to site */}
                    <Link
                        href="/"
                        onClick={onNavigate}
                        className="group flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors duration-150"
                    >
                        <span className="flex-shrink-0">{Icon.home}</span>
                        <motion.span
                            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                            transition={{ duration: 0.12 }}
                            className="text-[12.5px] overflow-hidden whitespace-nowrap"
                        >
                            Back to site
                        </motion.span>
                    </Link>

                    {/* Divider */}
                    <div style={{ height: 1, background: "var(--sidebar-border)", margin: "4px 8px" }} />

                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            {/* Section label */}
                            <motion.p
                                animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
                                transition={{ duration: 0.12 }}
                                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)] px-2 mb-1 overflow-hidden whitespace-nowrap"
                            >
                                {section.label}
                            </motion.p>

                            <ul className="list-none p-0 m-0 space-y-px">
                                {section.items.map((item) => {
                                    const isActive = isNavItemActive(pathname, item.href);

                                    return (
                                        <li key={item.href} className="relative">
                                            {isActive && (
                                                <motion.span
                                                    layoutId="sidebar-active-pill"
                                                    className="absolute inset-0 rounded-md bg-[var(--active-bg)]"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 420,
                                                        damping: 34,
                                                    }}
                                                />
                                            )}

                                            <Link
                                                href={item.href}
                                                onClick={onNavigate}
                                                className={`group relative flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors duration-150 ${
                                                    isActive
                                                        ? "text-[var(--text-primary)]"
                                                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                                                }`}
                                            >
                                                <span className="flex-shrink-0">{item.icon}</span>

                                                <motion.span
                                                    animate={{
                                                        opacity: collapsed ? 0 : 1,
                                                        width: collapsed ? 0 : "auto",
                                                        fontWeight: isActive ? 500 : 400,
                                                    }}
                                                    transition={{ duration: 0.12 }}
                                                    className="text-[13px] overflow-hidden whitespace-nowrap"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div
                    className="flex-shrink-0 px-2 py-2 space-y-0.5 overflow-hidden"
                    style={{ borderTop: "1px solid var(--sidebar-border)" }}
                >
                    {/* User row */}
                    <Link
                        href="/dashboard/profile"
                        onClick={onNavigate}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-[var(--hover-bg)] transition-colors duration-150 min-w-0"
                    >
                        <div
                            className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-[9px] font-bold"
                            style={{ background: t.avatarBg, color: t.avatarText }}
                        >
                            {user?.imageUrl ? (
                                <Image
                                    src={user.imageUrl}
                                    alt="avatar"
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.firstName?.slice(0, 2).toUpperCase() ?? "ME"
                            )}
                        </div>
                        <motion.div
                            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                            transition={{ duration: 0.12 }}
                            className="overflow-hidden min-w-0"
                        >
                            <p className="text-[12.5px] font-medium text-[var(--text-primary)] truncate leading-tight">
                                {user?.fullName ?? user?.firstName ?? "You"}
                            </p>
                        </motion.div>
                    </Link>

                    {/* Theme toggle */}
                    <button
                        onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}
                        className="flex items-center gap-2.5 px-2 py-1.5 w-full rounded-md hover:bg-[var(--hover-bg)] transition-colors duration-150 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    >
                        <span className="flex-shrink-0">{mode === "dark" ? Icon.sun : Icon.moon}</span>
                        <motion.span
                            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                            transition={{ duration: 0.12 }}
                            className="text-[12px] overflow-hidden whitespace-nowrap"
                        >
                            {mode === "dark" ? "Light mode" : "Dark mode"}
                        </motion.span>
                    </button>

                    {/* Collapse toggle */}
                    {!mobile && (
                        <button
                            onClick={() => setCollapsed((p) => !p)}
                            className="flex items-center gap-2.5 px-2 py-1.5 w-full rounded-md hover:bg-[var(--hover-bg)] transition-colors duration-150 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                        >
                            <motion.span
                                animate={{ rotate: collapsed ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="flex-shrink-0 ml-0.5"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
                                    <path d="M9 4v16" />
                                    <path d="M15 10l-2 2l2 2" />
                                </svg>
                            </motion.span>

                            <motion.span
                                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                                transition={{ duration: 0.12 }}
                                className="text-[12px] overflow-hidden whitespace-nowrap"
                            >
                                Collapse
                            </motion.span>
                        </button>
                    )}
                </div>
            </motion.aside>
        </LayoutGroup>
    );
}
