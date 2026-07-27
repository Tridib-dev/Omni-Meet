// components/room/RoomGate.tsx
"use client";

import { useEffect, useState } from "react";
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
  eventTitle: string;
  bannerUrl?: string;
  initialPhase: RoomPhase;
  scheduledStart: string;
  scheduledEnd: string;
}

export default function RoomGate({ eventId, eventTitle, bannerUrl, initialPhase, scheduledStart, scheduledEnd }: RoomGateProps) {
  const client = useStreamVideoClient(); // comes from <StreamVideoProvider> context — no second client
  const { phase, joinResult, refetch } = useRoomPhase(eventId, initialPhase);
  const isOrganizerTier = joinResult?.role === "organizer" || joinResult?.role === "co-organizer";
  const [call, setCall] = useState<Call | null>(null);

  const start = new Date(scheduledStart);
  const lobbyOpensAt = new Date(start.getTime() - 30 * 60_000);

  useEffect(() => {
    if (phase !== "live" || !client || !joinResult?.callId) return;
    if (call) return;

    const c = client.call(joinResult.callType ?? "event-room", joinResult.callId);
    c.join({ create: false })
      .then(() => setCall(c))
      .catch((err) => console.error("[RoomGate] join failed", err));

    return () => {
      c.leave().catch(() => {});
      fetch(`/api/rooms/${eventId}/leave`, { method: "POST", keepalive: true }).catch(() => {});
    };
  }, [phase, client, joinResult, call, eventId]);

  let screen: React.ReactNode;
  if (phase === "locked") {
    screen = <LockedScreen eventTitle={eventTitle} bannerUrl={bannerUrl} lobbyOpensAt={lobbyOpensAt} />;
  } else if (phase === "lobby") {
    screen = (
      <LobbyScreen eventTitle={eventTitle} bannerUrl={bannerUrl} scheduledStart={start} onCountdownComplete={refetch} />
    );
  } else if (phase === "live") {
    screen = call ? (
      <LiveRoomScreen call={call} />
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