// components/room/ConnectingScreen.tsx
"use client";

export default function ConnectingScreen({ eventTitle }: { eventTitle: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0A0C10] px-6 text-center text-[#F3F5F8]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4FD1FF] border-t-transparent" />
      <h1 className="text-lg font-semibold">{eventTitle}</h1>
      <p className="text-sm text-[#8891A3]">Joining the room…</p>
    </div>
  );
}