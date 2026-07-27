// hooks/useRoomPhase.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomPhase, JoinRoomResult } from "@/lib/actions/room.actions";

const POLL_MS = 15_000;

export function useRoomPhase(eventId: string, initialPhase: RoomPhase) {
  const [phase, setPhase] = useState<RoomPhase>(initialPhase);
  const [joinResult, setJoinResult] = useState<JoinRoomResult | null>(null);
  const inFlight = useRef(false);

  const refetch = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch(`/api/rooms/${eventId}/join`, { method: "POST" });
      const data: JoinRoomResult = await res.json();
      setJoinResult(data);
      if (data.phase) setPhase(data.phase);
      else if (data.status === "ok") setPhase("live");
    } finally {
      inFlight.current = false;
    }
  }, [eventId]);

  useEffect(() => {
    refetch(); // initial join attempt on mount
    const id = setInterval(() => {
      // Only bother polling while phase could still change —
      // no point polling once "ended".
      setPhase((p) => {
        if (p !== "ended") refetch();
        return p;
      });
    }, POLL_MS);
    return () => clearInterval(id);
  }, [refetch]);

  return { phase, joinResult, refetch };
}

// TODO (post-MVP, cost-sensitive): poll faster (e.g. every 4s) specifically
// during "lobby" phase for a snappier lobby→live transition. Deferred for now
// since tighter polling = more requests/server load per waiting attendee.
// Real fix is pushing a "room-started" event via Phase 3's chat channel
// instead of polling at all — do that first if this becomes worth revisiting.