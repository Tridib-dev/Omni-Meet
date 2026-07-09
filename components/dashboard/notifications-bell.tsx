"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";

import {
    getMyNotifications,
    getUnreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
    type NotificationItem,
} from "@/lib/actions/notification.actions";

function timeAgo(input: string) {
    const then = new Date(input).getTime();
    const diff = Date.now() - then;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(input).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}

function Avatar({ notification }: { notification: NotificationItem }) {
    const initials = notification.actorName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (notification.actorPhoto) {
        return (
            <Image
                src={notification.actorPhoto}
                alt={notification.actorName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover border border-white/10"
            />
        );
    }

    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/70">
            {initials || "@"}
        </div>
    );
}

export default function NotificationsBell() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const unreadVisible = useMemo(
        () => unreadCount > 0,
        [unreadCount]
    );

    const loadUnreadCount = useCallback(async () => {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const count = await getUnreadNotificationCount();
            if (!cancelled) {
                setUnreadCount(count);
            }
        };

        void run();

        const refresh = () => void loadUnreadCount();
        const onVisibility = () => {
            if (!document.hidden) {
                void loadUnreadCount();
            }
        };

        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [loadUnreadCount]);

    useEffect(() => {
        if (open) {
            let cancelled = false;

            const run = async () => {
                setLoading(true);
                try {
                    const [items, count] = await Promise.all([
                        getMyNotifications(),
                        getUnreadNotificationCount(),
                    ]);
                    if (!cancelled) {
                        setNotifications(items);
                        setUnreadCount(count);
                    }
                } finally {
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            };

            void run();

            return () => {
                cancelled = true;
            };
        }
    }, [open]);

    const handleItemClick = async (notificationId: string) => {
        setUnreadCount((current) => Math.max(0, current - 1));
        setNotifications((current) =>
            current.map((notification) =>
                notification._id === notificationId
                    ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() }
                    : notification
            )
        );

        await markNotificationRead(notificationId);
        void loadUnreadCount();
    };

    const handleMarkAll = async () => {
        const result = await markAllNotificationsRead();
        if (result.success) {
            setUnreadCount(0);
            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    readAt: notification.readAt ?? new Date().toISOString(),
                }))
            );
        }
    };

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setOpen((current) => !current)}
                    className="relative flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60"
                    aria-label="Open notifications"
                >
                    <Bell className="h-3.5 w-3.5" />
                    {unreadVisible && (
                        <span className="absolute right-0.5 top-0.5 h-2.5 min-w-2.5 rounded-full bg-cyan-400 ring-2 ring-[#080c10]" />
                    )}
                </button>

                {open && (
                    <>
                        <button
                            className="fixed inset-0 z-40 cursor-default bg-black/35 backdrop-blur-[1px]"
                            aria-label="Close notifications"
                            onClick={() => setOpen(false)}
                        />

                        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#11161d] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                            <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-fuchsia-500/10 px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[13px] font-semibold text-white/90">Notifications</p>
                                        <p className="mt-0.5 text-[11px] text-white/35">
                                            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setOpen(false)}
                                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55 transition-colors hover:bg-white/10 hover:text-white/90"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[68vh] overflow-y-auto p-2">
                                <div className="mb-2 flex items-center justify-between gap-3 px-2 pt-1">
                                    <p className="text-[11px] text-white/30">
                                        Recent activity from people you follow
                                    </p>
                                    <button
                                        onClick={handleMarkAll}
                                        disabled={unreadCount === 0}
                                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Mark all read
                                    </button>
                                </div>

                                <div className="space-y-2 p-1">
                                    {loading ? (
                                        <p className="py-8 text-center text-[12px] text-white/35">Loading notifications…</p>
                                    ) : notifications.length === 0 ? (
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center">
                                            <p className="text-[13px] text-white/75">No notifications yet.</p>
                                            <p className="mt-1 text-[12px] leading-5 text-white/30">
                                                Follow someone or publish an event to see updates here.
                                            </p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => {
                                            const unread = !notification.readAt;
                                            return (
                                                <Link
                                                    key={notification._id}
                                                    href={notification.href}
                                                    onClick={() => {
                                                        void handleItemClick(notification._id);
                                                        setOpen(false);
                                                    }}
                                                    className={[
                                                        "flex gap-3 rounded-2xl border px-4 py-3 transition-colors",
                                                        unread
                                                            ? "border-cyan-500/20 bg-cyan-500/10"
                                                            : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]",
                                                    ].join(" ")}
                                                >
                                                    <Avatar notification={notification} />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-[13px] font-medium text-white/90">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="mt-0.5 text-[12px] leading-5 text-white/55">
                                                                    {notification.body}
                                                                </p>
                                                            </div>

                                                            {unread && (
                                                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400" />
                                                            )}
                                                        </div>

                                                        <p className="mt-2 text-[11px] text-white/30">
                                                            {timeAgo(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
