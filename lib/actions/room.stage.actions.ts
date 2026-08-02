"use server";

import { randomUUID } from "node:crypto";
import { RoomMember, type RoomMemberRole } from "@/database/Room.model";
import * as roomRealtime from "@/lib/realtime/room-realtime";
import { getRoomContext, resolveDisplayName } from "@/lib/actions/room.discussion.actions";

const ALLOWED_STAGE_EMOJIS = new Set(["👍", "❤️", "🎉", "😂", "🙌"]);

export interface RoomStageEventResult {
  success: true;
  event: {
    id: string;
    kind: "emoji" | "hand";
    emoji?: string;
    displayName: string;
    role: RoomMemberRole;
    createdAt: string;
    isRaised?: boolean;
    participantId?: string;
  };
}

export async function sendRoomStageEvent(
  eventId: string,
  payload: { kind: "emoji" | "hand"; emoji?: string; clientEventId?: string; isRaised?: boolean; participantId?: string }
): Promise<RoomStageEventResult | { success: false; reason: "not_found" | "unauthorized" | "invalid_input" | "server_error" }> {
  try {
    const context = await getRoomContext(eventId);
    if (!context.ok) return { success: false, reason: context.reason };

    if (payload.kind !== "emoji" && payload.kind !== "hand") {
      return { success: false, reason: "invalid_input" };
    }

    let emoji: string | undefined;
    if (payload.kind === "emoji") {
      const candidate = typeof payload.emoji === "string" ? payload.emoji.trim() : "";
      if (!candidate || candidate.length > 12 || !ALLOWED_STAGE_EMOJIS.has(candidate)) {
        return { success: false, reason: "invalid_input" };
      }
      emoji = candidate;
    }

    let isRaised: boolean | undefined;
    let participantId: string | undefined;
    if (payload.kind === "hand") {
      isRaised = typeof payload.isRaised === "boolean" ? payload.isRaised : true;
      participantId = typeof payload.participantId === "string" && payload.participantId.trim()
        ? payload.participantId.trim()
        : undefined;

      await RoomMember.updateOne(
        { roomId: context.roomId, clerkId: context.roomMember.clerkId },
        { $set: { handRaised: isRaised } }
      );
    }

    const displayName = await resolveDisplayName(context.roomMember.clerkId);
    const id = typeof payload.clientEventId === "string" && payload.clientEventId.trim()
      ? payload.clientEventId.trim()
      : randomUUID();

    const event = {
      id,
      kind: payload.kind,
      emoji,
      displayName,
      role: context.roomMember.role,
      createdAt: new Date().toISOString(),
      isRaised,
      participantId,
    } as const;

    roomRealtime.broadcastRoomStageEvent(context.roomId.toString(), {
      eventId,
      ...event,
    });

    return { success: true, event };
  } catch (error) {
    console.error("[sendRoomStageEvent]", error);
    return { success: false, reason: "server_error" };
  }
}
