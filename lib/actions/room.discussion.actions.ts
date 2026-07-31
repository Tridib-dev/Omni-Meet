// lib/actions/room.discussion.actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { isValidObjectId, type Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Room, RoomMember } from "@/database/Room.model";
import { RoomMessage, RoomQuestion } from "@/database/room-discussion.model";
import { User } from "@/database/User.model";
import type { RoomMemberRole } from "@/database/Room.model";
import * as roomRealtime from "@/lib/realtime/room-realtime";

export interface RoomDiscussionMessageItem {
  id: string;
  body: string;
  authorName: string;
  authorRole: RoomMemberRole;
  createdAt: string;
}

export interface RoomDiscussionQuestionItem {
  id: string;
  body: string;
  authorName: string;
  authorRole: RoomMemberRole;
  createdAt: string;
  answered: boolean;
  answerBody?: string;
  answeredAt?: string;
  answeredByClerkId?: string;
}

export interface RoomDiscussionPayload {
  messages: RoomDiscussionMessageItem[];
  questions: RoomDiscussionQuestionItem[];
  role: RoomMemberRole;
}

export type RoomDiscussionMutationResult =
  | { success: true; message: RoomDiscussionMessageItem }
  | { success: true; question: RoomDiscussionQuestionItem }
  | { success: true; roomQuestion: RoomDiscussionQuestionItem }
  | { success: false; reason: "not_found" | "unauthorized" | "forbidden" | "invalid_input" | "server_error" };

type RoomMemberDoc = {
  roomId: Types.ObjectId;
  clerkId: string;
  role: RoomMemberRole;
  leftAt?: Date | null;
  bannedAt?: Date | null;
};

type UserDoc = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

function normalizeText(value: string, maxLength: number) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

async function resolveDisplayName(clerkId: string): Promise<string> {
  const user = await User.findOne({ clerkId }).select("firstName lastName username").lean<UserDoc | null>();
  if (!user) return clerkId;

  const name = [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean).join(" ").trim();
  return name || user.username?.trim() || clerkId;
}

export async function getRoomContext(eventId: string): Promise<
  | { ok: true; roomId: Types.ObjectId; roomMember: RoomMemberDoc }
  | { ok: false; reason: "not_found" | "unauthorized" }
> {
  if (!isValidObjectId(eventId)) return { ok: false, reason: "not_found" };

  const { userId: clerkId } = await auth();
  if (!clerkId) return { ok: false, reason: "unauthorized" };

  await connectToDatabase();

  const room = await Room.findOne({ eventId }).select("_id").lean<{ _id: Types.ObjectId } | null>();
  if (!room) return { ok: false, reason: "not_found" };

  const roomMember = await RoomMember.findOne({ roomId: room._id, clerkId }).lean<RoomMemberDoc | null>();
  if (!roomMember || roomMember.bannedAt || roomMember.leftAt) {
    return { ok: false, reason: "unauthorized" };
  }

  return { ok: true, roomId: room._id, roomMember };
}

function toMessageItem(doc: {
  _id: Types.ObjectId;
  body: string;
  authorName: string;
  authorRole: RoomMemberRole;
  createdAt: Date;
}): RoomDiscussionMessageItem {
  return {
    id: doc._id.toString(),
    body: doc.body,
    authorName: doc.authorName,
    authorRole: doc.authorRole,
    createdAt: doc.createdAt.toISOString(),
  };
}

function toQuestionItem(doc: {
  _id: Types.ObjectId;
  body: string;
  authorName: string;
  authorRole: RoomMemberRole;
  createdAt: Date;
  answered: boolean;
  answerBody?: string;
  answeredAt?: Date;
  answeredByClerkId?: string;
}): RoomDiscussionQuestionItem {
  return {
    id: doc._id.toString(),
    body: doc.body,
    authorName: doc.authorName,
    authorRole: doc.authorRole,
    createdAt: doc.createdAt.toISOString(),
    answered: doc.answered,
    answerBody: doc.answerBody,
    answeredAt: doc.answeredAt?.toISOString(),
    answeredByClerkId: doc.answeredByClerkId,
  };
}

export async function getRoomDiscussion(eventId: string): Promise<RoomDiscussionPayload | null> {
  try {
    const context = await getRoomContext(eventId);
    if (!context.ok) return null;

    const [messages, questions] = await Promise.all([
      RoomMessage.find({ roomId: context.roomId }).sort({ createdAt: 1 }).limit(50).lean(),
      RoomQuestion.find({ roomId: context.roomId }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    return {
      messages: (messages as Array<Parameters<typeof toMessageItem>[0]>).map(toMessageItem),
      questions: (questions as Array<Parameters<typeof toQuestionItem>[0]>).map(toQuestionItem),
      role: context.roomMember.role,
    };
  } catch (error) {
    console.error("[getRoomDiscussion]", error);
    return null;
  }
}

export async function addRoomMessage(
  eventId: string,
  body: string,
  clientMessageId: string
): Promise<RoomDiscussionMutationResult> {
  try {
    const context = await getRoomContext(eventId);
    if (!context.ok) return { success: false, reason: context.reason };

    const normalizedBody = normalizeText(body, 500);
    const normalizedClientId = normalizeText(clientMessageId, 120);
    if (!normalizedBody || !normalizedClientId) return { success: false, reason: "invalid_input" };

    const authorName = await resolveDisplayName(context.roomMember.clerkId);

    const doc = await RoomMessage.findOneAndUpdate(
      { roomId: context.roomId, clientMessageId: normalizedClientId },
      {
        $setOnInsert: {
          roomId: context.roomId,
          clerkId: context.roomMember.clerkId,
          authorName,
          authorRole: context.roomMember.role,
          body: normalizedBody,
          clientMessageId: normalizedClientId,
        },
      },
      { upsert: true, returnDocument: "after" }
    ).lean();

    if (!doc) return { success: false, reason: "server_error" };
    roomRealtime.broadcastRoomDiscussionUpdate(context.roomId.toString(), {
      eventId,
      kind: "message",
    });
    return { success: true, message: toMessageItem(doc as Parameters<typeof toMessageItem>[0]) };
  } catch (error) {
    console.error("[addRoomMessage]", error);
    return { success: false, reason: "server_error" };
  }
}

export async function askRoomQuestion(
  eventId: string,
  body: string,
  clientQuestionId: string
): Promise<RoomDiscussionMutationResult> {
  try {
    const context = await getRoomContext(eventId);
    if (!context.ok) return { success: false, reason: context.reason };

    const normalizedBody = normalizeText(body, 500);
    const normalizedClientId = normalizeText(clientQuestionId, 120);
    if (!normalizedBody || !normalizedClientId) return { success: false, reason: "invalid_input" };

    const authorName = await resolveDisplayName(context.roomMember.clerkId);

    const doc = await RoomQuestion.findOneAndUpdate(
      { roomId: context.roomId, clientQuestionId: normalizedClientId },
      {
        $setOnInsert: {
          roomId: context.roomId,
          clerkId: context.roomMember.clerkId,
          authorName,
          authorRole: context.roomMember.role,
          body: normalizedBody,
          clientQuestionId: normalizedClientId,
          answered: false,
        },
      },
      { upsert: true, returnDocument: "after" }
    ).lean();

    if (!doc) return { success: false, reason: "server_error" };
    roomRealtime.broadcastRoomDiscussionUpdate(context.roomId.toString(), {
      eventId,
      kind: "question",
    });
    return { success: true, question: toQuestionItem(doc as Parameters<typeof toQuestionItem>[0]) };
  } catch (error) {
    console.error("[askRoomQuestion]", error);
    return { success: false, reason: "server_error" };
  }
}

export async function answerRoomQuestion(
  eventId: string,
  questionId: string,
  answerBody: string,
  clientAnswerId: string
): Promise<RoomDiscussionMutationResult> {
  try {
    const context = await getRoomContext(eventId);
    if (!context.ok) return { success: false, reason: context.reason };
    if (!["organizer", "co-organizer"].includes(context.roomMember.role)) {
      return { success: false, reason: "forbidden" };
    }

    const normalizedAnswer = normalizeText(answerBody, 1000);
    const normalizedClientId = normalizeText(clientAnswerId, 120);
    if (!isValidObjectId(questionId) || !normalizedAnswer || !normalizedClientId) {
      return { success: false, reason: "invalid_input" };
    }

    const updated = await RoomQuestion.findOneAndUpdate(
      { _id: questionId, roomId: context.roomId },
      {
        $set: {
          answered: true,
          answerBody: normalizedAnswer,
          answeredByClerkId: context.roomMember.clerkId,
          answeredAt: new Date(),
          clientAnswerId: normalizedClientId,
        },
      },
      { returnDocument: "after" }
    ).lean();

    if (!updated) return { success: false, reason: "not_found" };
    roomRealtime.broadcastRoomDiscussionUpdate(context.roomId.toString(), {
      eventId,
      kind: "answer",
      questionId,
    });
    return { success: true, roomQuestion: toQuestionItem(updated as Parameters<typeof toQuestionItem>[0]) };
  } catch (error) {
    console.error("[answerRoomQuestion]", error);
    return { success: false, reason: "server_error" };
  }
}
