import { currentUser } from "@clerk/nextjs/server";
import { DashboardHome } from "@/components/dashboard/home/DashboardHome";
import { getAttendedAnalytics, getOrganizedAnalytics } from "@/lib/actions/overall-analytics";
import { getDiscoverEvents } from "@/lib/discover-events";
import { getOrganizedEvents, getUserTickets } from "@/lib/actions/dashboard.actions";
import type { UpcomingEventCardItem } from "@/components/dashboard/home/UpcomingEventsSection";

export const metadata = {
    title: "Dashboard Home — DevEvent",
};

export default async function DashboardPage() {
    const [clerkUser, discover, attendedEvents, organizedEvents, attendedAnalytics, organizedAnalytics] = await Promise.all([
        currentUser(),
        getDiscoverEvents({ limit: 8 }),
        getUserTickets(),
        getOrganizedEvents(),
        getAttendedAnalytics(),
        getOrganizedAnalytics(),
    ]);

    const displayName =
        [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
        clerkUser?.fullName ||
        clerkUser?.username ||
        "there";

    const upcomingAttended: UpcomingEventCardItem[] = attendedEvents
        .filter((event) => event.status === "upcoming")
        .slice(0, 6)
        .map((event) => ({
            id: event.id,
            title: event.eventTitle,
            image: event.eventImage,
            slug: event.eventSlug,
            href: `/events/${event.eventSlug}`,
            location: event.eventLocation,
            date: event.eventDate,
            time: event.eventTime,
            organizer: event.eventOrganizer || "Organizer",
            mode: event.eventMode,
            scope: "attended",
        }));

    const upcomingOrganized: UpcomingEventCardItem[] = organizedEvents
        .filter((event) => event.status === "upcoming")
        .slice(0, 6)
            .map((event) => ({
            id: event.id,
            title: event.title,
            image: event.image,
            slug: event.slug,
            href: `/dashboard/events/${event.id}/overview`,
            location: event.location,
            date: event.date,
            time: event.time,
            organizer: displayName,
            organizerImage: clerkUser?.imageUrl ?? "",
            mode: event.mode,
            scope: "organized",
        }));

    return (
        <DashboardHome
            userName={displayName}
            userImage={clerkUser?.imageUrl ?? ""}
            recommendedEvents={discover.events}
            attendedEvents={upcomingAttended}
            organizedEvents={upcomingOrganized}
            personalAnalytics={{
                attended: attendedAnalytics.lifetime,
                organized: organizedAnalytics.totalEvents,
                spendings: attendedAnalytics.totalSpent,
                revenue: organizedAnalytics.totalRevenue,
            }}
            attendedAnalytics={{
                monthlyActivity: attendedAnalytics.monthlyActivity,
                modeBreakdown: attendedAnalytics.modeBreakdown,
                thisMonth: attendedAnalytics.thisMonth,
                thisYear: attendedAnalytics.thisYear,
            }}
            organizedAnalytics={{
                monthlyActivity: organizedAnalytics.monthlyActivity,
                modeBreakdown: organizedAnalytics.modeBreakdown,
                thisMonth: organizedAnalytics.thisMonth,
                thisYear: organizedAnalytics.thisYear,
            }}
            compact
        />
    );
}
