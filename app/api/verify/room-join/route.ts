// app/api/verify/room-join/route.ts

import { NextRequest, NextResponse } from "next/server";
import { autoCheckInOnRoomJoin } from "@/lib/actions/gate.actions";

type JoinRoomBody = {
  eventId?: string;
};

function getJoinRoomBody(payload: unknown): JoinRoomBody {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const body = payload as Partial<JoinRoomBody>;
  return {
    eventId: typeof body.eventId === "string" ? body.eventId : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = getJoinRoomBody(await request.json());
    const eventId = body.eventId?.trim() ?? "";

    if (!eventId) {
      return NextResponse.json({ success: false, reason: "invalid_request" }, { status: 400 });
    }

    const result = await autoCheckInOnRoomJoin(eventId);
    const status = result.success ? 200 : result.reason === "unauthorized" ? 401 : 200;

    return NextResponse.json(result, { status });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, reason: "invalid_request" }, { status: 400 });
    }

    console.error("[POST /api/verify/room-join]", error);
    return NextResponse.json({ success: false, reason: "server_error" }, { status: 500 });
  }
}
