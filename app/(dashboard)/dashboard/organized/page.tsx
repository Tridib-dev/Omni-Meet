// app/(dashboard)/dashboard/organized/page.tsx
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/shell";
import OrganizedEventsTabs from "@/components/dashboard/organized-events-tabs";
import { getCoOrganizedEvents, getOrganizedEvents } from "@/lib/actions/dashboard.actions";

export const metadata = { title: "My Events — DevEvent" };

export default async function OrganizedPage() {
    const [organizedEvents, coOrganizedEvents] = await Promise.all([
        getOrganizedEvents(),
        getCoOrganizedEvents(),
    ]);

    return (
        <div>
            <PageHeader
                kicker="Your events"
                title="My Events"
                description="Events you've created and are managing."
                right={
                    <Link
                        href="/create_event"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
                        </svg>
                        Create Event
                    </Link>
                }
            />

            <OrganizedEventsTabs
                organizedEvents={organizedEvents}
                coOrganizedEvents={coOrganizedEvents}
            />
        </div>
    );
}
