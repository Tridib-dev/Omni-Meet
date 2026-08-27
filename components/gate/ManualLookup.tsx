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
  variant?: "gate" | "dashboard";
}

export default function ManualLookup({ eventId, onCheckedIn, variant = "gate" }: ManualLookupProps) {
  const isDashboard = variant === "dashboard";
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
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            isDashboard
              ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/30"
              : "border-[var(--gv-line)] bg-[var(--gv-panel-2)] text-[var(--gv-ink)] placeholder:text-[var(--gv-ink-dim)] focus:ring-[var(--gv-scan)]"
          }`}
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading || !value.trim()}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-40 ${
            isDashboard ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-[var(--gv-scan)] text-[#0A0C10]"
          }`}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Look up
        </button>
      </div>

      {requestError && (
        <p className={`rounded-lg border px-3 py-2 text-sm ${
          isDashboard ? "border-red-200 bg-red-50 text-red-700" : "border-[var(--gv-stop)]/40 bg-[var(--gv-stop)]/10 text-[var(--gv-stop)]"
        }`}>
          {requestError}
        </p>
      )}

      {result && (
        <div className={`rounded-lg border p-3 text-sm ${
          isDashboard ? "border-slate-200 bg-slate-50 text-slate-900" : "border-[var(--gv-line)] bg-[var(--gv-panel-2)]"
        }`}>
          {result.valid && result.ticket ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{maskEmail(result.ticket.attendeeEmail)}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                  isDashboard ? "bg-white text-slate-500" : "bg-[var(--gv-panel)] text-[var(--gv-ink-dim)]"
                }`}>
                  {result.ticket.price > 0 ? "paid" : "free"}
                </span>
              </div>
              {justCheckedIn ? (
                  <p className={`flex items-center gap-1.5 ${isDashboard ? "text-green-600" : "text-[var(--gv-go)]"}`}>
                  <CheckCircle2 size={15} /> Checked in
                </p>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className={`w-full rounded-md py-2 text-sm font-medium disabled:opacity-50 ${
                    isDashboard ? "bg-green-600 text-white hover:bg-green-700" : "bg-[var(--gv-go)] text-[#0A0C10]"
                  }`}
                >
                  {checkingIn ? "Checking in…" : "Check in"}
                </button>
              )}
            </div>
          ) : (
            <p className={isDashboard ? "text-red-700" : "text-[var(--gv-stop)]"}>
              {verifyReasonMessage(result.reason, result.ticket?.checkedInAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
