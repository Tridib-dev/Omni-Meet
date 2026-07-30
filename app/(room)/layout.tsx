import StreamVideoProvider from "@/providers/StreamClientProvider";

export default function RoomRootLayout({ children }: { children: React.ReactNode }) {
  return <StreamVideoProvider>{children}</StreamVideoProvider>;
}
