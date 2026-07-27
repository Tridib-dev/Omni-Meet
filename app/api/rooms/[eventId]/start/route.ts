// app/api/rooms/[eventId]/start/route.ts
import { NextResponse } from "next/server";
import { startRoom } from "@/lib/actions/room.actions";

type RouteParams = Promise<{ eventId?: string }>;

export async function POST(_request: Request, { params }: { params: RouteParams }) {
  try {
    const { eventId } = await params;
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json({ success: false, reason: "not_found" }, { status: 400 });
    }

    const result = await startRoom(eventId.trim());
    const status = result.success ? 200 : result.reason === "unauthorized" ? 401 : 404;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("[POST /api/rooms/[eventId]/start]", error);
    return NextResponse.json({ success: false, reason: "server_error" }, { status: 500 });
  }
}
