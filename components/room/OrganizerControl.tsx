// components/room/OrganizerControls.tsx
"use client";

import { useState } from "react";
import type { RoomPhase } from "@/lib/actions/room.actions";

export interface OrganizerControlsProps {
  eventId: string;
  phase: RoomPhase;
  onChanged: () => void; // triggers a refetch in the parent
}

export default function OrganizerControls({ eventId, phase, onChanged }: OrganizerControlsProps) {
  const [pending, setPending] = useState<"start" | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (pending) return;
    setPending("start");
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${eventId}/start`, { method: "POST" });
      if (!res.ok) {
        setError("Couldn't start the meeting — try again.");
        return;
      }
      onChanged();
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(null);
    }
  }

  // Ending the meeting is now handled by LeaveMeetingModal inside
  // LiveRoomScreen (Leave → "End meeting for everyone"), so there's nothing
  // left for this floating control to show once the room is live.
  if (phase === "ended" || phase === "live") return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {error && (
        <p className="rounded-md bg-[#FF5468]/15 px-2 py-1 text-xs text-[#FF5468]">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={pending !== null}
          className="rounded-full bg-[var(--gv-go,#33D6A0)] px-4 py-2 text-sm font-semibold text-[#0A0C10] disabled:opacity-60"
        >
          {pending === "start" ? "Starting…" : "Start meeting"}
        </button>
      </div>
    </div>
  );
}