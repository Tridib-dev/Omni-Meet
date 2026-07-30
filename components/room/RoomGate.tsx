// components/room/RoomGate.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStreamVideoClient, type Call } from "@stream-io/video-react-sdk";
import { useRoomPhase } from "@/hooks/useRoomPhase";
import type { RoomPhase } from "@/lib/actions/room.actions";
import LockedScreen from "./LockedScreen";
import LobbyScreen from "./LobbyScreen";
import LiveRoomScreen from "./LiveRoomScreen";
import EndedScreen from "./EndedScreen";
import OrganizerControls from "./OrganizerControl";
import ConnectingScreen from "./ConnectingScreen";


export interface RoomGateProps {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  bannerUrl?: string;
  initialPhase: RoomPhase;
  scheduledStart: string;
  scheduledEnd: string;
}

export default function RoomGate({
  eventId,
  eventSlug,
  eventTitle,
  bannerUrl,
  initialPhase,
  scheduledStart,
}: RoomGateProps) {
  const client = useStreamVideoClient(); // comes from <StreamVideoProvider> context — no second client
  const router = useRouter();
  const { phase, joinResult, refetch } = useRoomPhase(eventId, initialPhase);
  const isOrganizerTier = joinResult?.role === "organizer" || joinResult?.role === "co-organizer";
  const [call, setCall] = useState<Call | null>(null);
  const joinedCallRef = useRef<Call | null>(null);
  const hasJoinedCallRef = useRef(false);
  const [joinFailedState, setJoinFailedState] = useState(false);
  const [joinAttemptKey, setJoinAttemptKey] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const joinTimeoutRef = useRef<number | null>(null);
  const JOIN_TIMEOUT_MS = 60_000;

  const start = new Date(scheduledStart);
  const lobbyOpensAt = new Date(start.getTime() - 30 * 60_000);
  const callId = joinResult?.callId;
  const callType = joinResult?.callType ?? "event-room";

  const joinFailed = joinFailedState || (joinResult?.status === "denied" && phase === "live");

  useEffect(() => {
    if (phase !== "live" || !client || !callId) return;
    if (joinedCallRef.current) return;

    let cancelled = false;
    const c = client.call(callType, callId);
    joinedCallRef.current = c;
    hasJoinedCallRef.current = false;
    setJoinFailedState(false);

    if (joinTimeoutRef.current !== null) {
      window.clearTimeout(joinTimeoutRef.current);
    }

    joinTimeoutRef.current = window.setTimeout(() => {
      console.error("[RoomGate] join timed out");
      setJoinFailedState(true);
      joinedCallRef.current = null;
    }, JOIN_TIMEOUT_MS);

    c.join({ create: false })
      .then(() => {
        if (cancelled) {
          c.leave().catch(() => {});
          return;
        }
        hasJoinedCallRef.current = true;
        setCall(c);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[RoomGate] join failed", err);
        setJoinFailedState(true);
        joinedCallRef.current = null;
        hasJoinedCallRef.current = false;
      })
      .finally(() => {
        if (joinTimeoutRef.current !== null) {
          window.clearTimeout(joinTimeoutRef.current);
          joinTimeoutRef.current = null;
        }
      });

    return () => {
      cancelled = true;
      if (joinTimeoutRef.current !== null) {
        window.clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
      if (joinedCallRef.current === c) {
        joinedCallRef.current = null;
      }
      if (hasJoinedCallRef.current) {
        c.leave().catch(() => {});
        fetch(`/api/rooms/${eventId}/leave`, { method: "POST", keepalive: true }).catch(() => {});
      }
    };
  }, [phase, client, callId, callType, eventId, joinAttemptKey]);

  async function handleLeave() {
    if (leaving) return;

    setLeaving(true);
    try {
      await call?.leave().catch(() => {});
      await fetch(`/api/rooms/${eventId}/leave`, { method: "POST" }).catch(() => {});
    } finally {
      joinedCallRef.current = null;
      setCall(null);
      setLeaving(false);
      router.push(`/events/${eventSlug}`);
    }
  }

  let screen: React.ReactNode;
  if (phase === "locked") {
    screen = <LockedScreen eventTitle={eventTitle} bannerUrl={bannerUrl} lobbyOpensAt={lobbyOpensAt} />;
  } else if (phase === "lobby") {
    screen = (
      <LobbyScreen eventTitle={eventTitle} bannerUrl={bannerUrl} scheduledStart={start} onCountdownComplete={refetch} />
    );
  } else if (phase === "live") {
    screen = joinFailed ? (
      <div className="space-y-4">
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0A0C10] px-6 text-center text-[#F3F5F8]">
          <p className="text-sm text-[#8891A3]">Couldn&apos;t connect to the meeting.</p>
          <p className="max-w-sm text-xs text-[#8891A3]">
            Check your network connection and try again. If it still fails, the room may not be ready yet.
          </p>
          <button
            onClick={() => {
              setJoinFailedState(false);
              setCall(null);
              joinedCallRef.current = null;
              setJoinAttemptKey((current) => current + 1);
              refetch();
            }}
            className="rounded-full bg-[#4FD1FF] px-4 py-2 text-sm font-semibold text-[#0A0C10]"
          >
            Try again
          </button>
        </div>
      </div>
    ) : call ? (
      <LiveRoomScreen
        call={call}
        onLeave={handleLeave}
        eventId={eventId}
        showDeviceControls={isOrganizerTier}
        canModerate={isOrganizerTier}
        eventTitle={eventTitle}
      />
    ) : (
      <ConnectingScreen eventTitle={eventTitle} />
    );
  } else {
    screen = <EndedScreen eventTitle={eventTitle} />;
  }

  return (
    <>
      {screen}
      {isOrganizerTier && <OrganizerControls eventId={eventId} phase={phase} onChanged={refetch} />}
    </>
  );
}
