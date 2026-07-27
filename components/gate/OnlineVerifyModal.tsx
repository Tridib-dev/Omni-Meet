"use client";

// components/gate/OnlineVerifyModal.tsx
// Shown when an attendee clicks "Join Room" on the event page.
//
// The join action verifies the ticket first, then calls
// POST /api/verify/room-join to run autoCheckInOnRoomJoin() for online/hybrid
// events. If that request fails, the room still opens so the join flow stays
// non-blocking.

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { verifyTicketClient } from "./gate-client";
import { verifyReasonMessage } from "./gate-format";
import type { VerifyTicketResult } from "@/lib/actions/gate.actions";

export interface OnlineVerifyModalProps {
  ticketId: string;
  eventId: string;
  eventMode: "online" | "hybrid";
  onVerified: () => void;
}

type Stage = "loading" | "valid" | "invalid";

export default function OnlineVerifyModal({ ticketId, eventId, eventMode, onVerified }: OnlineVerifyModalProps) {
  const [stage, setStage] = useState<Stage>("loading");
  const [result, setResult] = useState<VerifyTicketResult | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    verifyTicketClient(ticketId, eventId).then((res) => {
      if (cancelled) return;
      setResult(res);
      setStage(res.valid ? "valid" : "invalid");
    });
    return () => {
      cancelled = true;
    };
  }, [ticketId, eventId]);

  async function handleJoin() {
    setJoining(true);
    try {
      await fetch("/api/verify/room-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      }).catch(() => {
        // Keep the join non-blocking if the network request fails.
      });
    } finally {
      onVerified();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--gv-line,#262B35)] bg-[var(--gv-panel,#14171D)] p-6 text-center text-[var(--gv-ink,#F3F5F8)]">
        {stage === "loading" && (
          <div className="space-y-3">
            <Loader2 className="mx-auto animate-spin text-[var(--gv-scan,#4FD1FF)]" size={28} />
            <p className="text-sm text-[var(--gv-ink-dim,#8891A3)]">Verifying your ticket…</p>
          </div>
        )}

        {stage === "valid" && result?.ticket && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto text-[var(--gv-go,#33D6A0)]" size={32} />
            <p className="font-medium">Ticket verified</p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full rounded-lg bg-[var(--gv-go,#33D6A0)] py-2.5 text-sm font-semibold text-[#0A0C10] disabled:opacity-60"
            >
              {joining ? "Joining…" : eventMode === "hybrid" ? "Join video room" : "Join room"}
            </button>
          </div>
        )}

        {stage === "invalid" && (
          <div className="space-y-4">
            <XCircle className="mx-auto text-[var(--gv-stop,#FF5468)]" size={32} />
            <p className="text-sm">{verifyReasonMessage(result?.reason, result?.ticket?.checkedInAt)}</p>
            <Link
              href="/tickets"
              className="block w-full rounded-lg border border-[var(--gv-line,#262B35)] py-2.5 text-sm font-medium text-[var(--gv-ink,#F3F5F8)]"
            >
              View your tickets
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
