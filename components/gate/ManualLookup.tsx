"use client";

// components/gate/ManualLookup.tsx
// Fallback path: staff types/pastes a ticket id and looks it up manually.
// (Note: /api/verify only accepts an id, not an email — so email lookup
// isn't wired to a real endpoint yet. Input is labeled accordingly below;
// flag this if email-based lookup is expected, it'll need a route change.)

import { useState } from "react";
import { Search, Loader2, CheckCircle2 } from "lucide-react";
import { verifyTicketClient, checkInTicketClient } from "./gate-client";
import { maskEmail, verifyReasonMessage } from "./gate-format";
import type { VerifyTicketResult } from "@/lib/actions/gate.actions";

export interface ManualLookupProps {
  eventId: string;
  onCheckedIn: () => void;
}

export default function ManualLookup({ eventId, onCheckedIn }: ManualLookupProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [result, setResult] = useState<VerifyTicketResult | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  async function handleLookup() {
    const id = value.trim();
    if (!id || loading) return;

    setLoading(true);
    setJustCheckedIn(false);
    setRequestError(null);
    setResult(null);
    try {
      const res = await verifyTicketClient(id, eventId);
      setResult(res);
    } catch {
      setRequestError("Unable to look up the ticket right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!result?.valid || !result.ticket || checkingIn) return;

    setCheckingIn(true);
    setRequestError(null);
    try {
      const res = await checkInTicketClient(result.ticket.id, result.ticket.type, eventId);
      if (res.success) {
        setJustCheckedIn(true);
        onCheckedIn();
        setTimeout(() => {
          setValue("");
          setResult(null);
          setJustCheckedIn(false);
        }, 1200);
      } else {
        setResult({
          valid: false,
          reason: res.reason ?? "already_used",
          ticket: result.ticket,
        });
      }
    } catch {
      setRequestError("Check-in failed before the server responded. Please retry.");
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          placeholder="Paste ticket ID…"
          className="w-full rounded-lg border border-[var(--gv-line)] bg-[var(--gv-panel-2)] px-3 py-2 text-sm text-[var(--gv-ink)] placeholder:text-[var(--gv-ink-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--gv-scan)]"
        />
        <button
          onClick={handleLookup}
          disabled={loading || !value.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--gv-scan)] px-3 py-2 text-sm font-medium text-[#0A0C10] transition-opacity disabled:opacity-40"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Look up
        </button>
      </div>

      {requestError && (
        <p className="rounded-lg border border-[var(--gv-stop)]/40 bg-[var(--gv-stop)]/10 px-3 py-2 text-sm text-[var(--gv-stop)]">
          {requestError}
        </p>
      )}

      {result && (
        <div className="rounded-lg border border-[var(--gv-line)] bg-[var(--gv-panel-2)] p-3 text-sm">
          {result.valid && result.ticket ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{maskEmail(result.ticket.attendeeEmail)}</span>
                <span className="rounded-full bg-[var(--gv-panel)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--gv-ink-dim)]">
                  {result.ticket.price > 0 ? "paid" : "free"}
                </span>
              </div>
              {justCheckedIn ? (
                <p className="flex items-center gap-1.5 text-[var(--gv-go)]">
                  <CheckCircle2 size={15} /> Checked in
                </p>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="w-full rounded-md bg-[var(--gv-go)] py-2 text-sm font-medium text-[#0A0C10] disabled:opacity-50"
                >
                  {checkingIn ? "Checking in…" : "Check in"}
                </button>
              )}
            </div>
          ) : (
            <p className="text-[var(--gv-stop)]">
              {verifyReasonMessage(result.reason, result.ticket?.checkedInAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
