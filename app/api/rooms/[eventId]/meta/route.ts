import { NextResponse } from "next/server";
import { getRoomPublicMeta } from "@/lib/actions/room.actions";

type RouteParams = Promise<{ eventId?: string }>;

export async function GET(_request: Request, { params }: { params: RouteParams }) {
  try {
    const { eventId } = await params;
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json({ message: "Missing event id." }, { status: 400 });
    }

    const meta = await getRoomPublicMeta(eventId.trim());
    if (!meta) {
      return NextResponse.json({ message: "Room not found." }, { status: 404 });
    }

    return NextResponse.json(meta, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("[GET /api/rooms/[eventId]/meta]", error);
    return NextResponse.json({ message: "Failed to load room meta." }, { status: 500 });
  }
}
