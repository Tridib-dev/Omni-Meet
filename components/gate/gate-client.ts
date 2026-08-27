// components/gate/gate-client.ts
// Thin client-side wrappers around the three route handlers.
// Kept in one place so every component calls the API the same way.
//
// NOTE: the attendees endpoint is slug-based so it stays aligned with the
// main event route tree and avoids conflicting dynamic segment names.

import type {
  GateAttendeesResponse,
  VerifyTicketResult,
  CheckInTicketResult,
  TicketType,
} from "@/lib/actions/gate.actions";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGateAttendeesResponse(value: unknown): value is GateAttendeesResponse {
  if (!isRecord(value)) return false;
  if (
    typeof value.total !== "number" ||
    typeof value.checkedIn !== "number" ||
    typeof value.remaining !== "number" ||
    !Array.isArray(value.attendees)
  ) {
    return false;
  }

  return value.attendees.every((attendee) => {
    if (!isRecord(attendee)) return false;
    return (
      typeof attendee.id === "string" &&
      typeof attendee.type === "string" &&
      typeof attendee.pricePaise === "number" &&
      typeof attendee.email === "string" &&
      typeof attendee.checkedIn === "boolean" &&
      typeof attendee.bookedAt === "string"
    );
  });
}

function isVerifyTicketResult(value: unknown): value is VerifyTicketResult {
  if (!isRecord(value) || typeof value.valid !== "boolean") return false;
  if (value.reason !== undefined && typeof value.reason !== "string") return false;
  if (value.ticket === undefined) return true;
  if (!isRecord(value.ticket)) return false;

  return (
    typeof value.ticket.id === "string" &&
    typeof value.ticket.type === "string" &&
    typeof value.ticket.attendeeEmail === "string" &&
    typeof value.ticket.pricePaise === "number" &&
    typeof value.ticket.checkedIn === "boolean" &&
    (value.ticket.checkedInAt === undefined || typeof value.ticket.checkedInAt === "string")
  );
}

function isCheckInTicketResult(value: unknown): value is CheckInTicketResult {
  if (!isRecord(value) || typeof value.success !== "boolean") return false;
  if (value.reason !== undefined && typeof value.reason !== "string") return false;
  if (value.ticket === undefined) return true;
  if (!isRecord(value.ticket)) return false;

  return (
    typeof value.ticket.id === "string" &&
    typeof value.ticket.type === "string" &&
    typeof value.ticket.checkedIn === "boolean" &&
    (value.ticket.checkedInAt === undefined || typeof value.ticket.checkedInAt === "string")
  );
}

async function safeJson(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function verifyFallbackFromStatus(status: number): VerifyTicketResult {
  if (status === 401) return { valid: false, reason: "unauthorized" };
  if (status === 404) return { valid: false, reason: "not_found" };
  if (status === 410) return { valid: false, reason: "expired" };
  return { valid: false, reason: "not_found" };
}

function checkInFallbackFromStatus(status: number): CheckInTicketResult {
  if (status === 401) return { success: false, reason: "unauthorized" };
  if (status === 404) return { success: false, reason: "not_found" };
  if (status === 409) return { success: false, reason: "already_used" };
  if (status === 410) return { success: false, reason: "expired" };
  return { success: false, reason: "not_found" };
}

function attendeesFallback(): GateAttendeesResponse {
  return {
    total: 0,
    checkedIn: 0,
    remaining: 0,
    attendees: [],
  }
}

export async function fetchAttendees(eventSlug: string): Promise<GateAttendeesResponse> {
  try {
    const res = await fetch(`/api/events/${eventSlug}/attendees`, { cache: "no-store" });
    const data = await safeJson(res);
    return isGateAttendeesResponse(data) ? data : attendeesFallback();
  } catch {
    return attendeesFallback();
  }
}

export async function verifyTicketClient(
  ticketId: string,
  eventId: string
): Promise<VerifyTicketResult> {
  try {
    const params = new URLSearchParams({ id: ticketId, eventId });
    const res = await fetch(`/api/verify?${params.toString()}`, { cache: "no-store" });
    const data = await safeJson(res);
    if (isVerifyTicketResult(data)) return data;
    return verifyFallbackFromStatus(res.status);
  } catch {
    return { valid: false, reason: "not_found" };
  }
}

export async function checkInTicketClient(
  ticketId: string,
  ticketType: TicketType,
  eventId: string
): Promise<CheckInTicketResult> {
  try {
    const res = await fetch("/api/verify/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, ticketType, eventId }),
    });
    const data = await safeJson(res);
    if (isCheckInTicketResult(data)) return data;
    return checkInFallbackFromStatus(res.status);
  } catch {
    return { success: false, reason: "not_found" };
  }
}
