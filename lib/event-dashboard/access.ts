"use server";

import { auth } from "@clerk/nextjs/server";
import { forbidden, notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { CoOrganizer } from "@/database/coOrganizer.model";
import { isGateAuthorized } from "@/lib/actions/gate.actions";
import { isEventCreator } from "@/lib/actions/event.actions";
import {
    getCoOrganizedEvents,
    getOrganizedEvents,
    type OrganizedEventItem,
} from "@/lib/actions/dashboard.actions";
import {
    normalizeEventMode,
    type NormalizedEventMode,
} from "@/lib/event-dashboard/mode";

export type EventDashboardRole = "creator" | "co-organizer";

export interface AccessibleDashboardEvent extends OrganizedEventItem {
    role: EventDashboardRole;
}

export interface EventDashboardContext {
    eventId: string;
    title: string;
    slug: string;
    image: string;
    category: string;
    date: string;
    time: string;
    location: string;
    mode: string;
    normalizedMode: NormalizedEventMode;
    role: EventDashboardRole;
    isCreator: boolean;
}

export async function getAccessibleDashboardEvents(): Promise<AccessibleDashboardEvent[]> {
    const [organized, coOrganized] = await Promise.all([
        getOrganizedEvents(),
        getCoOrganizedEvents(),
    ]);

    const merged = new Map<string, AccessibleDashboardEvent>();

    for (const event of organized) {
        merged.set(event.id, { ...event, role: "creator" });
    }

    for (const event of coOrganized) {
        if (!merged.has(event.id)) {
            merged.set(event.id, { ...event, role: "co-organizer" });
        }
    }

    return Array.from(merged.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export async function assertEventDashboardAccess(eventId: string): Promise<EventDashboardContext> {
    const context = await getEventDashboardContext(eventId);
    if (!context) notFound();
    return context;
}

export async function getEventDashboardContext(
    eventId: string
): Promise<EventDashboardContext | null> {
    if (!isValidObjectId(eventId)) return null;

    const { userId } = await auth();
    if (!userId) return null;

    const authorized = await isGateAuthorized(eventId);
    if (!authorized) return null;

    await connectToDatabase();

    const event = await Event.findById(eventId)
        .select("title slug image category date time location mode creatorClerkId")
        .lean<{
            _id: { toString(): string };
            title: string;
            slug: string;
            image: string;
            category: string;
            date: string;
            time: string;
            location: string;
            mode: string;
            creatorClerkId: string;
        }>();

    if (!event) return null;

    const creator = event.creatorClerkId === userId;
    const coOrganizer = !creator
        ? Boolean(await CoOrganizer.exists({ eventId, clerkId: userId }))
        : false;

    if (!creator && !coOrganizer) return null;

    const normalizedMode = normalizeEventMode(event.mode);

    return {
        eventId: event._id.toString(),
        title: event.title,
        slug: event.slug,
        image: event.image,
        category: event.category,
        date: event.date,
        time: event.time,
        location: event.location,
        mode: event.mode,
        normalizedMode,
        role: creator ? "creator" : "co-organizer",
        isCreator: creator,
    };
}

export async function requireEventDashboardAccess(eventId: string): Promise<EventDashboardContext> {
    const context = await getEventDashboardContext(eventId);
    if (!context) forbidden();
    return context;
}

export async function requireEventCreator(eventId: string): Promise<EventDashboardContext> {
    const context = await requireEventDashboardAccess(eventId);
    if (!(await isEventCreator(eventId))) forbidden();
    return context;
}
