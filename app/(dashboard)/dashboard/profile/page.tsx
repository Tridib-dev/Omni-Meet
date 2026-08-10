// app/(dashboard)/dashboard/profile/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPublicProfileByClerkId } from "@/lib/actions/profile.actions";
import { upsertUserFromClerk } from "@/lib/actions/user.actions";
import { PageHeader } from "@/components/dashboard/shell";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SocialGrid from "@/components/profile/SocialGrid";
import EventsSection from "@/components/profile/EventsSection";
import BadgesSection from "@/components/profile/BadgesSection";
import Link from "next/link";

export const metadata = { title: "Profile — DevEvent" };

export default async function OwnerProfilePage() {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    let profile = await getPublicProfileByClerkId(clerkUser.id);

    if (!profile) {
        await upsertUserFromClerk(clerkUser);
        profile = await getPublicProfileByClerkId(clerkUser.id);
    }

    // If user not in DB yet (webhook delay), show a waiting state
    if (!profile) {
        return (
            <div>
                <PageHeader kicker="Your identity" title="Profile" />
                <div
                    className="rounded-2xl px-6 py-8 text-center"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                    <p className="text-[14px] text-white/50 mb-2">Setting up your profile…</p>
                    <p className="text-[12px] text-white/25">This usually takes a few seconds after signing up.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                kicker="Your identity"
                title="Profile"
                right={
                    <Link
                        href={`/profile/${profile.username}`}
                        className="text-[12px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"
                    >
                        View public profile
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
                        </svg>
                    </Link>
                }
            />

            {/* Same components, isOwner=true unlocks edit controls */}
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
                isFollowing={false}
                isOwner={true}
            />

            <div className="my-8" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

            <SocialGrid
                accounts={profile.socialAccounts}
                isOwner={true}
            />

            <div className="my-8" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

            <EventsSection
                attendedEvents={profile.attendedEvents}
                organizedEvents={profile.organizedEvents}
                coOrganizedEvents={profile.coOrganizedEvents}
            />

            <div className="my-8" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

            <BadgesSection badges={profile.badges} />
        </div>
    );
}
