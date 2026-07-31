// lib/actions/room.actions.ts
"use server";

import { isValidObjectId } from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { Event } from "@/database/event.model";
import { Room, RoomMember, RoomMemberRole, type RoomStatus } from "@/database/Room.model";
import { isGateAuthorized } from "@/lib/actions/gate.actions";
import { isEventCreator } from "./event.actions";
import connectToDatabase from "../mongodb";
import { Order } from "@/database/Order.model";
import { Booking } from "@/database/booking.model";
import { getServerStreamClient } from "../stream/server-client";
import { autoCheckInOnRoomJoin } from "@/lib/actions/gate.actions";

export type RoomPhase = "not_configured" | "locked" | "lobby" | "live" | "ended";

const LOBBY_OPEN_MINUTES_BEFORE = 30;

function toStreamRole(role: RoomMemberRole): "call_member" | "admin" {
  if (role === "organizer" || role === "co-organizer") return "admin";
  return "call_member";
}


function getEffectivePhase(
  room: { status: RoomStatus; scheduledStart: Date },
  now: Date = new Date()
): RoomPhase {
  if (room.status === "ended" || room.status === "cancelled") return "ended";
  if (room.status === "live") return "live";

  const lobbyOpensAt = new Date(room.scheduledStart.getTime() - LOBBY_OPEN_MINUTES_BEFORE * 60_000);
  return now >= lobbyOpensAt ? "lobby" : "locked";
}

// TODO — confirm your Booking/Order field names before relying on this.
// Needs to answer: "does `clerkId` hold a valid, non-expired ticket for `eventId`?"
// Wire this up the same way verifyTicket() in gate.actions.ts resolves a ticket,
// just keyed by owner identity instead of a scanned ticket id.
// lib/actions/room.actions.ts — replaces the stub

async function getUserActiveTicketForEvent(
  eventId: string,
  clerkId: string,
): Promise<{ ticketId: string; ticketType: "booking" | "order" } | null> {
  // Paid tickets: only "paid" orders count. Pending/failed must not grant access.
  const order = await Order.findOne({ eventId, clerkId, status: "paid" })
    .select("_id")
    .lean();
  if (order) {
    return { ticketId: order._id.toString(), ticketType: "order" };
  }

  // Free tickets: existence is enough, no status field.
  const booking = await Booking.findOne({ eventId, clerkId }).select("_id").lean();
  if (booking) {
    return { ticketId: booking._id.toString(), ticketType: "booking" };
  }

  return null;
}


export interface RoomPublicMeta {
  phase: RoomPhase;
  scheduledStart: string;
  scheduledEnd: string;
}

export async function getRoomPublicMeta(eventId: string): Promise<RoomPublicMeta | null> {
  try {
    if (!isValidObjectId(eventId)) return null;
    await connectToDatabase();

    const room = await Room.findOne({ eventId }).select("scheduledStart scheduledEnd status").lean();
    if (!room) return null;

    return {
      phase: getEffectivePhase(room, new Date()),
      scheduledStart: room.scheduledStart.toISOString(),
      scheduledEnd: room.scheduledEnd.toISOString(),
    };
  } catch (error) {
    console.error("[getRoomPublicMeta]", error);
    return null;
  }
}


export async function createRoom(
  eventId: string,
  scheduledStart: Date,
  scheduledEnd: Date
): Promise<{ success: boolean; reason?: string; roomId?: string }> {
  try {
    if (!isValidObjectId(eventId)) return { success: false, reason: "not_found" };
    if (!(await isEventCreator(eventId))) return { success: false, reason: "unauthorized" };

    await connectToDatabase();

    const event = await Event.findById(eventId).lean();
    if (!event) return { success: false, reason: "not_found" };

    const existing = await Room.findOne({ eventId }).lean();
    if (existing) return { success: true, roomId: existing._id.toString() };

    const { userId } = await auth();
    if (!userId) return { success: false, reason: "unauthorized" };

    const streamCallId = `event-${eventId}`;
    const client = getServerStreamClient();

    await client.video.call("event-room", streamCallId).getOrCreate({
      data: {
        created_by_id: userId,
        members: [{ user_id: userId, role: "admin" }],
        custom: { eventId },
      },
    });

    const room = await Room.create({
      eventId,
      streamCallId,
      streamCallType: "event-room",
      scheduledStart,
      scheduledEnd,
      status: "scheduled",
      createdByClerkId: userId,
    });

    return { success: true, roomId: room._id.toString() };
  } catch (error) {
    console.error("[createRoom]", error);
    return { success: false, reason: "server_error" };
  }
}

export interface JoinRoomResult {
  status: "ok" | "denied";
  reason?:
    | "not_configured"
    | "not_started_yet"
    | "room_closed"
    | "unauthorized"
    | "removed_by_organizer"
    | "server_error";
  phase?: RoomPhase;
  callId?: string;
  callType?: string;
  role?: RoomMemberRole; // reuse the model's type instead of re-typing the union here
  scheduledEnd?: string;
}


export async function joinRoom(eventId: string): Promise<JoinRoomResult> {
  try {
    if (!isValidObjectId(eventId)) return { status: "denied", reason: "not_configured" };

    const { userId: clerkId } = await auth();
    if (!clerkId) return { status: "denied", reason: "unauthorized" };

    await connectToDatabase();

    const room = await Room.findOne({ eventId });
    if (!room) return { status: "denied", reason: "not_configured" };

    // Resolve identity: organizer/co-organizer vs ticketed attendee.
    // NOTE: this is only used as the *initial* role on first-ever join —
    // see the read-back below for why it can't be trusted after that.
    const isOrganizerTier = await isGateAuthorized(eventId);
    let initialRole: RoomMemberRole;
    let ticketRef: { ticketId: string; ticketType: "booking" | "order" } | null = null;

    if (isOrganizerTier) {
      initialRole = (await isEventCreator(eventId)) ? "organizer" : "co-organizer";
    } else {
      ticketRef = await getUserActiveTicketForEvent(eventId, clerkId);
      if (!ticketRef) return { status: "denied", reason: "unauthorized" };
      initialRole = "attendee";
    }

    const existingMember = await RoomMember.findOne({ roomId: room._id, clerkId });
    if (existingMember?.bannedAt) {
      return { status: "denied", reason: "removed_by_organizer" };
    }

    const phase = getEffectivePhase(room, new Date());
    if (phase === "ended") return { status: "denied", reason: "room_closed" };

    const canGetVideoToken = isOrganizerTier || phase === "live";
    if (!canGetVideoToken && phase === "locked") {
      return { status: "denied", reason: "not_started_yet", phase };
    }

    // Upsert membership, then READ BACK what's actually persisted —
    // this is the bug #1 fix. `initialRole` only applies via $setOnInsert
    // on someone's very first join; a returning speaker must not be
    // silently recomputed back down to "attendee".
    const memberDoc = await RoomMember.findOneAndUpdate(
      { roomId: room._id, clerkId },
      {
        $setOnInsert: {
          role: initialRole,
          ticketId: ticketRef?.ticketId,
          ticketType: ticketRef?.ticketType,
        },
        $set: { joinedAt: new Date(), leftAt: null },
      },
      { upsert: true, returnDocument: "after" }
    );

    const effectiveRole: RoomMemberRole = memberDoc.role;

    if (!canGetVideoToken) {
      // Lobby phase — no video token yet, but still report the REAL persisted role.
      return { status: "ok", phase, role: effectiveRole, scheduledEnd: room.scheduledEnd.toISOString() };
    }

    const client = getServerStreamClient();

    // bug #2 fix — 3-way mapping instead of the old binary ternary.
    await client.video.call(room.streamCallType, room.streamCallId).updateCallMembers({
      update_members: [{ user_id: clerkId, role: toStreamRole(effectiveRole) }],
    });

    if (effectiveRole === "attendee") {
      try {
        const checkin = await autoCheckInOnRoomJoin(eventId);
        if (!checkin.success) {
          console.warn("[joinRoom] autoCheckInOnRoomJoin skipped", { eventId, clerkId, reason: checkin.reason });
        }
      } catch (error) {
        console.error("[joinRoom] autoCheckInOnRoomJoin threw", error);
      }
    }

    return {
      status: "ok",
      phase,
      callId: room.streamCallId,
      callType: room.streamCallType,
      role: effectiveRole,
      scheduledEnd: room.scheduledEnd.toISOString(),
    };
  } catch (error) {
    console.error("[joinRoom]", error);
    return { status: "denied", reason: "server_error" };
  }
}

export async function startRoom(eventId: string): Promise<{ success: boolean; reason?: string }> {
  try {
    if (!isValidObjectId(eventId)) return { success: false, reason: "not_found" };
    if (!(await isGateAuthorized(eventId))) return { success: false, reason: "unauthorized" };

    await connectToDatabase();
    const room = await Room.findOne({ eventId });
    if (!room) return { success: false, reason: "not_found" };

    room.status = "live";
    await room.save();

    return { success: true };
  } catch (error) {
    console.error("[startRoom]", error);
    return { success: false, reason: "server_error" };
  }
}

export async function endRoom(eventId: string): Promise<{ success: boolean; reason?: string }> {
  try {
    if (!isValidObjectId(eventId)) return { success: false, reason: "not_found" };
    if (!(await isGateAuthorized(eventId))) return { success: false, reason: "unauthorized" };

    await connectToDatabase();
    const room = await Room.findOne({ eventId });
    if (!room) return { success: false, reason: "not_found" };

    const client = getServerStreamClient();
    await client.video.call(room.streamCallType, room.streamCallId).end();

    room.status = "ended";
    await room.save();

    return { success: true };
  } catch (error) {
    console.error("[endRoom]", error);
    return { success: false, reason: "server_error" };
  }
}




export async function leaveRoom(eventId: string): Promise<{ success: boolean }> {
  try {
    if (!isValidObjectId(eventId)) return { success: false };

    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false };

    await connectToDatabase();
    const room = await Room.findOne({ eventId }).select("_id");
    if (!room) return { success: false };

    await RoomMember.findOneAndUpdate(
      { roomId: room._id, clerkId },
      { $set: { leftAt: new Date() } }
    );

    return { success: true };
  } catch (error) {
    console.error("[leaveRoom]", error);
    return { success: false };
  }
}


// add to room.actions.ts

const DEFAULT_ROOM_DURATION_MS = 2 * 60 * 60 * 1000; // 2h — no explicit end-time field on Event yet

// event.date is stored as a full ISO string via normalizeDateToIso (e.g. "2027-04-10T00:00:00.000Z").
// event.time is stored as 24h "HH:mm" via normalizeTime (e.g. "08:30"), confirmed.
// The date's *time-of-day* portion is meaningless (always midnight) — we only want its
// calendar date, then apply the real time from `time` on top of it.
function parseEventStart(isoDate: string, time: string): Date | null {
  const datePart = isoDate.split("T")[0]; // "2027-04-10"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  if (!/^\d{2}:\d{2}$/.test(time)) return null;

  const combined = new Date(`${datePart}T${time}:00.000Z`);
  return Number.isNaN(combined.getTime()) ? null : combined;
}

export async function ensureRoomForEvent(eventId: string): Promise<RoomPublicMeta | null> {
  try {
    if (!isValidObjectId(eventId)) return null;
    await connectToDatabase();

    const existing = await Room.findOne({ eventId }).select("scheduledStart scheduledEnd status").lean();
    if (existing) {
      return {
        phase: getEffectivePhase(existing, new Date()),
        scheduledStart: existing.scheduledStart.toISOString(),
        scheduledEnd: existing.scheduledEnd.toISOString(),
      };
    }

    // No room yet — only an organizer/co-organizer visiting the page can trigger creation.
    if (!(await isGateAuthorized(eventId))) return null;

    const event = await Event.findById(eventId).select("date time").lean();
    if (!event) return null;

    const scheduledStart = parseEventStart(event.date, event.time);
    if (!scheduledStart) {
      console.error("[ensureRoomForEvent] could not parse event date/time", { eventId, date: event.date, time: event.time });
      return null;
    }
    const scheduledEnd = new Date(scheduledStart.getTime() + DEFAULT_ROOM_DURATION_MS);

    const created = await createRoom(eventId, scheduledStart, scheduledEnd);
    if (!created.success) return null;

    return {
      phase: getEffectivePhase({ status: "scheduled", scheduledStart }, new Date()),
      scheduledStart: scheduledStart.toISOString(),
      scheduledEnd: scheduledEnd.toISOString(),
    };
  } catch (error) {
    console.error("[ensureRoomForEvent]", error);
    return null;
  }
}



// parseEventStart in room.actions.ts — add this comment above it
// TIMEZONE ASSUMPTION (tracked for post-MVP fix): treats event.date/event.time as
// literal UTC digits, matching normalizeDateToIso/normalizeTime's current behavior.
// Real fix requires storing the organizer's intended timezone on Event and converting
// here instead of appending "Z" directly. Until then, all users see the same absolute
// countdown/start time regardless of their own timezone, which is correct only if
// organizer and attendees are assumed to share one timezone.
