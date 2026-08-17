import { currentUser } from "@clerk/nextjs/server";
import { DashboardHome } from "@/components/dashboard/home/DashboardHome";
import { getDiscoverEvents } from "@/lib/discover-events";

export const metadata = {
    title: "Dashboard Home — DevEvent",
};

export default async function DashboardPage() {
    const [clerkUser, discover] = await Promise.all([
        currentUser(),
        getDiscoverEvents({ limit: 8 }),
    ]);

    const displayName =
        [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
        clerkUser?.fullName ||
        clerkUser?.username ||
        "there";

    return (
        <DashboardHome
            userName={displayName}
            userImage={clerkUser?.imageUrl ?? ""}
            recommendedEvents={discover.events}
        />
    );
}
