// lib/actions/room.discussion.actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { isValidObjectId, type Types } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Room, RoomMember } from "@/database/Room.model";
import { RoomMessage, RoomQuestion, RoomReaction } from "@/database/room-discussion.model";
import { User } from "@/database/User.model";
import type { RoomMemberRole } from "@/database/Room.model";
import * as roomRealtime from "@/lib/realtime/room-realtime";

export interface RoomDiscussionMessageItem {
  id: string;
  body: string;
  authorName: string;
  authorRole: RoomMemberRole;
  createdAt: string;
  reactions: RoomReactionSummaryItem[];
  myReactions: string[];
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
  reactions: RoomReactionSummaryItem[];
  myReactions: string[];
}

export interface RoomDiscussionPayload {
  messages: RoomDiscussionMessageItem[];
  questions: RoomDiscussionQuestionItem[];
  role: RoomMemberRole;
}

export interface RoomReactionSummaryItem {
  emoji: string;
  count: number;
}

export type RoomDiscussionMutationResult =
  | { success: true; message: RoomDiscussionMessageItem }
  | { success: true; question: RoomDiscussionQuestionItem }
  | { success: true; roomQuestion: RoomDiscussionQuestionItem }
  | { success: true; reaction: { targetKind: "message" | "question"; targetId: string; emoji: string; active: boolean } }
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

type RoomReactionDoc = {
  targetKind: "message" | "question";
  targetId: Types.ObjectId;
  clerkId: string;
  emoji: string;
};

const ALLOWED_REACTIONS = new Set(["👍", "❤️", "🎉", "😂", "🙌"]);

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

function normalizeEmoji(value: string) {
  const emoji = value.trim();
  if (!emoji || emoji.length > 12 || !ALLOWED_REACTIONS.has(emoji)) {
    return null;
  }
  return emoji;
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
}, reactions: RoomReactionSummaryItem[] = [], myReactions: string[] = []): RoomDiscussionMessageItem {
  return {
    id: doc._id.toString(),
    body: doc.body,
    authorName: doc.authorName,
    authorRole: doc.authorRole,
    createdAt: doc.createdAt.toISOString(),
    reactions,
    myReactions,
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
}, reactions: RoomReactionSummaryItem[] = [], myReactions: string[] = []): RoomDiscussionQuestionItem {
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
    reactions,
    myReactions,
  };
}

function buildReactionState(reactions: RoomReactionDoc[], currentClerkId: string) {
  const byTarget = new Map<string, Map<string, Set<string>>>();
  const myByTarget = new Map<string, Set<string>>();

  for (const reaction of reactions) {
    const key = `${reaction.targetKind}:${reaction.targetId.toString()}`;
    let emojiMap = byTarget.get(key);
    if (!emojiMap) {
      emojiMap = new Map();
      byTarget.set(key, emojiMap);
    }

    let users = emojiMap.get(reaction.emoji);
    if (!users) {
      users = new Set();
      emojiMap.set(reaction.emoji, users);
    }
    users.add(reaction.clerkId);

    if (reaction.clerkId === currentClerkId) {
      let mySet = myByTarget.get(key);
      if (!mySet) {
        mySet = new Set();
        myByTarget.set(key, mySet);
      }
      mySet.add(reaction.emoji);
    }
  }

  return {
    reactionsFor(targetKind: "message" | "question", targetId: Types.ObjectId) {
      const key = `${targetKind}:${targetId.toString()}`;
      const emojiMap = byTarget.get(key);
      if (!emojiMap) return [] as RoomReactionSummaryItem[];

      return [...emojiMap.entries()]
        .map(([emoji, users]) => ({ emoji, count: users.size }))
        .sort((a, b) => b.count - a.count || a.emoji.localeCompare(b.emoji));
    },
    myReactionsFor(targetKind: "message" | "question", targetId: Types.ObjectId) {
      const key = `${targetKind}:${targetId.toString()}`;
      return [...(myByTarget.get(key) ?? new Set<string>())];
    },
  };
}

export async function getRoomDiscussion(eventId: string): Promise<RoomDiscussionPayload | null> {
  try {
    const context = await getRoomContext(eventId);
    if (!context.ok) return null;

    const [messages, questions, reactions] = await Promise.all([
      RoomMessage.find({ roomId: context.roomId }).sort({ createdAt: 1 }).limit(50).lean(),
      RoomQuestion.find({ roomId: context.roomId }).sort({ createdAt: -1 }).limit(50).lean(),
      RoomReaction.find({ roomId: context.roomId }).lean(),
    ]);

    const reactionState = buildReactionState(reactions as RoomReactionDoc[], context.roomMember.clerkId);

    return {
      messages: (messages as Array<Parameters<typeof toMessageItem>[0]>).map((item) =>
        toMessageItem(item, reactionState.reactionsFor("message", item._id), reactionState.myReactionsFor("message", item._id))
      ),
      questions: (questions as Array<Parameters<typeof toQuestionItem>[0]>).map((item) =>
        toQuestionItem(
          item,
          reactionState.reactionsFor("question", item._id),
          reactionState.myReactionsFor("question", item._id)
        )
      ),
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

export async function toggleRoomReaction(
  eventId: string,
  targetKind: "message" | "question",
  targetId: string,
  emojiValue: string
): Promise<RoomDiscussionMutationResult> {
  try {
    const context = await getRoomContext(eventId);
    if (!context.ok) return { success: false, reason: context.reason };

    if (!isValidObjectId(targetId)) return { success: false, reason: "invalid_input" };
    const emoji = normalizeEmoji(emojiValue);
    if (!emoji) return { success: false, reason: "invalid_input" };

    const model = targetKind === "message" ? RoomMessage : RoomQuestion;
    const targetDoc = await model.findOne({ _id: targetId, roomId: context.roomId }).select("_id").lean();
    if (!targetDoc) return { success: false, reason: "not_found" };

    const filter = {
      roomId: context.roomId,
      targetKind,
      targetId,
      clerkId: context.roomMember.clerkId,
      emoji,
    } as const;

    const existing = await RoomReaction.findOne(filter).select("_id").lean();
    let active = false;

    if (existing) {
      await RoomReaction.deleteOne(filter);
    } else {
      await RoomReaction.create(filter);
      active = true;
    }

    roomRealtime.broadcastRoomDiscussionUpdate(context.roomId.toString(), {
      eventId,
      kind: "reaction",
      targetKind,
      targetId,
      emoji,
      active,
    });

    return { success: true, reaction: { targetKind, targetId, emoji, active } };
  } catch (error) {
    console.error("[toggleRoomReaction]", error);
    return { success: false, reason: "server_error" };
  }
}
