// app/api/verify/route.ts


import { NextRequest, NextResponse } from "next/server";
import { verifyTicket } from "@/lib/actions/gate.actions";

function getQueryValue(url: URL, keys: string[]): string {
    for (const key of keys) {
        const value = url.searchParams.get(key)?.trim();
        if (value) return value;
    }
    return "";
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const ticketId = getQueryValue(url, ["id", "ticketId"]);
        const eventId = getQueryValue(url, ["eventId"]);

        if (!ticketId || !eventId) {
            return NextResponse.json(
                { valid: false, reason: "not_found" },
                { status: 400 }
            );
        }

        const result = await verifyTicket(ticketId, eventId);
        const status = result.valid ? 200 : result.reason === "unauthorized" ? 401 : 200;

        return NextResponse.json(result, { status });
    } catch (error) {
        console.error("[GET /api/verify]", error);
        return NextResponse.json(
            { valid: false, reason: "not_found" },
            { status: 500 }
        );
    }
}
