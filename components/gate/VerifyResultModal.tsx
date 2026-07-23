"use client";

// components/gate/VerifyResultModal.tsx
// Fullscreen ✓ / ✗ overlay shown after each scan. Auto-dismisses after 3s,
// tap anywhere to dismiss early. Plays a short success/error tone via the
// Web Audio API (no audio files needed).

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { maskEmail, verifyReasonMessage } from "./gate-format";
import type { VerifyTicketResult } from "@/lib/actions/gate.actions";

export interface VerifyResultModalProps {
  result: VerifyTicketResult | null;
  onDismiss: () => void;
}

function playTone(frequency: number, durationMs: number) {
  try {
    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.stop(ctx.currentTime + durationMs / 1000);
    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, durationMs + 80);
  } catch {
    // Audio isn't available (e.g. no user gesture yet) — fail silently.
  }
}

export default function VerifyResultModal({ result, onDismiss }: VerifyResultModalProps) {
  useEffect(() => {
    if (!result) return;

    playTone(result.valid ? 880 : 220, result.valid ? 180 : 320);

    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [result, onDismiss]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6 text-center ${
            result.valid ? "bg-[var(--gv-go)]" : "bg-[var(--gv-stop)]"
          }`}
        >
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0A0C10]/15"
          >
            {result.valid ? <Check size={56} color="#0A0C10" /> : <X size={56} color="#0A0C10" />}
          </motion.div>

          {result.valid && result.ticket ? (
            <div className="space-y-1 text-[#0A0C10]">
              <p className="text-lg font-semibold">{maskEmail(result.ticket.attendeeEmail)}</p>
              <p className="text-sm uppercase tracking-wide opacity-80">
                {result.ticket.price > 0 ? "Paid ticket" : "Free ticket"}
              </p>
            </div>
          ) : (
            <p className="max-w-xs text-lg font-medium text-[#0A0C10]">
              {verifyReasonMessage(result.reason, result.ticket?.checkedInAt)}
            </p>
          )}

          <p className="text-xs text-[#0A0C10]/70">Tap anywhere to dismiss</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
