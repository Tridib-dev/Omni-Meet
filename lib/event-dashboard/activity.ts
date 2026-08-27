"use server";

import { cache } from "react";
import { isValidObjectId } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database/booking.model";
import { Order } from "@/database/Order.model";
import { Event } from "@/database/event.model";
import { CoOrganizer } from "@/database/coOrganizer.model";
import { Notification } from "@/database/notification.model";
import { isGateAuthorized } from "@/lib/actions/gate.actions";
import type { EventActivityItem } from "@/lib/event-dashboard/types";
import { paiseToRupees } from "@/lib/payments/money";

export interface EventActivityFeedResult {
    items: EventActivityItem[];
}

function toIso(value: Date | string | undefined): string {
    if (!value) return new Date().toISOString();
    return new Date(value).toISOString();
}

export const getEventActivityFeed = cache(
    async (eventId: string, limit = 12): Promise<EventActivityFeedResult> => {
        if (!isValidObjectId(eventId)) return { items: [] };

        const authorized = await isGateAuthorized(eventId);
        if (!authorized) return { items: [] };

        await connectToDatabase();

        const [bookings, orders, notifications] = await Promise.all([
            Booking.find({ eventId }).sort({ createdAt: -1 }).limit(limit).lean(),
            Order.find({ eventId, status: "paid" }).sort({ createdAt: -1 }).limit(limit).lean(),
            Notification.find({ eventId }).sort({ createdAt: -1 }).limit(limit).lean(),
        ]);

        const items: EventActivityItem[] = [
            ...bookings.map((booking) => ({
                id: `booking-${booking._id.toString()}`,
                kind: "booking" as const,
                title: booking.checkedIn ? "Attendee checked in" : "New free registration",
                description: "An attendee registered for this event",
                timestamp: toIso(booking.createdAt),
            })),
            ...orders.map((order) => ({
                id: `order-${order._id.toString()}`,
                kind: "payment" as const,
                title: "Paid ticket purchased",
                description: order.amount
                    ? `₹${paiseToRupees(Number(order.amount)).toLocaleString("en-IN")} order received`
                    : "Paid order received",
                timestamp: toIso(order.createdAt),
            })),
            ...notifications.map((notification) => {
                let kind: EventActivityItem["kind"] = "system";
                if (notification.type === "co_organizer_accepted") kind = "co_organizer_accepted";
                if (notification.type === "co_organizer_invite") kind = "co_organizer_invite";

                return {
                    id: `notification-${notification._id.toString()}`,
                    kind,
                    title: notification.title,
                    description: notification.body,
                    timestamp: toIso(notification.createdAt),
                };
            }),
        ];

        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { items: items.slice(0, limit) };
    }
);

export async function getCoOrganizerCount(eventId: string): Promise<number> {
    if (!isValidObjectId(eventId)) return 0;
    await connectToDatabase();
    return CoOrganizer.countDocuments({ eventId });
}

export async function getEventCreatedAt(eventId: string): Promise<Date | null> {
    if (!isValidObjectId(eventId)) return null;
    await connectToDatabase();
    const event = await Event.findById(eventId).select("createdAt date").lean<{ createdAt: Date; date: string }>();
    if (!event) return null;
    return event.createdAt ?? new Date(event.date);
}
