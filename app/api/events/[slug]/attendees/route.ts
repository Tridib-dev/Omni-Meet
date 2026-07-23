// app/api/events/[slug]/attendees/route.ts

import { NextResponse } from "next/server";

import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { getEventAttendees, isGateAuthorized } from "@/lib/actions/gate.actions";

type RouteParams = Promise<{ slug?: string }>;
type RouteContext = { params: RouteParams };

export async function GET(
    _request: Request,
    { params }: RouteContext
): Promise<NextResponse> {
    try {
        const { slug } = await params;

        if (typeof slug !== "string" || !slug.trim()) {
            return NextResponse.json({ message: "Missing event slug." }, { status: 400 });
        }

        const normalizedSlug = slug.trim().toLowerCase();

        await connectToDatabase();

        const event = await Event.findOne({ slug: normalizedSlug }).select("_id").lean<{ _id: { toString(): string } } | null>();
        if (!event) {
            return NextResponse.json({ message: "Event not found." }, { status: 404 });
        }

        const eventId = event._id.toString();
        const authorized = await isGateAuthorized(eventId);
        if (!authorized) {
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }

        const data = await getEventAttendees(eventId);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("[GET /api/events/[slug]/attendees]", error);
        return NextResponse.json({ message: "Failed to fetch attendees." }, { status: 500 });
    }
}
