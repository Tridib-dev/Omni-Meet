"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";
import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database/booking.model";
import { Order } from "@/database/Order.model";
import { paiseToRupees } from "@/lib/payments/money";
import { Watchlist } from "@/database/watchlist.model";
import { User } from "@/database/User.model";
import { Event } from "@/database/event.model";
import { CoOrganizer } from "@/database/coOrganizer.model";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketItem {
    id: string;
    type: "free" | "paid";
    eventId: string;
    eventTitle: string;
    username: string;
    eventCategory?: string;
    eventSlug: string;
    eventImage: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventMode: string;
    eventOrganizer: string;
    price: number;
    bookedAt: string;
    checkedIn: boolean;
    status: "upcoming" | "past" | "expired";
}

export interface UserStats {
    attended: number;
    organized: number;
    saved: number;
    totalSpent: number;
}

export interface OrganizedEventItem {
    id: string;
    title: string;
    slug: string;
    image: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    mode: string;
    price: number;
    status: "upcoming" | "past";
    attendeeCount: number;
    revenue: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categorize(dateStr: string): "upcoming" | "past" | "expired" {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diffDays = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);

    if (eventDate > now) return "upcoming";
    if (diffDays <= 30) return "past";
    return "expired";
}

// ─── getUserTickets ────────────────────────────────────────────────────────────
// Merges free bookings + paid orders into one unified ticket list

export const getUserTickets = cache(async (): Promise<TicketItem[]> => {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        await connectToDatabase();

        // Fetch both in parallel
        const [bookings, orders, user] = await Promise.all([
            Booking.find({ clerkId: userId }).populate("eventId").lean(),
            Order.find({ clerkId: userId, status: "paid" }).populate("eventId").lean(),
            User.findOne({ clerkId: userId }).select("username").lean(),
        ]);
        const username = (user as any)?.username ?? "";

        const tickets: TicketItem[] = [];

        // Free bookings
        for (const b of bookings) {
            const ev = b.eventId as any;
            if (!ev) continue;
            tickets.push({
                id: b._id.toString(),
                type: "free",
                eventId: ev._id.toString(),
                username,
                eventCategory: ev.category,
                eventTitle: ev.title,
                eventSlug: ev.slug,
                eventImage: ev.image,
                eventDate: ev.date,
                eventTime: ev.time,
                eventLocation: ev.location,
                eventMode: ev.mode,
                eventOrganizer: ev.organizer ?? "",
                price: 0,
                bookedAt: (b as any).createdAt,
                checkedIn: (b as any).checkedIn ?? false,
                status: categorize(ev.date),
            });
        }

        // Paid orders
        for (const o of orders) {
            const ev = o.eventId as any;
            if (!ev) continue;
            tickets.push({
                id: o._id.toString(),
                type: "paid",
                eventId: ev._id.toString(),
                username,
                eventCategory: ev.category,
                eventTitle: ev.title,
                eventSlug: ev.slug,
                eventImage: ev.image,
                eventDate: ev.date,
                eventTime: ev.time,
                eventLocation: ev.location,
                eventMode: ev.mode,
                eventOrganizer: ev.organizer ?? "",
                price: paiseToRupees(o.amount),
                bookedAt: (o as any).createdAt,
                checkedIn: false,
                status: categorize(ev.date),
            });
        }

        // Sort: upcoming first, then by event date
        return tickets.sort((a, b) => {
            const order = { upcoming: 0, past: 1, expired: 2 };
            if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
            return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        });
    } catch (error) {
        console.error("[getUserTickets]", error);
        return [];
    }
});

// ─── getUserStats ──────────────────────────────────────────────────────────────

export const getUserStats = cache(async (): Promise<UserStats> => {
    try {
        const { userId } = await auth();
        if (!userId) return { attended: 0, organized: 0, saved: 0, totalSpent: 0 };

        await connectToDatabase();

        const [bookingCount, orders, savedCount, user] = await Promise.all([
            Booking.countDocuments({ clerkId: userId }),
            Order.find({ clerkId: userId, status: "paid" }).select("amount").lean(),
            Watchlist.countDocuments({ clerkId: userId }),
            User.findOne({ clerkId: userId }).select("eventsHostedCount").lean(),
        ]);

        return {
            attended: bookingCount + orders.length,
            organized: (user as any)?.eventsHostedCount ?? 0,
            saved: savedCount,
            totalSpent: paiseToRupees(orders.reduce((sum, o) => sum + ((o as any).amount ?? 0), 0)),
        };
    } catch (error) {
        console.error("[getUserStats]", error);
        return { attended: 0, organized: 0, saved: 0, totalSpent: 0 };
    }
});

function organizedEventStatus(dateStr: string): "upcoming" | "past" {
    return categorize(dateStr) === "upcoming" ? "upcoming" : "past";
}

async function buildOrganizedEventItems(events: any[]): Promise<OrganizedEventItem[]> {
    if (!events.length) return [];

    const eventIds = events.map((e) => e._id);

    const [bookingCounts, orderAggs] = await Promise.all([
        Booking.aggregate([
            { $match: { eventId: { $in: eventIds } } },
            { $group: { _id: "$eventId", count: { $sum: 1 } } },
        ]),
        Order.aggregate([
            { $match: { eventId: { $in: eventIds }, status: "paid" } },
            { $group: { _id: "$eventId", revenue: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]),
    ]);

    const bookingMap = Object.fromEntries(
        bookingCounts.map((b: any) => [b._id.toString(), b.count])
    );
    const orderMap = Object.fromEntries(
        orderAggs.map((o: any) => [o._id.toString(), { revenue: o.revenue, count: o.count }])
    );

    return events.map((ev: any) => {
        const id = ev._id.toString();
        const freeCount = bookingMap[id] ?? 0;
        const paidData = orderMap[id] ?? { revenue: 0, count: 0 };

        return {
            id,
            title: ev.title,
            slug: ev.slug,
            image: ev.image,
            date: ev.date,
            time: ev.time,
            location: ev.location,
            organizer: ev.organizer ?? "",
            mode: ev.mode,
            price: ev.price ?? 0,
            status: organizedEventStatus(ev.date),
            attendeeCount: freeCount + paidData.count,
            revenue: paidData.revenue,
        };
    });
}

// ─── getOrganizedEvents ────────────────────────────────────────────────────────

export const getOrganizedEvents = cache(async (): Promise<OrganizedEventItem[]> => {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        await connectToDatabase();

        const events = await Event.find({ creatorClerkId: userId })
            .sort({ date: -1 })
            .lean();

        return buildOrganizedEventItems(events);
    } catch (error) {
        console.error("[getOrganizedEvents]", error);
        return [];
    }
});

// ─── getCoOrganizedEvents ──────────────────────────────────────────────────────

export const getCoOrganizedEvents = cache(async (): Promise<OrganizedEventItem[]> => {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        await connectToDatabase();

        const coOrganizerEntries = await CoOrganizer.find({ clerkId: userId })
            .select("eventId")
            .lean();

        if (!coOrganizerEntries.length) return [];

        const eventIds = coOrganizerEntries.map((entry) => entry.eventId);

        const events = await Event.find({
            _id: { $in: eventIds },
            creatorClerkId: { $ne: userId },
        })
            .sort({ date: -1 })
            .lean();

        return buildOrganizedEventItems(events);
    } catch (error) {
        console.error("[getCoOrganizedEvents]", error);
        return [];
    }
});

// ─── updateUserProfile ─────────────────────────────────────────────────────────

export const updateUserProfile = async (data: {
    firstName: string;
    lastName: string;
}) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        const client = await clerkClient();

        await Promise.all([
            client.users.updateUser(userId, {
                firstName: data.firstName,
                lastName: data.lastName,
            }),
            User.findOneAndUpdate({ clerkId: userId }, { $set: data }),
        ]);

        return { success: true };
    } catch (error) {
        console.error("[updateUserProfile]", error);
        return { success: false, error: "Failed to update profile." };
    }
};

// ─── updateUserSettings ───────────────────────────────────────────────────────

export const updateUserSettings = async (data: {
    publicMetadata: Record<string, unknown>;
}) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: data.publicMetadata,
        });

        return { success: true };
    } catch (error) {
        console.error("[updateUserSettings]", error);
        return { success: false, error: "Failed to save settings." };
    }
};
