// components/room/EndedScreen.tsx
"use client";

export default function EndedScreen({ eventTitle }: { eventTitle: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#0A0C10] px-6 text-center text-[#F3F5F8]">
      <h1 className="text-lg font-semibold">{eventTitle}</h1>
      <p className="text-sm text-[#8891A3]">This meeting has ended.</p>
    </div>
  );
}