"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { ProfileCard } from "@/components/profileCard";
import { toggleFollow } from "@/lib/actions/profile.actions";
import type { DiscoverProfileCard as DiscoverProfileCardData } from "@/lib/discover-profiles";

interface DiscoverProfileCardProps {
    profile: DiscoverProfileCardData;
}

export default function DiscoverProfileCard({ profile }: DiscoverProfileCardProps) {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
    const [isPending, startTransition] = useTransition();

    const handleFollow = () => {
        if (profile.isOwner || isPending) return;
        if (!isSignedIn) {
            router.push("/sign-in");
            return;
        }

        startTransition(async () => {
            const previous = isFollowing;
            setIsFollowing(!previous);
            const result = await toggleFollow(profile.clerkId);

            if (!result.success) {
                setIsFollowing(previous);
                return;
            }

            setIsFollowing(result.following ?? !previous);
            router.refresh();
        });
    };

    return (
        <ProfileCard
            href={`/profile/${profile.username}`}
            photo={profile.photo}
            firstName={profile.firstName}
            lastName={profile.lastName}
            username={profile.username}
            bio={profile.bio}
            interests={profile.interests}
            eventsHostedCount={profile.eventsHostedCount}
            isFollowing={profile.isOwner || isFollowing}
            followLabel={profile.isOwner ? "You" : undefined}
            onFollow={handleFollow}
            followDisabled={profile.isOwner || isPending}
            size="compact"
            className="discover-profile-card h-auto border-slate-200 bg-white text-slate-900 shadow-sm"
        />
    );
}
