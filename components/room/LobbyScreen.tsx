// components/room/LobbyScreen.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import CountdownTimer from "./CountDownTimer";

export interface LobbyScreenProps {
  eventTitle: string;
  bannerUrl?: string;
  scheduledStart: Date;
  onCountdownComplete: () => void;
}

export default function LobbyScreen({ eventTitle, bannerUrl, scheduledStart, onCountdownComplete }: LobbyScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="lobby"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex min-h-screen flex-col bg-[#0A0C10] text-[#F3F5F8]"
      >
        <div className="flex flex-col items-center gap-3 border-b border-[#262B35] px-6 py-8 text-center">
          {bannerUrl && (
            <img src={bannerUrl} alt={eventTitle} className="h-40 w-full max-w-md rounded-xl object-cover" />
          )}
          <h1 className="text-xl font-semibold">{eventTitle}</h1>
          <p className="text-sm text-[#8891A3]">Meeting starts in</p>
          <CountdownTimer
            target={scheduledStart}
            onComplete={onCountdownComplete}
            className="text-3xl font-bold text-[#4FD1FF]"
          />
          <p className="text-xs text-[#8891A3]">
            The organizer hasn&apos;t started the meeting yet — chat and Q&amp;A are open below.
          </p>
        </div>

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