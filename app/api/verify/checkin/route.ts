// app/api/verify/checkin/route.ts

import { NextRequest, NextResponse } from "next/server";
import { checkInTicket, type TicketType } from "@/lib/actions/gate.actions";

type CheckInBody = {
    ticketId?: string;
    ticketType?: TicketType;
    eventId?: string;
};

const isTicketType = (value: unknown): value is TicketType =>
    value === "booking" || value === "order";

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as CheckInBody;
        const ticketId = body.ticketId?.trim() ?? "";
        const eventId = body.eventId?.trim() ?? "";
        const ticketType = body.ticketType;

        if (!ticketId || !eventId || !isTicketType(ticketType)) {
            return NextResponse.json(
                { success: false, reason: "invalid_request" },
                { status: 400 }
            );
        }

        const result = await checkInTicket(ticketId, ticketType, eventId);
        const status = result.success ? 200 : result.reason === "unauthorized" ? 401 : 200;

        return NextResponse.json(result, { status });
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { success: false, reason: "invalid_request" },
                { status: 400 }
            );
        }

        console.error("[POST /api/verify/checkin]", error);
        return NextResponse.json(
            { success: false, reason: "not_found" },
            { status: 500 }
        );
    }
}
