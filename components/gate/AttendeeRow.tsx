"use client";

// components/gate/AttendeeRow.tsx
// Signature visual: each attendee renders as a torn ticket stub — a
// perforated notch cut into the left edge and a dashed divider before the
// status/action column, echoing the physical object this whole screen is
// standing in for.

import { useState } from "react";
import { DoorOpen, Loader2 } from "lucide-react";
import { checkInTicketClient } from "./gate-client";
import { maskEmail, formatShortTime, verifyReasonMessage } from "./gate-format";
import type { GateAttendeeItem } from "@/lib/actions/gate.actions";

export interface AttendeeRowProps {
  attendee: GateAttendeeItem;
  eventId: string;
  onCheckedIn: (id: string) => void;
  variant?: "gate" | "dashboard";
}

export default function AttendeeRow({ attendee, eventId, onCheckedIn, variant = "gate" }: AttendeeRowProps) {
  const [pending, setPending] = useState(false);
  const [optimisticIn, setOptimisticIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkedIn = attendee.checkedIn || optimisticIn;

  async function handleCheckIn() {
    if (checkedIn || pending) return;

    setPending(true);
    setError(null);
    setOptimisticIn(true); // optimistic

    const res = await checkInTicketClient(attendee.id, attendee.type, eventId);

    if (res.success) {
      onCheckedIn(attendee.id);
    } else {
      setOptimisticIn(false);
      const message = verifyReasonMessage(res.reason, res.ticket?.checkedInAt);
      setError(message);
      setTimeout(() => setError(null), 3000);
    }
    setPending(false);
  }

  if (variant === "dashboard") {
    return (
      <div role="row" className="grid min-w-[1180px] grid-cols-[minmax(280px,1.7fr)_minmax(170px,1fr)_90px_120px_110px_130px_150px] items-center gap-x-5 border-t border-slate-100 px-5 py-3 text-sm first:border-t-0">
        <div className="flex min-w-0 items-center gap-3">
          {attendee.photo ? (
            <img src={attendee.photo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
              {(attendee.name || attendee.email).slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{attendee.name || "Unnamed attendee"}</p>
            <p className="truncate text-xs text-slate-500">{attendee.email}</p>
          </div>
        </div>
        <span className="truncate pr-3 font-mono text-xs text-slate-500" title={attendee.id}>{attendee.id}</span>
        <span className={`w-fit justify-self-center rounded-full px-2 py-1 text-[10px] font-semibold ${
          checkedIn ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
        }`}>
          {checkedIn ? "Checked in" : "Registered"}
        </span>
        <span className="justify-self-center text-slate-600">{attendee.type === "order" ? "Paid" : "Free"}</span>
        <span className="text-slate-600">{attendee.pricePaise > 0 ? `₹${(attendee.pricePaise / 100).toLocaleString("en-IN")}` : "Free"}</span>
        <span className="justify-self-center text-xs text-slate-500">{formatShortTime(attendee.bookedAt)}</span>
        <div className="flex min-w-0 justify-end pr-0">
          {checkedIn ? (
            <span className="min-w-[100px] text-right text-xs text-slate-500">{attendee.checkedInAt ? formatShortTime(attendee.checkedInAt) : "-"}</span>
          ) : (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={pending}
              className={`min-w-[100px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                error ? "bg-red-50 text-red-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              title={error ?? undefined}
            >
              <span className="flex items-center justify-center gap-1.5">
                {pending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <DoorOpen size={16} strokeWidth={2.25} aria-hidden="true" />
                )}
                <span>{error ? "Retry" : "Check in"}</span>
              </span>
            </button>
          )}
        </div>
      </div>
    );
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
