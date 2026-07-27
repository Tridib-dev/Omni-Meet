"use client";

import { ReactNode, useMemo, useEffect } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { tokenProvider } from "@/lib/actions/stream.actions";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();

  // Derived value, not a subscription — useMemo, not useEffect+setState.
  const videoClient = useMemo(() => {
    if (!isLoaded || !user) return undefined;
    if (!apiKey) throw new Error("[Stream Room Setup]: Stream API key missing");

    return new StreamVideoClient({
      apiKey,
      user: {
        id: user.id,
        name: user.fullName ?? user.username ?? user.id,
        image: user.imageUrl,
      },
      tokenProvider,
    });
  }, [isLoaded,user]);

  // The actual side effect: clean up the connection when the client changes/unmounts.
  useEffect(() => {
    return () => {
      videoClient?.disconnectUser();
    };
  }, [videoClient]);

  if (!videoClient) {
    return (
      <div className="flex-center h-screen w-full">
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default StreamVideoProvider;