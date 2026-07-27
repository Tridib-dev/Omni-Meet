// lib/database/models/room.model.ts

import { Schema, model, models, Document, Types } from "mongoose";

export type RoomStatus = "scheduled" | "live" | "ended" | "cancelled";
export type RoomMemberRole = "organizer" | "co-organizer" | "speaker" | "attendee";

export interface IRoom extends Document {
  eventId: Types.ObjectId;
  streamCallId: string;
  streamCallType: string;
  streamChatChannelId?: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  status: RoomStatus;
  createdByClerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, unique: true, index: true },
    streamCallId: { type: String, required: true, unique: true },
    streamCallType: { type: String, required: true, default: "event-room" },
    streamChatChannelId: { type: String },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      required: true,
      default: "scheduled",
    },
    createdByClerkId: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export interface IRoomMember extends Document {
  roomId: Types.ObjectId;
  clerkId: string;
  role: RoomMemberRole;
  ticketId?: string;
  ticketType?: "booking" | "order";
  joinedAt?: Date;
  leftAt?: Date;
  bannedAt?: Date;
  handRaised: boolean;
}

const roomMemberSchema = new Schema<IRoomMember>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    clerkId: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["organizer", "co-organizer", "speaker", "attendee"],
      required: true,
      default: "attendee",
    },
    ticketId: { type: String },
    ticketType: { type: String, enum: ["booking", "order"] },
    joinedAt: { type: Date },
    leftAt: { type: Date },
    bannedAt: { type: Date },
    handRaised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roomMemberSchema.index({ roomId: 1, clerkId: 1 }, { unique: true });

export const Room = models.Room || model<IRoom>("Room", roomSchema);
export const RoomMember = models.RoomMember || model<IRoomMember>("RoomMember", roomMemberSchema);