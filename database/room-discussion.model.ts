// database/room-discussion.model.ts

import { Schema, model, models, type Document, Types } from "mongoose";
import type { RoomMemberRole } from "./Room.model";

export interface IRoomMessage extends Document {
  roomId: Types.ObjectId;
  clerkId: string;
  authorName: string;
  authorRole: RoomMemberRole;
  body: string;
  clientMessageId: string;
  createdAt: Date;
  updatedAt: Date;
}

const roomMessageSchema = new Schema<IRoomMessage>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    clerkId: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    authorRole: {
      type: String,
      enum: ["organizer", "co-organizer", "attendee"],
      required: true,
      default: "attendee",
    },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    clientMessageId: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

roomMessageSchema.index({ roomId: 1, clientMessageId: 1 }, { unique: true });
roomMessageSchema.index({ roomId: 1, createdAt: -1 });

export interface IRoomQuestion extends Document {
  roomId: Types.ObjectId;
  clerkId: string;
  authorName: string;
  authorRole: RoomMemberRole;
  body: string;
  clientQuestionId: string;
  answered: boolean;
  answerBody?: string;
  answeredByClerkId?: string;
  clientAnswerId?: string;
  answeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const roomQuestionSchema = new Schema<IRoomQuestion>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    clerkId: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    authorRole: {
      type: String,
      enum: ["organizer", "co-organizer", "attendee"],
      required: true,
      default: "attendee",
    },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    clientQuestionId: { type: String, required: true, trim: true },
    answered: { type: Boolean, default: false },
    answerBody: { type: String, trim: true, maxlength: 1000 },
    answeredByClerkId: { type: String, trim: true },
    clientAnswerId: { type: String, trim: true },
    answeredAt: { type: Date },
  },
  { timestamps: true }
);

roomQuestionSchema.index({ roomId: 1, clientQuestionId: 1 }, { unique: true });
roomQuestionSchema.index({ roomId: 1, answered: 1, createdAt: -1 });

export const RoomMessage = models.RoomMessage || model<IRoomMessage>("RoomMessage", roomMessageSchema);
export const RoomQuestion = models.RoomQuestion || model<IRoomQuestion>("RoomQuestion", roomQuestionSchema);

export interface IRoomReaction extends Document {
  roomId: Types.ObjectId;
  targetKind: "message" | "question";
  targetId: Types.ObjectId;
  clerkId: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

const roomReactionSchema = new Schema<IRoomReaction>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    targetKind: { type: String, enum: ["message", "question"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    clerkId: { type: String, required: true, trim: true },
    emoji: { type: String, required: true, trim: true, maxlength: 12 },
  },
  { timestamps: true }
);

roomReactionSchema.index({ roomId: 1, targetKind: 1, targetId: 1, emoji: 1, clerkId: 1 }, { unique: true });
roomReactionSchema.index({ roomId: 1, targetKind: 1, targetId: 1 });

export const RoomReaction = models.RoomReaction || model<IRoomReaction>("RoomReaction", roomReactionSchema);
