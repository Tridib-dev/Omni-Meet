"use server";

import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { Notification } from "@/database/notification.model";
import { buildNotificationHref } from "@/lib/notifications";

export type NotificationItem = {
    _id: string;
    type: "follow" | "event_created";
    title: string;
    body: string;
    actorClerkId: string;
    actorUsername: string;
    actorName: string;
    actorPhoto: string;
    eventSlug?: string;
    eventTitle?: string;
    profileUsername?: string;
    href: string;
    readAt: string | null;
    createdAt: string;
};

const serializeNotification = async (notification: {
    _id: { toString(): string } | string;
    type: "follow" | "event_created";
    title: string;
    body: string;
    actorClerkId: string;
    actorUsername: string;
    actorName: string;
    actorPhoto: string;
    eventSlug?: string;
    eventTitle?: string;
    profileUsername?: string;
    readAt?: Date | null;
    createdAt: Date;
}) => ({
    _id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    body: notification.body,
    actorClerkId: notification.actorClerkId,
    actorUsername: notification.actorUsername,
    actorName: notification.actorName,
    actorPhoto: notification.actorPhoto,
    eventSlug: notification.eventSlug,
    eventTitle: notification.eventTitle,
    profileUsername: notification.profileUsername,
    href: await buildNotificationHref({
        type: notification.type,
        eventSlug: notification.eventSlug,
        profileUsername: notification.profileUsername,
    }),
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
});

export const getMyNotifications = async (limit = 20): Promise<NotificationItem[]> => {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        await connectToDatabase();

        const notifications = await Notification.find({ recipientClerkId: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
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
