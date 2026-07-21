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

function getCheckInBody(payload: unknown): CheckInBody {
    if (!payload || typeof payload !== "object") {
        return {};
    }

    const body = payload as Partial<CheckInBody>;
    return {
        ticketId: typeof body.ticketId === "string" ? body.ticketId : undefined,
        ticketType: isTicketType(body.ticketType) ? body.ticketType : undefined,
        eventId: typeof body.eventId === "string" ? body.eventId : undefined,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = getCheckInBody(await request.json());
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
            { success: false, reason: "server_error" },
            { status: 500 }
        );
    }
}
