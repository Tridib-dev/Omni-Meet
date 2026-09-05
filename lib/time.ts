import { DateTime } from "luxon";

/**
 * Combines an event's calendar date, wall-clock time, and IANA timezone
 * into the true UTC instant. This is the ONLY place this composition
 * should happen — every other call site should call this function
 * instead of re-deriving the conversion.
 */
export function getEventStartUTC(
  date: string,
  time: string,
  timezone?: string
): Date {
  const tz = timezone || "Asia/Kolkata";
  const [datePart] = date.split("T");

  const dt = DateTime.fromISO(`${datePart}T${time}`, { zone: tz });

  if (!dt.isValid) {
    throw new Error(
      `getEventStartUTC: invalid date/time/timezone combination — date="${date}", time="${time}", timezone="${tz}" (${dt.invalidReason})`
    );
  }

  return dt.toUTC().toJSDate();
}

export function eventCountdown(utcInstant: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = Date.now();
  const target = utcInstant.getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  return { days, hours, minutes, seconds };
}

/**
 * Formats an event's UTC instant for display.
 * `primary` is always the event's own (venue/host) timezone.
 * `secondary`, when present, is the viewer's own local equivalent —
 * only shown when it actually differs from the event's zone.
 */
export function displayEventTime(
  utcInstant: Date,
  eventTimezone: string,
  viewerTimezone?: string
): { primary: string; secondary?: string } {
  const viewerTZ = viewerTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const eventDT = DateTime.fromJSDate(utcInstant, { zone: "utc" }).setZone(eventTimezone);
  const viewerDT = DateTime.fromJSDate(utcInstant, { zone: "utc" }).setZone(viewerTZ);

  const primary = `${eventDT.toFormat("EEE, d MMM yyyy · h:mm a")} ${eventDT.offsetNameShort}`;

  let secondary: string | undefined;
  if (eventTimezone !== viewerTZ) {
    secondary = `(= ${viewerDT.toFormat("h:mm a")} ${viewerDT.offsetNameShort} for you)`;
  }

  return { primary, secondary };
}