"use client";

import { ReactNode, useEffect, useMemo, useSyncExternalStore } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const userId = user?.id ?? null;
  const userName = user?.fullName ?? user?.username ?? userId ?? undefined;
  const userImage = user?.imageUrl ?? undefined;

  const videoClient = useMemo<StreamVideoClient | null>(() => {
    if (!isLoaded || !userId) {
      return null;
    }

    if (!apiKey) {
      throw new Error("[Stream Room Setup]: Stream API key missing");
    }

    return StreamVideoClient.getOrCreateInstance({
      apiKey,
      user: {
        id: userId,
        name: userName,
        image: userImage,
      },
      tokenProvider: async () => {
        const res = await fetch("/api/stream/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("[Stream]: failed to fetch user token");
        }

        return await res.text();
      },
      options: {
        maxConnectUserRetries: 3,
        onConnectUserError: (err) => {
          console.error("[StreamVideoProvider] connectUser failed", err);
        },
      },
    });
  }, [isLoaded, userId, userName, userImage]);

  const connectedUser = useSyncExternalStore(
    (onStoreChange) => {
      if (!videoClient) {
        return () => {};
      }

      const subscription = videoClient.state.connectedUser$.subscribe(() => {
        onStoreChange();
      });

      return () => {
        subscription.unsubscribe();
      };
    },
    () => videoClient?.state.connectedUser,
    () => undefined,
  );

  useEffect(() => {
    return () => {
      videoClient?.disconnectUser();
    };
  }, [videoClient]);

  if (!videoClient || !connectedUser) {
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
