// components/room/LiveRoomScreen.tsx
"use client";

import { StreamCall, StreamTheme, SpeakerLayout, CallControls, useCallStateHooks } from "@stream-io/video-react-sdk";
import type { Call } from "@stream-io/video-react-sdk";

export interface LiveRoomScreenProps {
  call: Call;
}

function ScheduledEndBanner({ scheduledEnd }: { scheduledEnd: Date }) {
  const { useCallStartsAt } = useCallStateHooks();
  void useCallStartsAt; // placeholder — swap for real "ends in" indicator if needed
  return (
    <div className="border-b border-[#262B35] bg-[#14171D] px-4 py-1.5 text-center text-xs text-[#8891A3]">
      Meeting ends around{" "}
      {scheduledEnd.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
    </div>
  );
}

export default function LiveRoomScreen({ call }: LiveRoomScreenProps) {
  return (
    <StreamCall call={call}>
      <StreamTheme className="min-h-screen bg-[#0A0C10] text-[#F3F5F8]">
        <div className="flex h-screen flex-col">
          <div className="flex-1">
            <SpeakerLayout />
          </div>
          <div className="border-t border-[#262B35] p-3">
            <CallControls />
          </div>
        </div>
      </StreamTheme>
    </StreamCall>
  );
}