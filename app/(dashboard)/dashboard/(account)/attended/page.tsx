// app/(dashboard)/dashboard/attended/page.tsx
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/shell";
import { getUserTickets } from "@/lib/actions/dashboard.actions";
import TicketList from "@/components/dashboard/ticket-list";

export const metadata = { title: "My Tickets — DevEvent" };

export default async function AttendedPage() {
    const tickets = await getUserTickets();

    const upcoming = tickets.filter((t) => t.status === "upcoming");
    const past     = tickets.filter((t) => t.status === "past");
    const expired  = tickets.filter((t) => t.status === "expired");

    return (
        <div>
            <PageHeader
                kicker="Your wallet"
                title="My Tickets"
                description="All your event tickets — upcoming, attended, and expired."
                right={
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-white/50"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
                    </div>
                }
            />

            <Suspense fallback={<TicketSkeleton />}>
                <TicketList upcoming={upcoming} past={past} expired={expired} />
            </Suspense>
        </div>
    );
}

function TicketSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl animate-pulse"
                    style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
        </div>
    );
}