"use client";

// components/gate/ScannerPanel.tsx
// Combines the three scan input methods into one view, and owns the
// verify -> checkin flow triggered by any of them. VerifyResultModal is
// rendered here (as the overlay for scan results), since the component
// plan nests it under the scanner tree.
//
// Flow: any input -> onScan(ticketId) -> GET /api/verify -> show modal.
// If valid -> POST /api/verify/checkin immediately (self-serve gate: a
// valid scan IS the check-in action) -> onCheckedIn() bumps stats/list.

import { useCallback, useRef, useState } from "react";
import { QrCode, Keyboard, Search } from "lucide-react";
import QRScanner from "./QRScanner";
import BarcodeInput from "./BarcodeInput";
import ManualLookup from "./ManualLookup";
import VerifyResultModal from "./VerifyResultModal";
import { verifyTicketClient, checkInTicketClient } from "./gate-client";
import { normalizeScanValue } from "./gate-format";
import type { VerifyTicketResult } from "@/lib/actions/gate.actions";

export interface ScannerPanelProps {
  eventId: string;
  onCheckedIn: () => void;
  variant?: "gate" | "dashboard";
}

type SubTab = "qr" | "barcode" | "manual";

const SUB_TABS: { id: SubTab; label: string; icon: typeof QrCode }[] = [
  { id: "qr", label: "QR Camera", icon: QrCode },
  { id: "barcode", label: "Barcode", icon: Keyboard },
  { id: "manual", label: "Manual", icon: Search },
];

export default function ScannerPanel({ eventId, onCheckedIn, variant = "gate" }: ScannerPanelProps) {
  const [subTab, setSubTab] = useState<SubTab>("qr");
  const [result, setResult] = useState<VerifyTicketResult | null>(null);
  const busyRef = useRef(false);

  const handleScan = useCallback(
    async (ticketId: string) => {
      const cleanId = normalizeScanValue(ticketId);
      if (!cleanId || busyRef.current) return;

      busyRef.current = true;
      try {
        const verifyResult = await verifyTicketClient(cleanId, eventId);
        setResult(verifyResult);

        if (verifyResult.valid && verifyResult.ticket) {
          const checkin = await checkInTicketClient(
            verifyResult.ticket.id,
            verifyResult.ticket.type,
            eventId
          );
          if (checkin.success) {
            onCheckedIn();
          } else {
            // Someone else checked it in between verify and checkin — reflect that.
            setResult({
              valid: false,
              reason: checkin.reason === "unauthorized" ? "unauthorized" : "already_used",
              ticket: verifyResult.ticket,
            });
          }
        }
      } catch {
        setResult({ valid: false, reason: "not_found" });
      } finally {
        busyRef.current = false;
      }
    },
    [eventId, onCheckedIn]
  );

  return (
    <div className="space-y-4">
      <div className={`inline-flex w-full gap-1 rounded-lg border p-1 ${
        variant === "dashboard" ? "border-slate-200 bg-slate-100" : "border-[var(--gv-line)] bg-[var(--gv-panel)]"
      }`}>
        {SUB_TABS.filter((tab) => variant !== "dashboard" || tab.id !== "manual").map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors ${
                variant === "dashboard"
                  ? isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                  : isActive
                    ? "bg-[var(--gv-panel-2)] text-[var(--gv-ink)]"
                    : "text-[var(--gv-ink-dim)] hover:text-[var(--gv-ink)]"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={`rounded-xl border p-3 ${
        variant === "dashboard" ? "border-slate-200 bg-white" : "border-[var(--gv-line)] bg-[var(--gv-panel)]"
      }`}>
        {subTab === "qr" && <QRScanner onScan={handleScan} active={subTab === "qr"} />}
        {subTab === "barcode" && <BarcodeInput onScan={handleScan} active={subTab === "barcode"} />}
        {subTab === "manual" && <ManualLookup eventId={eventId} onCheckedIn={onCheckedIn} />}
      </div>

      <VerifyResultModal result={result} onDismiss={() => setResult(null)} />
    </div>
  );
}
