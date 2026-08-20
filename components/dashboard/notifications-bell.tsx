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
import {
    acceptCoOrganizerInviteAction,
    declineCoOrganizerInviteAction,
} from "@/lib/actions/coOrganizerInvite.actions";

type NotificationTab = "all" | "activity" | "requests";

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
    <div className="flex gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-white/10" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-4 w-4/5 rounded bg-white/10" />
            <div className="h-3.5 w-full rounded bg-white/10" />
            <div className="h-3.5 w-3/4 rounded bg-white/10" />
          </div>
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <div className="h-3 w-16 rounded bg-white/10" />
      </div>
    </div>
  );
}

function RequestStatusPill({ status }: { status: "accepted" | "denied" }) {
    const label = status === "accepted" ? "Accepted" : "Declined";
    const styles =
        status === "accepted"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-white/15 bg-white/5 text-white/45";

    return (
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles}`}>
            {label}
        </span>
    );
}

function NotificationContent({
    notification,
    unread,
}: {
    notification: NotificationItem;
    unread: boolean;
}) {
    return (
        <>
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

                <div className="mt-2 flex items-center gap-2">
                    <p className="text-[11px] text-white/30">
                        {timeAgo(notification.createdAt)}
                    </p>
                    {notification.requestStatus === "accepted" && (
                        <RequestStatusPill status="accepted" />
                    )}
                    {notification.requestStatus === "denied" && (
                        <RequestStatusPill status="denied" />
                    )}
                </div>
            </div>
        </>
    );
}

export default function NotificationsBell() {
    return <NotificationsBellTrigger variant="light" />;
}

export function NotificationsBellTrigger({ variant = "light" }: { variant?: "light" | "dark" }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [activeTab, setActiveTab] = useState<NotificationTab>("all");
    const [actingOnInviteId, setActingOnInviteId] = useState<string | null>(null);

    const unreadVisible = useMemo(
        () => unreadCount > 0,
        [unreadCount]
    );

    const loadUnreadCount = useCallback(async () => {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
    }, []);

    const loadNotifications = useCallback(async (tab: NotificationTab) => {
        setLoading(true);
        try {
            const category =
                tab === "activity" ? "activity" : tab === "requests" ? "requests" : undefined;

            const [items, count] = await Promise.all([
                getMyNotifications({ category, limit: 30 }),
                getUnreadNotificationCount(),
            ]);

            setNotifications(items);
            setUnreadCount(count);
        } finally {
            setLoading(false);
        }
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
            const timer = window.setTimeout(() => {
                void loadNotifications(activeTab);
            }, 0);

            return () => window.clearTimeout(timer);
        }
    }, [open, activeTab, loadNotifications]);

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

    const handleInviteAction = async (
        notification: NotificationItem,
        action: "accept" | "decline"
    ) => {
        if (!notification.inviteId) return;

        setActingOnInviteId(notification.inviteId);

        try {
            const result =
                action === "accept"
                    ? await acceptCoOrganizerInviteAction(notification.inviteId)
                    : await declineCoOrganizerInviteAction(notification.inviteId);

            if (!result.success) return;

            const nextStatus = action === "accept" ? "accepted" : "denied";

            setNotifications((current) =>
                current.map((item) =>
                    item._id === notification._id
                        ? {
                              ...item,
                              requestStatus: nextStatus,
                              isActionable: false,
                              readAt: item.readAt ?? new Date().toISOString(),
                          }
                        : item
                )
            );

            if (!notification.readAt) {
                setUnreadCount((current) => Math.max(0, current - 1));
            }

            await markNotificationRead(notification._id);
            void loadUnreadCount();
        } finally {
            setActingOnInviteId(null);
        }
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

    const emptyMessage =
        activeTab === "requests"
            ? "No pending requests right now."
            : activeTab === "activity"
              ? "No activity yet."
              : "No notifications yet.";

    const emptyHint =
        activeTab === "requests"
            ? "Co-organizer invitations will show up here."
            : "Follow someone or publish an event to see updates here.";

    const tabs: { key: NotificationTab; label: string }[] = [
        { key: "all", label: "All" },
        { key: "activity", label: "Activity" },
        { key: "requests", label: "Requests" },
    ];

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="bottom">
            <button
                onClick={() => setOpen((current) => !current)}
                className={
                    variant === "light"
                        ? "relative flex h-8 w-8 items-center justify-center rounded-[12px] border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                        : "relative flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-white/70 shadow-sm transition-colors hover:bg-white/[0.08] hover:text-white"
                }
                aria-label="Open notifications"
            >
                <Bell className="h-4 w-4" />
                {unreadVisible && (
                    <span
                        className={
                            variant === "light"
                                ? "absolute right-0.5 top-0.5 h-2.5 min-w-2.5 rounded-full bg-cyan-500 ring-2 ring-white"
                                : "absolute right-0.5 top-0.5 h-2.5 min-w-2.5 rounded-full bg-cyan-400 ring-2 ring-[#080c10]"
                        }
                    />
                )}
            </button>

            <DrawerContent className="w-full overflow-hidden border border-white/10 bg-[#11161d] shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-0 flex flex-col sm:max-w-md sm:mx-auto data-[vaul-drawer-direction=bottom]:rounded-t-3xl! data-[vaul-drawer-direction=bottom]:mt-0! data-[vaul-drawer-direction=bottom]:h-[75vh]! data-[vaul-drawer-direction=bottom]:max-h-[75vh]!">
                <DrawerHeader className="border-b border-white/10 bg-linear-to-r from-cyan-500/10 via-transparent to-fuchsia-500/10 px-4 py-3">
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

                <div className="border-b border-white/10 px-4 py-2">
                    <div className="flex gap-1 rounded-xl border border-white/10 bg-white/3 p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={[
                                    "flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                                    activeTab === tab.key
                                        ? "bg-white/10 text-white/90"
                                        : "text-white/45 hover:text-white/70",
                                ].join(" ")}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="mb-2 flex items-center justify-between gap-3 px-2 pt-1">
                        <p className="text-[11px] text-white/30">
                            Activity and requests from your network
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
                            <div className="rounded-2xl border border-white/10 bg-white/3 px-4 py-10 text-center">
                                <p className="text-[13px] text-white/75">{emptyMessage}</p>
                                <p className="mt-1 text-[12px] leading-5 text-white/30">
                                    {emptyHint}
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const unread = !notification.readAt;
                                const rowClass = [
                                    "flex gap-3 rounded-2xl border px-4 py-3 transition-colors",
                                    unread
                                        ? "border-cyan-500/20 bg-cyan-500/10"
                                        : "border-white/8 bg-white/[0.03]",
                                ].join(" ");

                                if (notification.isActionable && notification.inviteId) {
                                    const isActing = actingOnInviteId === notification.inviteId;

                                    return (
                                        <div key={notification._id} className={rowClass}>
                                            <div className="flex min-w-0 flex-1 gap-3">
                                                <NotificationContent
                                                    notification={notification}
                                                    unread={unread}
                                                />
                                            </div>

                                            <div className="flex shrink-0 flex-col justify-end gap-1.5 self-end">
                                                <button
                                                    type="button"
                                                    disabled={isActing}
                                                    onClick={() => void handleInviteAction(notification, "accept")}
                                                    className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-200 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isActing}
                                                    onClick={() => void handleInviteAction(notification, "decline")}
                                                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/10 disabled:opacity-50"
                                                >
                                                    Deny
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                if (notification.isActionable) {
                                    return (
                                        <div key={notification._id} className={rowClass}>
                                            <NotificationContent
                                                notification={notification}
                                                unread={unread}
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={notification._id}
                                        href={notification.href}
                                        onClick={() => {
                                            void handleItemClick(notification._id);
                                            setOpen(false);
                                        }}
                                        className={[rowClass, "hover:bg-white/6"].join(" ")}
                                    >
                                        <NotificationContent
                                            notification={notification}
                                            unread={unread}
                                        />
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
