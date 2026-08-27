"use server";

import { cache } from "react";
import { isValidObjectId } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database/booking.model";
import { Order } from "@/database/Order.model";
import { Event } from "@/database/event.model";
import { isGateAuthorized } from "@/lib/actions/gate.actions";
import { paiseToRupees } from "@/lib/payments/money";
import { getCoOrganizerCount, getEventActivityFeed } from "@/lib/event-dashboard/activity";
import { normalizeEventMode } from "@/lib/event-dashboard/mode";

export interface DailyApplicationPoint {
    day: string;
    applications: number;
}

export interface EventOverviewMetric {
    label: string;
    value: string;
    sub?: string;
}

export interface EventOverviewData {
    event: {
        id: string;
        title: string;
        slug: string;
        category: string;
        date: string;
        time: string;
        image: string;
        mode: string;
        normalizedMode: ReturnType<typeof normalizeEventMode>;
    } | null;
    applicantCount: number;
    analyticsScore: number;
    coOrganizerCount: number;
    checkinRate: number;
    totalRevenue: number;
    todaySignups: number;
    dailyApplications: DailyApplicationPoint[];
    keyMetrics: EventOverviewMetric[];
    recentActivity: Awaited<ReturnType<typeof getEventActivityFeed>>["items"];
}

function dayKey(date: Date): string {
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function computeAnalyticsScore(input: {
    checkinRate: number;
    last7: number;
    prior7: number;
    isPaid: boolean;
    revenueRatio: number;
    coOrganizerCount: number;
}): number {
    const velocity =
        input.prior7 === 0
            ? input.last7 > 0
                ? 100
                : 40
            : Math.min(100, Math.round((input.last7 / input.prior7) * 50 + 50));

    const checkinComponent = Math.round(input.checkinRate * 0.35);
    const velocityComponent = Math.round(velocity * 0.25);
    const revenueComponent = input.isPaid ? Math.round(input.revenueRatio * 20) : 15;
    const committeeComponent = Math.min(20, input.coOrganizerCount * 5);

    return Math.min(
        100,
        Math.max(0, checkinComponent + velocityComponent + revenueComponent + committeeComponent)
    );
}

function buildDailySeries(
    createdAt: Date,
    eventDate: Date,
    entries: { createdAt: Date | string }[]
): DailyApplicationPoint[] {
    const start = new Date(createdAt);
    start.setHours(0, 0, 0, 0);
    const end = new Date(eventDate);
    end.setHours(23, 59, 59, 999);
    const today = new Date();
    const cappedEnd = end.getTime() > today.getTime() ? today : end;

    const map = new Map<string, number>();
    const points: DailyApplicationPoint[] = [];

    for (let cursor = new Date(start); cursor <= cappedEnd; cursor.setDate(cursor.getDate() + 1)) {
        const key = dayKey(cursor);
        map.set(key, 0);
        points.push({ day: key, applications: 0 });
    }

    for (const entry of entries) {
        const key = dayKey(new Date(entry.createdAt));
        if (map.has(key)) {
            map.set(key, (map.get(key) ?? 0) + 1);
        }
    }

    return points.map((point) => ({
        day: point.day,
        applications: map.get(point.day) ?? 0,
    }));
}

export const getEventOverview = cache(async (eventId: string): Promise<EventOverviewData> => {
    const empty: EventOverviewData = {
        event: null,
        applicantCount: 0,
        analyticsScore: 0,
        coOrganizerCount: 0,
        checkinRate: 0,
        totalRevenue: 0,
        todaySignups: 0,
        dailyApplications: [],
        keyMetrics: [],
        recentActivity: [],
    };

    if (!isValidObjectId(eventId)) return empty;

    const authorized = await isGateAuthorized(eventId);
    if (!authorized) return empty;

    await connectToDatabase();

    const event = await Event.findById(eventId).lean<{
        _id: { toString(): string };
        title: string;
        slug: string;
        category: string;
        date: string;
        time: string;
        image: string;
        mode: string;
        price?: number;
        createdAt: Date;
    }>();

    if (!event) return empty;

    const [bookings, orders, coOrganizerCount, activityFeed] = await Promise.all([
        Booking.find({ eventId }).sort({ createdAt: -1 }).lean(),
        Order.find({ eventId, status: "paid" }).sort({ createdAt: -1 }).lean(),
        getCoOrganizerCount(eventId),
        getEventActivityFeed(eventId, 8),
    ]);

    const totalApplicants = bookings.length + orders.length;
    const checkedInCount = bookings.filter((b) => b.checkedIn).length;
    const checkinRate =
        totalApplicants > 0 ? Math.round((checkedInCount / totalApplicants) * 100) : 0;
    const totalRevenuePaise = orders.reduce((sum, order) => sum + (order.amount ?? 0), 0);
    const totalRevenue = paiseToRupees(totalRevenuePaise);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Start = new Date(todayStart);
    last7Start.setDate(last7Start.getDate() - 7);
    const prior7Start = new Date(last7Start);
    prior7Start.setDate(prior7Start.getDate() - 7);

    const allEntries = [...bookings, ...orders];
    const todaySignups = allEntries.filter((e) => new Date(e.createdAt) >= todayStart).length;
    const last7 = allEntries.filter((e) => new Date(e.createdAt) >= last7Start).length;
    const prior7 = allEntries.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= prior7Start && d < last7Start;
    }).length;

    const isPaid = (event.price ?? 0) > 0;
    const revenueRatio = isPaid && totalApplicants > 0 ? Math.min(1, orders.length / totalApplicants) : 0;

    const analyticsScore = computeAnalyticsScore({
        checkinRate,
        last7,
        prior7,
        isPaid,
        revenueRatio,
        coOrganizerCount,
    });

    const dailyApplications = buildDailySeries(
        event.createdAt ?? new Date(event.date),
        new Date(event.date),
        allEntries
    );

    const normalizedMode = normalizeEventMode(event.mode);

    return {
        event: {
            id: event._id.toString(),
            title: event.title,
            slug: event.slug,
            category: event.category,
            date: event.date,
            time: event.time,
            image: event.image,
            mode: event.mode,
            normalizedMode,
        },
        applicantCount: totalApplicants,
        analyticsScore,
        coOrganizerCount,
        checkinRate,
        totalRevenue,
        todaySignups,
        dailyApplications,
        keyMetrics: [
            { label: "Check-in rate", value: `${checkinRate}%`, sub: "Of all registrations" },
            { label: "Today's signups", value: todaySignups.toString(), sub: "New applications today" },
            {
                label: "Revenue",
                value: totalRevenue > 0 ? `₹${totalRevenue.toLocaleString("en-IN")}` : "Free",
                sub: `${orders.length} paid orders`,
            },
            {
                label: "Free vs paid",
                value: `${bookings.length} / ${orders.length}`,
                sub: "Free registrations / paid",
            },
        ],
        recentActivity: activityFeed.items,
    };
});
