"use client";

// components/gate/BarcodeInput.tsx
// USB hardware scanners behave like a very fast keyboard: they type the
// code's characters and then send Enter. We buffer keydowns and treat a
// burst that ends in Enter within GAP_MS of the previous key as a scan.
// No library needed.

import { useEffect, useRef } from "react";
import { Keyboard } from "lucide-react";

export interface BarcodeInputProps {
  onScan: (ticketId: string) => void;
  active: boolean;
}

const GAP_MS = 80;

export default function BarcodeInput({ onScan, active }: BarcodeInputProps) {
  const bufferRef = useRef("");
  const lastKeyAtRef = useRef(0);
  const listening = active;

  useEffect(() => {
    if (!active) return;

    function handleKeydown(e: KeyboardEvent) {
      // Ignore keystrokes aimed at real inputs elsewhere on the page.
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      const now = Date.now();
      const gap = now - lastKeyAtRef.current;
      lastKeyAtRef.current = now;

      if (e.key === "Enter") {
        const code = bufferRef.current.trim();
        bufferRef.current = "";
        if (code && gap <= GAP_MS) {
          onScan(code);
        }
        return;
      }

      // A human typing resets the buffer instead of appending forever.
      if (gap > GAP_MS * 4) {
        bufferRef.current = "";
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      bufferRef.current = "";
    };
  }, [active, onScan]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border ${
          listening
            ? "border-[var(--gv-scan)] text-[var(--gv-scan)]"
            : "border-[var(--gv-line)] text-[var(--gv-ink-dim)]"
        }`}
      >
        <Keyboard size={20} className={listening ? "animate-pulse" : ""} />
      </div>
      <p className="text-sm text-[var(--gv-ink-dim)]">
        {listening ? "Listening for scanner…" : "Scanner input paused"}
      </p>
      <p className="text-xs text-[var(--gv-ink-dim)]/70">
        Scan a ticket with your handheld reader — no need to click anything
      </p>
    </div>
  );
}
