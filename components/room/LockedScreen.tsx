// components/room/LockedScreen.tsx
"use client";

export interface LockedScreenProps {
  eventTitle: string;
  bannerUrl?: string;
  lobbyOpensAt: Date;
}

export default function LockedScreen({ eventTitle, bannerUrl, lobbyOpensAt }: LockedScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0C10] px-6 text-center text-[#F3F5F8]">
      {bannerUrl && (
        <img src={bannerUrl} alt={eventTitle} className="h-40 w-full max-w-md rounded-xl object-cover" />
      )}
      <h1 className="text-xl font-semibold">{eventTitle}</h1>
      <p className="text-sm text-[#8891A3]">
        Doors open at{" "}
        {lobbyOpensAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}