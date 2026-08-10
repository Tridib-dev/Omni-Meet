"use server";

import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import {
    Notification,
    type NotificationCategory,
    type NotificationRequestStatus,
    type NotificationType,
} from "@/database/notification.model";
import { buildNotificationHref } from "@/lib/notifications";

export type NotificationItem = {
    _id: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    body: string;
    actorClerkId: string;
    actorUsername: string;
    actorName: string;
    actorPhoto: string;
    eventSlug?: string;
    eventTitle?: string;
    profileUsername?: string;
    inviteId?: string;
    requestStatus?: NotificationRequestStatus;
    isActionable: boolean;
    href: string;
    readAt: string | null;
    createdAt: string;
};

function resolveCategory(notification: {
    type: NotificationType;
    category?: NotificationCategory;
}): NotificationCategory {
    if (notification.category) {
        return notification.category;
    }

    return notification.type === "co_organizer_invite" ? "requests" : "activity";
}

const serializeNotification = async (notification: {
    _id: { toString(): string } | string;
    type: NotificationType;
    category?: NotificationCategory;
    title: string;
    body: string;
    actorClerkId: string;
    actorUsername: string;
    actorName: string;
    actorPhoto: string;
    eventSlug?: string;
    eventTitle?: string;
    profileUsername?: string;
    inviteId?: string;
    requestStatus?: NotificationRequestStatus;
    readAt?: Date | null;
    createdAt: Date;
}) => {
    const category = resolveCategory(notification);
    const requestStatus =
        notification.requestStatus ??
        (notification.type === "co_organizer_invite" ? "pending" : undefined);

    return {
        _id: notification._id.toString(),
        type: notification.type,
        category,
        title: notification.title,
        body: notification.body,
        actorClerkId: notification.actorClerkId,
        actorUsername: notification.actorUsername,
        actorName: notification.actorName,
        actorPhoto: notification.actorPhoto,
        eventSlug: notification.eventSlug,
        eventTitle: notification.eventTitle,
        profileUsername: notification.profileUsername,
        inviteId: notification.inviteId,
        requestStatus,
        isActionable:
            notification.type === "co_organizer_invite" && requestStatus === "pending",
        href: await buildNotificationHref({
            type: notification.type,
            eventSlug: notification.eventSlug,
            profileUsername: notification.profileUsername,
        }),
        readAt: notification.readAt ? notification.readAt.toISOString() : null,
        createdAt: notification.createdAt.toISOString(),
    };
};

export const getMyNotifications = async (
    options?: { category?: NotificationCategory; limit?: number }
): Promise<NotificationItem[]> => {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        await connectToDatabase();

        const filter: Record<string, unknown> = { recipientClerkId: userId };
        if (options?.category === "activity") {
            filter.$or = [
                { category: "activity" },
                {
                    type: { $in: ["follow", "event_created", "co_organizer_accepted"] },
                    category: { $exists: false },
                },
            ];
        } else if (options?.category === "requests") {
            filter.$or = [{ category: "requests" }, { type: "co_organizer_invite" }];
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(options?.limit ?? 20)
            .lean();

        const serialized = await Promise.all(notifications.map((notification) => serializeNotification(notification)));
        return JSON.parse(JSON.stringify(serialized));
    } catch (error) {
        console.error("[getMyNotifications]", error);
        return [];
    }
};

export const getUnreadNotificationCount = async (): Promise<number> => {
    try {
        const { userId } = await auth();
        if (!userId) return 0;

        await connectToDatabase();
        return await Notification.countDocuments({ recipientClerkId: userId, readAt: null });
    } catch (error) {
        console.error("[getUnreadNotificationCount]", error);
        return 0;
    }
};

export const markNotificationRead = async (notificationId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false };

        await connectToDatabase();

        await Notification.updateOne(
            { _id: notificationId, recipientClerkId: userId },
            { $set: { readAt: new Date() } }
        );

        return { success: true };
    } catch (error) {
        console.error("[markNotificationRead]", error);
        return { success: false };
    }
};

export const markAllNotificationsRead = async () => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false };

        await connectToDatabase();

        await Notification.updateMany(
            { recipientClerkId: userId, readAt: null },
            { $set: { readAt: new Date() } }
        );

        return { success: true };
    } catch (error) {
        console.error("[markAllNotificationsRead]", error);
        return { success: false };
    }
};
