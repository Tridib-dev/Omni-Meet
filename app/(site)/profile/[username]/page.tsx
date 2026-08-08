// app/(site)/profile/[username]/page.tsx

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/actions/profile.actions";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SocialGrid from "@/components/profile/SocialGrid";
import EventsSection from "@/components/profile/EventsSection";
import BadgesSection from "@/components/profile/BadgesSection";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    return {
        title: `@${username} — DevEvent`,
    };
}

export default function PublicProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    return (
        <Suspense fallback={<ProfilePageSkeleton />}>
            <ProfilePageContent params={params} />
        </Suspense>
    );
}

async function ProfilePageContent({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const profile = await getPublicProfile(username);

    if (!profile) notFound();

    return (
        <section className="mx-auto max-w-2xl px-4 py-10 pb-24">
            {/* Header: banner, avatar, name, bio, follow, share */}
            <ProfileHeader
                clerkId={profile.clerkId}
                firstName={profile.firstName}
                lastName={profile.lastName}
                username={profile.username}
                photo={profile.photo}
                bio={profile.bio}
                followersCount={profile.followersCount}
                followingCount={profile.followingCount}
                attendedCount={profile.attendedCount}
                organizedCount={profile.eventsHostedCount}
                isFollowing={profile.isFollowing}
                isOwner={profile.isOwner}
            />

            {/* Divider */}
            <div className="my-8" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

            {/* Social accounts */}
            <SocialGrid
                accounts={profile.socialAccounts}
                isOwner={profile.isOwner}
            />

            <div className="my-8" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

            {/* Events: Attended + Organized tabs */}
            <EventsSection
                attendedEvents={profile.attendedEvents}
                organizedEvents={profile.organizedEvents}
            />

            <div className="my-8" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

            {/* Badges */}
            <BadgesSection badges={profile.badges} />
        </section>
    );
}

function ProfilePageSkeleton() {
    return (
        <section className="mx-auto max-w-2xl px-4 py-10 pb-24">
            <div className="space-y-8">
                <div className="relative mb-12">
                    <div
                        className="h-[140px] rounded-2xl animate-pulse"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                    />
                    <div
                        className="absolute -bottom-10 left-6 h-20 w-20 rounded-full animate-pulse"
                        style={{ background: "rgba(255,255,255,0.08)", border: "4px solid #080c10" }}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="h-6 w-40 rounded-lg animate-pulse bg-white/10" />
                        <div className="h-4 w-24 rounded-lg animate-pulse bg-white/5" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-28 rounded-lg animate-pulse bg-white/10" />
                        <div className="h-9 w-20 rounded-lg animate-pulse bg-white/5" />
                    </div>
                    <div className="flex gap-6">
                        <div className="h-4 w-20 rounded-full animate-pulse bg-white/[0.08]" />
                        <div className="h-4 w-20 rounded-full animate-pulse bg-white/[0.08]" />
                        <div className="h-4 w-20 rounded-full animate-pulse bg-white/[0.08]" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded-lg animate-pulse bg-white/5" />
                        <div className="h-4 w-4/5 rounded-lg animate-pulse bg-white/5" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="h-5 w-32 rounded-lg animate-pulse bg-white/[0.08]" />
                    <div className="grid gap-3 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-28 rounded-2xl animate-pulse"
                                style={{ background: "rgba(255,255,255,0.04)" }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
