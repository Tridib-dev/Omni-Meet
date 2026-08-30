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
                title="Your Events"
                description="Events you've created and are managing."
                right={
                    <Link
                        href="/create_event"
                        className="flex items-center gap-2 rounded-xl border border-[#332be0]/30 bg-[#332be0] px-4 py-2 text-[13px] font-medium text-white shadow-[0_8px_20px_rgba(51,43,224,0.22)] transition-all hover:bg-[#2b24c8] active:scale-95"
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
