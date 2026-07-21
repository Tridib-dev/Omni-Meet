// app/api/events/[eventId]/attandee/route.ts 

import { NextResponse } from "next/server";
import { getEventAttendees, isGateAuthorized } from "@/lib/actions/gate.actions";

type RouteParams = Promise<{ eventId?: string }>;
type RouteContext = { params: RouteParams };

export async function GET(
    _request: Request,
    { params }: RouteContext
): Promise<NextResponse> {
    try {
        const { eventId } = await params;

        if (typeof eventId !== "string" || !eventId.trim()) {
            return NextResponse.json({ message: "Missing eventId." }, { status: 400 });
        }

        const normalizedEventId = eventId.trim();
        const authorized = await isGateAuthorized(normalizedEventId);
        if (!authorized) {
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }

        const data = await getEventAttendees(normalizedEventId);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("[GET /api/events/[eventId]/attendees]", error);
        return NextResponse.json({ message: "Failed to fetch attendees." }, { status: 500 });
    }
}
