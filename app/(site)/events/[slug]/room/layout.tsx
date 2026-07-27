// app/(site)/events/[slug]/room/layout.tsx
import StreamVideoProvider from "@/providers/StreamClientProvider";

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return <StreamVideoProvider>{children}</StreamVideoProvider>;
}