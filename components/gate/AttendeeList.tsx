"use client";

// components/gate/AttendeeList.tsx
// Search + filter chips + scrollable list of ticket-stub rows.

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import AttendeeRow from "./AttendeeRow";
import { fetchAttendees } from "./gate-client";
import type { GateAttendeeItem } from "@/lib/actions/gate.actions";

export interface AttendeeListProps {
  eventId: string;
  eventSlug: string;
  refreshKey: number;
  onCheckedIn: (ticketId: string) => void;
  variant?: "gate" | "dashboard";
}

type Filter = "all" | "checked-in" | "remaining";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "checked-in", label: "Checked in" },
  { id: "remaining", label: "Remaining" },
];

export default function AttendeeList({ eventId, eventSlug, refreshKey, onCheckedIn, variant = "gate" }: AttendeeListProps) {
  const [attendees, setAttendees] = useState<GateAttendeeItem[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAttendees(eventSlug).then((data) => {
      if (!cancelled) {
        setAttendees(data.attendees);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, eventSlug, refreshKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return attendees.filter((a) => {
      if (filter === "checked-in" && !a.checkedIn) return false;
      if (filter === "remaining" && a.checkedIn) return false;
      if (q && !a.email.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [attendees, query, filter]);

  function handleLocalCheckIn(id: string) {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() } : a))
    );
    onCheckedIn(id);
  }

  if (variant === "dashboard") {
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email…"
              aria-label="Search attendees by name or email"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div className="flex shrink-0 gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.id
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <div role="table" aria-label="Event attendees and check-in status" className="min-w-[1180px]">
            <div role="row" className="grid grid-cols-[minmax(280px,1.7fr)_minmax(170px,1fr)_110px_120px_110px_130px_minmax(150px,auto)] items-center gap-x-5 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              <span role="columnheader">Attendee</span>
              <span role="columnheader">Ticket ID</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Ticket type</span>
              <span role="columnheader">Price</span>
              <span role="columnheader">Registered</span>
              <span role="columnheader" className="text-right">Checked in</span>
            </div>
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-slate-500">No attendees match.</p>
            ) : (
              filtered.map((attendee) => (
                <AttendeeRow key={`${attendee.type}-${attendee.id}`} attendee={attendee} eventId={eventId} onCheckedIn={handleLocalCheckIn} variant="dashboard" />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gv-ink-dim)]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email…"
          aria-label="Search attendees by email"
          className="w-full rounded-lg border border-[var(--gv-line)] bg-[var(--gv-panel-2)] py-2 pl-9 pr-3 text-sm text-[var(--gv-ink)] placeholder:text-[var(--gv-ink-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--gv-scan)]"
        />
      </div>

      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.id
                ? "border-[var(--gv-scan)] bg-[var(--gv-scan)]/10 text-[var(--gv-scan)]"
                : "border-[var(--gv-line)] text-[var(--gv-ink-dim)] hover:text-[var(--gv-ink)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-0.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--gv-panel-2)]" />
          ))
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--gv-ink-dim)]">No attendees match.</p>
        ) : (
          filtered.map((attendee) => (
            <AttendeeRow
              key={attendee.id}
              attendee={attendee}
              eventId={eventId}
              onCheckedIn={handleLocalCheckIn}
            />
          ))
        )}
      </div>
    </div>
  );
}
