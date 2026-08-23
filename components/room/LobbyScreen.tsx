// components/room/LobbyScreen.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import CountdownTimer from "./CountDownTimer";
import PreMeetingUpdates from "./PreMeetingUpdates";

export interface LobbyScreenProps {
  eventId: string;
  eventTitle: string;
  bannerUrl?: string;
  scheduledStart: Date;
  onCountdownComplete: () => void;
  canModerate: boolean;  
}

export default function LobbyScreen({
  eventId,
  eventTitle,
  bannerUrl,
  scheduledStart,
  onCountdownComplete,
  canModerate, 
}: LobbyScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="lobby"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex min-h-screen flex-col bg-[#0A0C10] text-[#F3F5F8]"
      >
        <div className="flex flex-col items-center gap-4 border-b border-[#262B35] px-6 pb-8 pt-10 text-center sm:pt-14">
          {bannerUrl && (
            <img src={bannerUrl} alt={eventTitle} className="h-48 w-full max-w-lg rounded-2xl object-cover shadow-[0_14px_30px_rgba(0,0,0,0.35)] sm:h-52" />
          )}
          <h1 className="text-xl font-semibold sm:text-2xl">{eventTitle}</h1>
          <p className="text-sm text-[#8891A3]">The meeting will start from</p>
          <CountdownTimer
            target={scheduledStart}
            onComplete={onCountdownComplete}
            className="text-3xl font-bold text-[#4f46e5] sm:text-4xl"
          />
          <p className="text-xs text-[#8891A3]">
            The organizer hasn&apos;t started the meeting yet — chat and Q&amp;A are open below.
          </p>
        </div>

        <PreMeetingUpdates eventId={eventId} canModerate={canModerate} />

        {/* Chat + Q&A slots — wired up in Phase 3/4 */}
        <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#262B35] bg-[#14171D] p-4 text-sm text-[#8891A3]">
            Live chat (Phase 3)
          </div>
          <div className="rounded-xl border border-[#262B35] bg-[#14171D] p-4 text-sm text-[#8891A3]">
            Q&amp;A (Phase 4)
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}