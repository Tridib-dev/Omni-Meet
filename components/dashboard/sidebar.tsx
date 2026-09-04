"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useClerk, useUser } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
    ChevronRight,
    PanelLeft,
    LogOut,
    Settings2,
    UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarProps = {
    mobile?: boolean;
    collapsed?: boolean;
    onCollapsedChange?: (next: boolean) => void;
    onNavigate?: () => void;
};

type NavItem = {
    label: string;
    href: string;
    icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M4 11.5L12 4l8 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M6.5 10.5V20h11V10.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        label: "Saved",
        href: "/dashboard/saved",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M6.5 5.5A1.5 1.5 0 0 1 8 4h8a1.5 1.5 0 0 1 1.5 1.5V20l-5.5-3-5.5 3V5.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        label: "My Events",
        href: "/dashboard/organized",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 3.5V6M16 3.5V6M4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: "My Tickets",
        href: "/dashboard/attended",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M4 9a2 2 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-6V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path d="M12 6.5v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M7 15l3-3 3 2 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        label: "Create Event",
        href: "/create_event",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: "Discover",
        href: "/events/discover",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M12 4l5.5 2.5L20 12l-2.5 5.5L12 20l-5.5-2.5L4 12l2.5-5.5L12 4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path
                    d="M10.5 13.5 13.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
];

const isActiveHref = (pathname: string | null, href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
};

function BrandMark() {
    return (
        <div className="grid size-10 place-items-center rounded-2xl bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            <Image src="/icons/logo.svg" alt="DevEvent" width={24} height={24} className="size-6" />
        </div>
    );
}

function NavIcon({ icon, active }: { icon: ReactNode; active: boolean }) {
    return (
        <span className={cn(
            "grid size-[26px] shrink-0 place-items-center rounded-xl ring-1 transition-colors",
            active
                ? "bg-[#332be0]/10 text-[#332be0] ring-[#332be0]/20"
                : "bg-white text-slate-500 ring-slate-200/80 group-hover:bg-slate-50 group-hover:text-slate-900"
        )}>
            {icon}
        </span>
    );
}

function SidebarNavItem({
    item,
    active,
    collapsed,
    onNavigate,
}: {
    item: NavItem;
    active: boolean;
    collapsed: boolean;
    onNavigate?: () => void;
}) {
    return (
        <li>
            <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                    "group relative flex min-w-0 items-center gap-2 rounded-[12px] border px-2 py-2 transition-colors",
                    collapsed ? "justify-center px-0" : "justify-start",
                    active
                        ? "border-[#332be0]/20 bg-[#332be0]/10 text-slate-950 shadow-[0_10px_24px_rgba(51,43,224,0.08)]"
                        : "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                )}
            >
                <NavIcon icon={item.icon} active={active} />
                <motion.span
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                    transition={{ duration: 0.16 }}
                    className="min-w-0 overflow-hidden whitespace-nowrap text-[12px] font-medium"
                >
                    {item.label}
                </motion.span>
            </Link>
        </li>
    );
}

function SidebarPromo({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[22px] border border-blue-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(239,246,255,0.98)_100%)] shadow-[0_16px_30px_rgba(15,23,42,0.06)]",
                collapsed ? "mx-[6px] p-2" : "mx-[6px] p-[10px]"
            )}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.06),transparent_40%)]" />
            <div className="relative space-y-1.5">
                <div className="flex items-center gap-1">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                        Spotlight
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[8px] text-slate-500">
                        Ad slot
                    </span>
                </div>

                <div className={collapsed ? "space-y-1.5" : "space-y-2"}>
                    <h3 className={collapsed ? "text-[11px] font-semibold leading-tight text-slate-900" : "text-[12px] font-semibold leading-tight text-slate-900"}>
                        Promote your next event
                    </h3>
                    <p
                        className={cn(
                            "text-[10px] leading-4 text-slate-600",
                            collapsed ? "line-clamp-2" : "line-clamp-3"
                        )}
                    >
                        Use this card for an ad, a campaign note, or a quick todo list with a strong CTA.
                    </p>
                </div>

                <Link
                    href="/create_event"
                    onClick={onNavigate}
                    className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-800",
                        collapsed ? "h-7 w-full px-3 text-[10px]" : "h-8 px-3.5 text-[11px]"
                    )}
                >
                    Create event
                    <ChevronRight size={12} />
                </Link>
            </div>
        </div>
    );
}

function ProfileMenu({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
    const router = useRouter();
    const clerk = useClerk();
    const { user, isSignedIn } = useUser();

    const name = user?.fullName || user?.firstName || "You";
    const email = user?.primaryEmailAddress?.emailAddress || "Dashboard member";

    const handleGo = (href: string) => {
        onNavigate?.();
        router.push(href);
    };

    const handleSignOut = async () => {
        onNavigate?.();
        await clerk.signOut({ redirectUrl: "/" });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "mx-[6px] mb-[6px] mt-1 flex w-[calc(100%-12px)] items-center gap-2 rounded-[15px] border border-slate-200 bg-white px-2 py-[7px] text-left shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-colors hover:bg-slate-50",
                        collapsed && "justify-center"
                    )}
                    title={name}
                >
                    <div className="relative shrink-0">
                        <div className="grid size-[34px] place-items-center overflow-hidden rounded-2xl bg-slate-100 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                            {user?.imageUrl ? (
                                <Image
                                    src={user.imageUrl}
                                    alt={name}
                                    width={34}
                                    height={34}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <UserRound size={14} />
                            )}
                        </div>
                    </div>

                    {!collapsed && (
                        <motion.div animate={{ opacity: 1, width: "auto" }} className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold text-slate-900">{name}</p>
                            <p className="truncate text-[9px] text-slate-500">{isSignedIn ? email : "Profile menu"}</p>
                        </motion.div>
                    )}

                    {!collapsed && (
                        <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                            <ChevronRight size={12} />
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                side="right"
                sideOffset={10}
                className="w-72 rounded-[15px] border border-slate-200 bg-white/96 p-2 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl"
            >
                <DropdownMenuLabel className="px-2 py-2">
                    <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-slate-900">{name}</p>
                        <p className="text-[11px] text-slate-500">{email}</p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-slate-200" />

                <DropdownMenuItem
                    onSelect={() => handleGo("/dashboard/profile")}
                    className="cursor-pointer rounded-xl px-3 py-2 text-[13px] text-slate-700 focus:bg-slate-100 focus:text-slate-950"
                >
                    <UserRound size={14} />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                    onSelect={() => handleGo("/dashboard/settings")}
                    className="cursor-pointer rounded-xl px-3 py-2 text-[13px] text-slate-700 focus:bg-slate-100 focus:text-slate-950"
                >
                    <Settings2 size={14} />
                    Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-slate-200" />

                <DropdownMenuItem
                    onSelect={handleSignOut}
                    className="cursor-pointer rounded-2xl px-3 py-2 text-[13px] text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                >
                    <LogOut size={14} />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function DashboardSidebar({
    mobile = false,
    collapsed = false,
    onCollapsedChange,
    onNavigate,
}: SidebarProps = {}) {
    const pathname = usePathname();
    const effectiveCollapsed = mobile ? false : collapsed;

    return (
        <motion.aside
            animate={{ width: mobile ? "100%" : effectiveCollapsed ? 80 : 232 }}
            transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.9 }}
            className={cn(
                "relative z-20 flex h-full min-h-0 flex-shrink-0 flex-col overflow-visible rounded-[15px] border border-slate-200/80 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl",
                mobile && "rounded-none border-0 shadow-none"
            )}
        >
            <div className="flex h-11 items-center gap-2 px-2.5 pt-1">
                <Link
                    href="/"
                    onClick={onNavigate}
                    className={cn("flex min-w-0 items-center gap-2", effectiveCollapsed && "justify-center")}
                >
                    <BrandMark />
                    {!effectiveCollapsed && (
                        <motion.span
                            animate={{ opacity: 1, width: "auto" }}
                            transition={{ duration: 0.16 }}
                            className="min-w-0 overflow-hidden whitespace-nowrap text-[12px] font-semibold tracking-[-0.02em] text-slate-900"
                        >
                            DevEvent
                        </motion.span>
                    )}
                </Link>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col px-2 pb-1">
                <ul className="space-y-0.5 pt-4">
                    {NAV_ITEMS.map((item) => (
                        <SidebarNavItem
                            key={item.href}
                            item={item}
                            active={isActiveHref(pathname, item.href)}
                            collapsed={effectiveCollapsed}
                            onNavigate={onNavigate}
                        />
                    ))}
                </ul>

                <div className="mt-auto flex flex-col">
                    {!mobile && (
                        <button
                            type="button"
                            aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            onClick={() => onCollapsedChange?.(!effectiveCollapsed)}
                            className="absolute right-[-10px] top-[38px] z-30 grid size-[22px] place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            {effectiveCollapsed ? <PanelLeft size={15} /> : <PanelLeft size={15} />}
                        </button>
                    )}

                    {!effectiveCollapsed && (
                        <div className="pb-0">
                            <SidebarPromo collapsed={effectiveCollapsed} onNavigate={onNavigate} />
                        </div>
                    )}
                </div>
            </nav>

            <ProfileMenu onNavigate={onNavigate} collapsed={effectiveCollapsed} />
        </motion.aside>
    );
}
