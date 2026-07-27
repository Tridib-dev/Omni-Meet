// app/api/rooms/[eventId]/leave/route.ts
import { NextResponse } from "next/server";
import { leaveRoom } from "@/lib/actions/room.actions";

type RouteParams = Promise<{ eventId?: string }>;

export async function POST(_request: Request, { params }: { params: RouteParams }) {
  try {
    const { eventId } = await params;
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    const result = await leaveRoom(eventId.trim());
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (error) {
    console.error("[POST /api/rooms/[eventId]/leave]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}