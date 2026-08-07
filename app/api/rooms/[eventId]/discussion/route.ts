// app/api/rooms/[eventId]/discussion/route.ts
import { NextResponse } from "next/server";
import {
  addRoomMessage,
  addRoomUpdate,
  answerRoomQuestion,
  askRoomQuestion,
  getRoomDiscussion,
  toggleRoomVote,
} from "@/lib/actions/room.discussion.actions";

type RouteParams = Promise<{ eventId?: string }>;

type DiscussionBody =
  | { kind: "message"; body: string; clientMutationId?: string }
  | { kind: "update"; body: string; clientMutationId?: string }
  | { kind: "question"; body: string; clientMutationId?: string }
  | { kind: "answer"; questionId: string; body: string; clientMutationId?: string }
  | { kind: "vote"; targetKind: "message" | "question"; targetId: string; direction: "up" | "down" };

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseBody(payload: unknown): DiscussionBody | null {
  if (!payload || typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;
  const kind = readString(body.kind);
  const text = readString(body.body);
  const clientMutationId = readString(body.clientMutationId);

  if (kind === "message" || kind === "question" || kind === "update") {
    return text ? { kind, body: text, clientMutationId: clientMutationId ?? undefined } : null;
  }

  if (kind === "answer") {
    const questionId = readString(body.questionId);
    if (!questionId || !text) return null;
    return { kind, questionId, body: text, clientMutationId: clientMutationId ?? undefined };
  }

  if (kind === "vote") {
    const targetKind = readString(body.targetKind);
    const targetId = readString(body.targetId);
    const direction = readString(body.direction);
    if ((targetKind === "message" || targetKind === "question") && targetId && (direction === "up" || direction === "down")) {
      return { kind, targetKind, targetId, direction };
    }
  }

  return null;
}

export async function GET(_request: Request, { params }: { params: RouteParams }) {
  try {
    const { eventId } = await params;
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json({ message: "Missing event id." }, { status: 400 });
    }

    const discussion = await getRoomDiscussion(eventId.trim());
    if (!discussion) {
      return NextResponse.json({ message: "Unauthorized or room not found." }, { status: 403 });
    }

    return NextResponse.json(discussion, { status: 200 });
  } catch (error) {
    console.error("[GET /api/rooms/[eventId]/discussion]", error);
    return NextResponse.json({ message: "Failed to load discussion." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: RouteParams }) {
  try {
    const { eventId } = await params;
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json({ message: "Missing event id." }, { status: 400 });
    }

    const parsed = parseBody(await request.json());
    if (!parsed) {
      return NextResponse.json({ message: "Invalid discussion payload." }, { status: 400 });
    }

    if (parsed.kind === "message") {
      const result = await addRoomMessage(eventId.trim(), parsed.body, parsed.clientMutationId ?? "");
      if (!result.success) {
        return NextResponse.json({ message: "Unable to send message.", reason: result.reason }, { status: 400 });
      }

      return NextResponse.json(result, { status: 201 });
    }

    if (parsed.kind === "update") {
      const result = await addRoomUpdate(eventId.trim(), parsed.body, parsed.clientMutationId ?? "");
      if (!result.success) {
        const status = result.reason === "forbidden" ? 403 : 400;
        return NextResponse.json({ message: "Unable to post update.", reason: result.reason }, { status });
      }

      return NextResponse.json(result, { status: 201 });
    }

    if (parsed.kind === "question") {
      const result = await askRoomQuestion(eventId.trim(), parsed.body, parsed.clientMutationId ?? "");
      if (!result.success) {
        return NextResponse.json({ message: "Unable to ask question.", reason: result.reason }, { status: 400 });
      }

      return NextResponse.json(result, { status: 201 });
    }

    if (parsed.kind === "vote") {
      const result = await toggleRoomVote(eventId.trim(), parsed.targetKind, parsed.targetId, parsed.direction);
      if (!result.success) {
        const status = result.reason === "forbidden" ? 403 : result.reason === "not_found" ? 404 : 400;
        return NextResponse.json({ message: "Unable to save vote.", reason: result.reason }, { status });
      }

      return NextResponse.json(result, { status: 200 });
    }

    const result = await answerRoomQuestion(
      eventId.trim(),
      parsed.questionId,
      parsed.body,
      parsed.clientMutationId ?? ""
    );
    if (!result.success) {
      const status = result.reason === "forbidden" ? 403 : result.reason === "not_found" ? 404 : 400;
      return NextResponse.json({ message: "Unable to answer question.", reason: result.reason }, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[POST /api/rooms/[eventId]/discussion]", error);
    return NextResponse.json({ message: "Failed to save discussion item." }, { status: 500 });
  }
}
