// hooks/useRoomPhase.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomPhase, JoinRoomResult, RoomPublicMeta } from "@/lib/actions/room.actions";

const POLL_MS = 15_000;

export function useRoomPhase(eventId: string, initialPhase: RoomPhase) {
  const [phase, setPhase] = useState<RoomPhase>(initialPhase);
  const [joinResult, setJoinResult] = useState<JoinRoomResult | null>(null);
  const joinInFlight = useRef(false);
  const joinSucceeded = useRef(false);
  const joinBlocked = useRef(false);
  const phaseRef = useRef<RoomPhase>(initialPhase);

  const attemptJoin = useCallback(async () => {
    if (joinInFlight.current || joinSucceeded.current || joinBlocked.current) return;
    joinInFlight.current = true;
    try {
      const res = await fetch(`/api/rooms/${eventId}/join`, { method: "POST" });
      const data: JoinRoomResult = await res.json();
      setJoinResult(data);
      if (data.phase) {
        phaseRef.current = data.phase;
        setPhase(data.phase);
      } else if (data.status === "ok") {
        phaseRef.current = "live";
        setPhase("live");
      }
      if (data.status === "ok") {
        joinSucceeded.current = true;
      } else if (data.reason && data.reason !== "not_started_yet") {
        joinBlocked.current = true;
      }
    } finally {
      joinInFlight.current = false;
    }
  }, [eventId]);

  const refreshPhase = useCallback(async () => {
    const res = await fetch(`/api/rooms/${eventId}/meta`, { cache: "no-store" });
    if (!res.ok) return;

    const data = (await res.json()) as RoomPublicMeta;
    if (!data?.phase) return;

    phaseRef.current = data.phase;
    setPhase(data.phase);

    if (data.phase === "live" && !joinSucceeded.current && !joinBlocked.current) {
      void attemptJoin();
    }
  }, [attemptJoin, eventId]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void attemptJoin(); // initial membership join on mount
      void refreshPhase();
    }, 0);

    const id = setInterval(() => {
      if (phaseRef.current !== "ended") {
        void refreshPhase();
      }
    }, POLL_MS);
    return () => {
      window.clearTimeout(initialTimer);
      clearInterval(id);
    };
  }, [attemptJoin, refreshPhase]);

  return { phase, joinResult, refetch: refreshPhase };
}

// TODO (post-MVP, cost-sensitive): poll faster (e.g. every 4s) specifically
// during "lobby" phase for a snappier lobby→live transition. Deferred for now
// since tighter polling = more requests/server load per waiting attendee.
// Real fix is pushing a "room-started" event via Phase 3's chat channel
// instead of polling at all — do that first if this becomes worth revisiting.
