"use client";

// components/gate/QRScanner.tsx
// Camera QR scanning via html5-qrcode. Ticket type is unknown from the QR
// itself — the scanned URL only carries the ticket id, and /api/verify
// resolves whether it's a booking or an order server-side.
//
// npm install html5-qrcode

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CameraOff } from "lucide-react";

export interface QRScannerProps {
  onScan: (ticketId: string) => void;
  active: boolean;
}

const REGION_ID = "gate-qr-region";

function extractTicketId(rawValue: string): string | null {
  try {
    const url = new URL(rawValue);
    return url.searchParams.get("id") ?? url.searchParams.get("ticketId");
  } catch {
    // Not a URL — assume the raw scanned value IS the ticket id.
    return rawValue.trim() || null;
  }
}

export default function QRScanner({ onScan, active }: QRScannerProps) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastScanRef = useRef<{ value: string; at: number }>({ value: "", at: 0 });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const instance = new Html5Qrcode(REGION_ID, { verbose: false });
        scannerRef.current = instance;

        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            const now = Date.now();
            // Debounce identical scans within 3s so one held-up QR doesn't spam.
            if (decodedText === lastScanRef.current.value && now - lastScanRef.current.at < 3000) {
              return;
            }
            lastScanRef.current = { value: decodedText, at: now };

            const ticketId = extractTicketId(decodedText);
            if (ticketId) onScan(ticketId);
          },
          () => {
            // per-frame decode failures are expected while aiming — ignore.
          }
        );

        startedRef.current = true;
        if (!cancelled) setRunning(true);
      } catch (err) {
        if (!(err instanceof Error && err.name === "NotAllowedError")) {
          console.error("[QRScanner]", err);
        }
        if (!cancelled) setError("Couldn't access camera. Check permissions.");
      }
    }

    start();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance && startedRef.current) {
        try {
          void instance.stop().then(() => instance.clear()).catch(() => {});
        } catch {
          void instance.clear().catch(() => {});
        }
      }
      startedRef.current = false;
      scannerRef.current = null;
      setRunning(false);
    };
  }, [active, onScan]);

  return (
    <div className="space-y-2">
      <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl border border-[var(--gv-line)] bg-black">
        <div id={REGION_ID} className="h-full w-full" />
        {running && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-3 h-0.5 rounded-full bg-[var(--gv-scan)] shadow-[0_0_8px_2px_var(--gv-scan)]"
            animate={{ top: ["8%", "92%", "8%"] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--gv-stop)]">
          <CameraOff size={13} /> {error}
        </p>
      )}
      {running && (
        <p className="text-center text-xs text-[var(--gv-ink-dim)]">
          Point the camera at a ticket QR code
        </p>
      )}
    </div>
  );
}
