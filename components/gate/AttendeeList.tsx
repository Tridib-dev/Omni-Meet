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
}

type Filter = "all" | "checked-in" | "remaining";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "checked-in", label: "Checked in" },
  { id: "remaining", label: "Remaining" },
];

export default function AttendeeList({ eventId, eventSlug, refreshKey, onCheckedIn }: AttendeeListProps) {
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
      if (q && !a.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [attendees, query, filter]);

  function handleLocalCheckIn(id: string) {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() } : a))
    );
    onCheckedIn(id);
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
          className="w-full rounded-lg border border-[var(--gv-line)] bg-[var(--gv-panel-2)] py-2 pl-9 pr-3 text-sm text-[var(--gv-ink)] placeholder:text-[var(--gv-ink-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--gv-scan)]"
        />
      </div>

      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
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
