"use client";

// components/gate/AttendeeRow.tsx
// Signature visual: each attendee renders as a torn ticket stub — a
// perforated notch cut into the left edge and a dashed divider before the
// status/action column, echoing the physical object this whole screen is
// standing in for.

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { checkInTicketClient } from "./gate-client";
import { maskEmail, formatShortTime } from "./gate-format";
import type { GateAttendeeItem } from "@/lib/actions/gate.actions";

export interface AttendeeRowProps {
  attendee: GateAttendeeItem;
  eventId: string;
  onCheckedIn: (id: string) => void;
}

export default function AttendeeRow({ attendee, eventId, onCheckedIn }: AttendeeRowProps) {
  const [pending, setPending] = useState(false);
  const [optimisticIn, setOptimisticIn] = useState(false);
  const [error, setError] = useState(false);

  const checkedIn = attendee.checkedIn || optimisticIn;

  async function handleCheckIn() {
    if (checkedIn || pending) return;

    setPending(true);
    setError(false);
    setOptimisticIn(true); // optimistic

    const res = await checkInTicketClient(attendee.id, attendee.type, eventId);

    if (res.success) {
      onCheckedIn(attendee.id);
    } else {
      setOptimisticIn(false);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
    setPending(false);
  }

  return (
    <div className="relative flex items-stretch overflow-hidden rounded-xl border border-[var(--gv-line)] bg-[var(--gv-panel)]">
      {/* punch-hole notches, top and bottom of the left edge */}
      <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--gv-bg)]" />

      <div className="flex flex-1 items-center justify-between gap-3 py-3 pl-5 pr-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{maskEmail(attendee.email)}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="rounded-full bg-[var(--gv-panel-2)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--gv-ink-dim)]">
              {attendee.type === "order" ? "paid" : "free"}
            </span>
            {checkedIn && attendee.checkedInAt && (
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gv-ink-dim)]">
                in at {formatShortTime(attendee.checkedInAt)}
              </span>
            )}
          </div>
        </div>

        {/* dashed perforation divider */}
        <div className="h-9 w-px shrink-0 border-l border-dashed border-[var(--gv-line)]" />

        <div className="shrink-0">
          {checkedIn ? (
            <span className="rounded-full bg-[var(--gv-go)]/15 px-2.5 py-1 text-xs font-medium text-[var(--gv-go)]">
              Checked in
            </span>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={pending}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                error
                  ? "bg-[var(--gv-stop)]/15 text-[var(--gv-stop)]"
                  : "bg-[var(--gv-scan)] text-[#0A0C10]"
              }`}
            >
              {pending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : error ? (
                "Failed — retry"
              ) : (
                "Check in"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
