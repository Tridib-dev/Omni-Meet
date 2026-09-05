export function getEventStartUTC(
  date: string,
  time: string,
  timezone?: string
): Date {
  const tz = timezone || "Asia/Kolkata";

  const [datePart] = date.split("T");
  const [hour, minute] = time.split(":").map(Number);

  return new Date(
    Date.UTC(
      parseInt(datePart.slice(0, 4)),
      parseInt(datePart.slice(5, 7)) - 1,
      parseInt(datePart.slice(8, 10)),
      hour,
      minute
    )
  );
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

export function displayEventTime(
  utcInstant: Date,
  eventTimezone: string,
  viewerTimezone?: string
): { primary: string; secondary?: string } {
  const eventDate = utcInstant;
  const viewerTZ = viewerTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const eventLocal = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: eventTimezone,
  }).format(eventDate);

  const viewerLocal = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date())
    .replace(/\s+\w+$/, "");

  const hasDifferentZone =
    eventTimezone !== viewerTimezone && viewerTimezone !== undefined;

  const primary = ` ${eventLocal} ${eventTimezone}`;

  let secondary: string | undefined;
  if (hasDifferentZone) {
    secondary = ` (= ${viewerLocal} ${viewerTimezone} for you)`;
  }

  return { primary, secondary };
}