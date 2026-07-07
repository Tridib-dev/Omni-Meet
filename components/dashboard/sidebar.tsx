"use client";

// components/dashboard/sidebar.tsx
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

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
export default function DashboardSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user } = useUser();

    const W = collapsed ? 56 : 220;

    return (
        <LayoutGroup id="sidebar">
            <motion.aside
                animate={{ width: W }}
                transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.8 }}
                className="relative flex flex-col flex-shrink-0 h-screen z-20"
                style={{
                    background: "#0b0f13",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {/* Logo */}
                <div className="flex items-center h-[52px] px-3 flex-shrink-0 overflow-hidden"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <Link href="/" className="flex items-center gap-2.5 min-w-0">
                        <Image
                            src="/icons/logo.png"
                            alt="DevEvent"
                            width={22}
                            height={22}
                            className="flex-shrink-0 opacity-90"
                        />
                        <motion.span
                            animate={{ opacity: collapsed ? 0 : 1 }}
                            transition={{ duration: 0.15 }}
                            className="text-[13.5px] font-semibold text-white/90 whitespace-nowrap overflow-hidden"
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
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
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
                    <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "4px 8px" }} />

                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            {/* Section label */}
                            <motion.p
                                animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
                                transition={{ duration: 0.12 }}
                                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25 px-2 mb-1 overflow-hidden whitespace-nowrap"
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
                                                    className="absolute inset-0 rounded-md"
                                                    style={{ background: "rgba(255,255,255,0.07)" }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 420,
                                                        damping: 34,
                                                    }}
                                                />
                                            )}

                                            <Link
                                                href={item.href}
                                                className="relative flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors"
                                                style={{
                                                    color: isActive
                                                        ? "rgba(255,255,255,0.92)"
                                                        : "rgba(255,255,255,0.4)",
                                                }}
                                            >
                                                <motion.span
                                                    animate={{
                                                        color: isActive ? "#67e8f9" : "rgba(255,255,255,0.35)",
                                                    }}
                                                    className="flex-shrink-0"
                                                >
                                                    {item.icon}
                                                </motion.span>

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
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                    {/* User row */}
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-white/[0.04] transition-colors min-w-0"
                    >
                        <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white">
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
                            <p className="text-[12.5px] font-medium text-white/75 truncate leading-tight">
                                {user?.fullName ?? user?.firstName ?? "You"}
                            </p>
                        </motion.div>
                    </Link>

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setCollapsed((p) => !p)}
                        className="flex items-center gap-2.5 px-2 py-1.5 w-full rounded-md hover:bg-white/[0.04] transition-colors text-white/25 hover:text-white/50"
                    >
                        <motion.span
                            animate={{ rotate: collapsed ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="flex-shrink-0 ml-0.5"
                        >
                            {Icon.chevronLeft}
                        </motion.span>
                        <motion.span
                            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                            transition={{ duration: 0.12 }}
                            className="text-[12px] overflow-hidden whitespace-nowrap"
                        >
                            Collapse
                        </motion.span>
                    </button>
                </div>
            </motion.aside>
        </LayoutGroup>
    );
}
