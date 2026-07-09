"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 animate-pulse">
      {/* Avatar Skeleton */}
      <div className="h-9 w-9 rounded-full bg-white/10" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Title */}
            <div className="h-4 w-4/5 rounded bg-white/10" />
            {/* Body */}
            <div className="h-3.5 w-full rounded bg-white/10" />
            <div className="h-3.5 w-3/4 rounded bg-white/10" />
          </div>
          {/* Unread dot placeholder */}
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>

        {/* Time */}
        <div className="h-3 w-16 rounded bg-white/10" />
      </div>
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
        <Drawer open={open} onOpenChange={setOpen} direction="bottom">
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

            <DrawerContent className="w-full overflow-hidden border border-white/10 bg-[#11161d] shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-0 flex flex-col sm:max-w-md sm:mx-auto data-[vaul-drawer-direction=bottom]:!rounded-t-3xl data-[vaul-drawer-direction=bottom]:!mt-0 data-[vaul-drawer-direction=bottom]:!h-[75vh] data-[vaul-drawer-direction=bottom]:!max-h-[75vh]">
                <DrawerHeader className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-fuchsia-500/10 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <DrawerTitle className="text-[13px] font-semibold text-white/90">
                                Notifications
                            </DrawerTitle>
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
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-2">
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
                            Array.from({ length: 5 }).map((_, index) => (
                                <NotificationSkeleton key={index} />
                            ))
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
            </DrawerContent>
        </Drawer>
    );
}