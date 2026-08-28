"use client";

import { useCallback, useState } from "react";
import { ScanLine, X } from "lucide-react";
import GateStats from "./GateStats";
import ScannerPanel from "./ScannerPanel";
import AttendeeList from "./AttendeeList";
import { Button } from "@/components/ui/button";
import TicketsIllustration from "@/components/create-event/illustrations/TicketsIllustration";
import OrganizerIllustration from "@/components/create-event/illustrations/OrganizerIllustration";

export default function DashboardGate({ eventId, eventSlug }: { eventId: string; eventSlug: string }) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCheckedIn = useCallback(() => setRefreshKey((current) => current + 1), []);

  return (
    <div
      className="relative"
      style={
        {
          "--gv-bg": "#ffffff",
          "--gv-panel": "#ffffff",
          "--gv-panel-2": "#f8fafc",
          "--gv-line": "#e2e8f0",
          "--gv-ink": "#0f172a",
          "--gv-ink-dim": "#64748b",
          "--gv-go": "#16a34a",
          "--gv-stop": "#dc2626",
          "--gv-wait": "#d97706",
          "--gv-scan": "#332be0",
        } as React.CSSProperties
      }
    >
      <div>
        <GateStats eventSlug={eventSlug} refreshKey={refreshKey} variant="dashboard" />
      </div>

      <div className="relative mt-5 min-h-[218px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-8 shadow-sm sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -left-2 top-1/2 hidden h-36 w-36 -translate-y-1/2 rotate-[-8deg] opacity-70 md:block lg:left-8" aria-hidden="true">
          <TicketsIllustration />
        </div>
        <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-36 w-36 -translate-y-1/2 rotate-[8deg] opacity-70 md:block lg:right-8" aria-hidden="true">
          <OrganizerIllustration />
        </div>

        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center text-center">
          <p className="text-base font-bold text-slate-900 sm:text-lg">Ready to check people in?</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">Open the scanner when your team is ready to process tickets.</p>
          <Button type="button" onClick={() => setScannerOpen(true)} className="mt-10 min-h-12 w-full min-w-[220px] bg-slate-900 px-9 py-3.5 text-base hover:bg-slate-600 sm:w-auto">
            <ScanLine />
            Open scanner
          </Button>
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Attendees</h3>
          <p className="mt-1 text-xs text-slate-500">Review registrations and manage check-in status.</p>
        </div>
        <AttendeeList
          eventId={eventId}
          eventSlug={eventSlug}
          refreshKey={refreshKey}
          onCheckedIn={() => handleCheckedIn()}
          variant="dashboard"
        />
      </section>

      {scannerOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-scanner-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setScannerOpen(false);
          }}
        >
          <div className="max-h-[min(720px,calc(100vh-2rem))] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600">Gate scanner</p>
                <h3 id="gate-scanner-title" className="mt-1 text-xl font-semibold text-slate-900">Scan a ticket</h3>
                <p className="mt-1 text-sm text-slate-500">QR is selected by default. Switch to Barcode for a handheld reader.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setScannerOpen(false)} aria-label="Close scanner">
                <X />
              </Button>
            </div>
            <ScannerPanel eventId={eventId} onCheckedIn={handleCheckedIn} variant="dashboard" />
          </div>
        </div>
      )}
    </div>
  );
}
