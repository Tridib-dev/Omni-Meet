
// app/api/rooms/[eventId]/realtime/token/route.ts

import { NextResponse } from "next/server";
import { getRoomContext } from "@/lib/actions/room.discussion.actions";
import { createRoomRealtimeToken } from "@/lib/realtime/room-realtime";

type RouteParams = Promise<{ eventId?: string }>;

export async function GET(_request: Request, { params }: { params: RouteParams }) {
  try {
    const { eventId } = await params;
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json({ message: "Missing event id." }, { status: 400 });
    }

    const context = await getRoomContext(eventId.trim());
    if (!context.ok) {
      return NextResponse.json({ message: "Unauthorized or room not found." }, { status: 403 });
    }

    const token = createRoomRealtimeToken({
      eventId: eventId.trim(),
      roomId: context.roomId.toString(),
      clerkId: context.roomMember.clerkId,
      role: context.roomMember.role,
    });

    return NextResponse.json(
      {
        token,
        roomId: context.roomId.toString(),
        role: context.roomMember.role,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/rooms/[eventId]/realtime/token]", error);
    return NextResponse.json({ message: "Failed to issue realtime token." }, { status: 500 });
  }
}
