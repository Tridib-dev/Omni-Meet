// app/api/rooms/[eventId]/join/route.ts
import { NextResponse } from "next/server";
import { joinRoom } from "@/lib/actions/room.actions";

type RouteParams = Promise<{ eventId?: string }>;

export async function POST(_request: Request, { params }: { params: RouteParams }) {
  try {
    const { eventId } = await params;
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json({ status: "denied", reason: "not_configured" }, { status: 400 });
    }

    const result = await joinRoom(eventId.trim());
    const status =
      result.status === "ok" ? 200 : result.reason === "unauthorized" ? 401 : result.reason === "server_error" ? 500 : 200;

    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("[POST /api/rooms/[eventId]/join]", error);
    return NextResponse.json({ status: "denied", reason: "server_error" }, { status: 500 });
  }
}
