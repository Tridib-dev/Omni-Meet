// components/gate/gate-format.ts
// Small shared formatting helpers used across the gate UI.
// Not part of the original component plan, but pulled out so
// ScannerPanel / ManualLookup / AttendeeRow / VerifyResultModal
// don't each reimplement the same masking + time logic.

/** alice@example.com -> al***@example.com */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email || "—";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0] ?? ""}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

export function formatClockTime(date: Date = new Date()): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatShortTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export const VERIFY_REASON_COPY: Record<string, string> = {
  not_found: "Ticket not found",
  already_used: "Ticket already scanned",
  expired: "Event has ended",
  wrong_event: "Ticket is for a different event",
  unauthorized: "You're not authorized to scan for this event",
};

export function verifyReasonMessage(reason?: string, checkedInAt?: string): string {
  if (reason === "already_used" && checkedInAt) {
    return `Ticket already scanned at ${formatShortTime(checkedInAt)}`;
  }
  return VERIFY_REASON_COPY[reason ?? ""] ?? "Ticket could not be verified";
}
