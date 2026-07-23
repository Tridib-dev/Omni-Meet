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

async function safeJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchAttendees(eventSlug: string): Promise<GateAttendeesResponse> {
  const res = await fetch(`/api/events/${eventSlug}/attendees`, { cache: "no-store" });
  return safeJson<GateAttendeesResponse>(res, {
    total: 0,
    checkedIn: 0,
    remaining: 0,
    attendees: [],
  });
}

export async function verifyTicketClient(
  ticketId: string,
  eventId: string
): Promise<VerifyTicketResult> {
  const params = new URLSearchParams({ id: ticketId, eventId });
  const res = await fetch(`/api/verify?${params.toString()}`, { cache: "no-store" });
  return safeJson<VerifyTicketResult>(res, { valid: false, reason: "not_found" });
}

export async function checkInTicketClient(
  ticketId: string,
  ticketType: TicketType,
  eventId: string
): Promise<CheckInTicketResult> {
  const res = await fetch("/api/verify/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketId, ticketType, eventId }),
  });
  return safeJson<CheckInTicketResult>(res, { success: false, reason: "not_found" });
}
