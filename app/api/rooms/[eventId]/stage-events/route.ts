import { NextResponse } from "next/server";
import { sendRoomStageEvent } from "@/lib/actions/room.stage.actions";

type RouteParams = Promise<{ eventId?: string }>;

type StageEventBody = { kind: "emoji" | "hand"; emoji?: string; clientEventId?: string; isRaised?: boolean; participantId?: string };

function parseBody(payload: unknown): StageEventBody | null {
  if (!payload || typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;
  const kind = typeof body.kind === "string" ? body.kind : null;
  const emoji = typeof body.emoji === "string" ? body.emoji : undefined;
  const clientEventId = typeof body.clientEventId === "string" ? body.clientEventId : undefined;
  const isRaised = typeof body.isRaised === "boolean" ? body.isRaised : undefined;
  const participantId = typeof body.participantId === "string" ? body.participantId : undefined;

  if (kind === "emoji" || kind === "hand") {
    return { kind, emoji, clientEventId, isRaised, participantId };
  }

  return null;
}

export async function POST(request: Request, { params }: { params: RouteParams }) {
  try {
    const { eventId } = await params;
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json({ message: "Missing event id." }, { status: 400 });
    }

    const parsed = parseBody(await request.json());
    if (!parsed) {
      return NextResponse.json({ message: "Invalid stage event payload." }, { status: 400 });
    }

    const result = await sendRoomStageEvent(eventId.trim(), parsed);
    if (!result.success) {
      const status = result.reason === "unauthorized" ? 403 : result.reason === "not_found" ? 404 : 400;
      return NextResponse.json({ message: "Unable to send stage event.", reason: result.reason }, { status });
    }

    return NextResponse.json(result, {
      status: 201,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("[POST /api/rooms/[eventId]/stage-events]", error);
    return NextResponse.json({ message: "Failed to send stage event." }, { status: 500 });
  }
}
