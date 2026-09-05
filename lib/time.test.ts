import { describe, it, expect } from "vitest";
import { getEventStartUTC , displayEventTime} from "./time";

describe("getEventStartUTC", () => {
  it("converts an India event (Asia/Kolkata, +5:30) correctly", () => {
    const result = getEventStartUTC("2026-12-05", "19:00", "Asia/Kolkata");
    expect(result.toISOString()).toBe("2026-12-05T13:30:00.000Z");
  });

  it("converts a Nepal event (+5:45, non-hour offset) correctly", () => {
    const result = getEventStartUTC("2026-12-05", "19:00", "Asia/Kathmandu");
    expect(result.toISOString()).toBe("2026-12-05T13:15:00.000Z");
  });

  it("handles a US Eastern event before DST fall-back (EDT, UTC-4)", () => {
    const result = getEventStartUTC("2026-10-30", "19:00", "America/New_York");
    expect(result.toISOString()).toBe("2026-10-30T23:00:00.000Z");
  });

  it("handles a US Eastern event after DST fall-back (EST, UTC-5)", () => {
    const result = getEventStartUTC("2026-11-05", "19:00", "America/New_York");
    expect(result.toISOString()).toBe("2026-11-06T00:00:00.000Z");
  });

  it("handles a UTC event with no conversion needed", () => {
    const result = getEventStartUTC("2026-12-05", "19:00", "UTC");
    expect(result.toISOString()).toBe("2026-12-05T19:00:00.000Z");
  });

  it("handles an Australian event (Southern Hemisphere summer DST)", () => {
    const result = getEventStartUTC("2026-12-05", "19:00", "Australia/Sydney");
    expect(result.toISOString()).toBe("2026-12-05T08:00:00.000Z");
  });
});


describe("displayEventTime", () => {
  it("shows the event's own time in its own zone as primary", () => {
    const instant = getEventStartUTC("2026-12-05", "19:00", "Asia/Kolkata");
    const { primary } = displayEventTime(instant, "Asia/Kolkata");
    expect(primary).toContain("7:00 PM");
    expect(primary).toContain("GMT+5:30"); // ICU avoids "IST" — genuinely ambiguous (India/Israel/Ireland)
  });

  it("shows a secondary line when viewer's zone differs from event's zone", () => {
    const instant = getEventStartUTC("2026-12-05", "19:00", "Asia/Kolkata");
    const { secondary } = displayEventTime(instant, "Asia/Kolkata", "America/New_York");
    expect(secondary).toBeDefined();
    expect(secondary).toContain("8:30 AM"); // 7:00 PM IST = 8:30 AM EST same day
  });

  it("omits secondary line when viewer's zone matches the event's zone", () => {
    const instant = getEventStartUTC("2026-12-05", "19:00", "Asia/Kolkata");
    const { secondary } = displayEventTime(instant, "Asia/Kolkata", "Asia/Kolkata");
    expect(secondary).toBeUndefined();
  });
});
