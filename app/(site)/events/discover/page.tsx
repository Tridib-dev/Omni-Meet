import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import DiscoverSearchBar from "@/components/DiscoverSearchBar";
import DiscoverTypeToggle from "@/components/DiscoverTypeToggle";
import DiscoverProfileCard from "@/components/DiscoverProfileCard";
import CategoryTabs from "@/components/CategoryTabs";
import DiscoverFilterPanel from "@/components/DiscoverFilterPanel";
import { getDiscoverEvents, type DiscoverCard } from "@/lib/discover-events";
import { getDiscoverProfiles } from "@/lib/discover-profiles";

export const metadata: Metadata = {
    title: "Discover",
    description: "Search developer events and community profiles.",
};

type SearchParams = Promise<{
    q?: string;
    location?: string;
    category?: string;
    tags?: string;
    mode?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    type?: string;
}>;

export default async function DiscoverPage({ searchParams }: { searchParams: SearchParams }) {
    // const params = await searchParams;

    return (
        <section id="discover">
            <div className="discover-header">
                <h1>Discover</h1>
                <Suspense fallback={null}>
                    <DiscoverTypeToggle />
                </Suspense>
                <Suspense fallback={null}>
                    <DiscoverSearchBar />
                </Suspense>
                <Suspense fallback={null}>
                    <CategoryTabs searchParams={searchParams} />
                </Suspense>
            </div>

            <div className="discover-body">
                <Suspense>
                    <DiscoverFilterPanel />
                </Suspense>
                <div className="discover-results">
                    <Suspense fallback={<p className="discover-results-count">Loading events...</p>}>
                        <DiscoverResults searchParams={searchParams} />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}


async function DiscoverResults({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const activeType = params.type === "profiles" ? "profiles" : "events";
 
    const filters = {
        q: params.q,
        location: params.location,
        category: params.category,
        mode: params.mode,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        tags: params.tags?.split(",").filter(Boolean),
        page: params.page ? Number(params.page) : 1,
    };

    if (activeType === "profiles") {
        const { profiles, total, page, totalPages } = await getDiscoverProfiles({
            q: params.q,
            page: params.page ? Number(params.page) : 1,
        });

        const buildPageHref = (targetPage: number) => {
            const sp = new URLSearchParams();
            sp.set("type", "profiles");
            if (params.q) sp.set("q", params.q);
            sp.set("page", String(targetPage));
            return `/events/discover?${sp.toString()}`;
        };

        return (
            <>
                <p className="discover-results-count">
                    {total} profile{total === 1 ? "" : "s"} found
                </p>

                {profiles.length > 0 ? (
                    <div className="discover-profile-grid">
                        {profiles.map((profile) => (
                            <DiscoverProfileCard key={profile.clerkId} profile={profile} />
                        ))}
                    </div>
                ) : (
                    <div className="glass border border-border-dark p-6 text-light-200">
                        No profiles match this search yet.
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="discover-pagination">
                        {page > 1 && (
                            <Link href={buildPageHref(page - 1)} className="discover-pagination-link">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Previous
                            </Link>
                        )}
                        <span>
                            Page {page} of {totalPages}
                        </span>
                        {page < totalPages && (
                            <Link href={buildPageHref(page + 1)} className="discover-pagination-link">
                                Next
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        )}
                    </div>
                )}
            </>
        );
    }
 
    const { events, total, page, totalPages } = await getDiscoverEvents(filters);
 
    const buildPageHref = (targetPage: number) => {
        const sp = new URLSearchParams();
        if (params.type) sp.set("type", params.type);
        if (params.q) sp.set("q", params.q);
        if (params.location) sp.set("location", params.location);
        if (params.category) sp.set("category", params.category);
        if (params.tags) sp.set("tags", params.tags);
        if (params.mode) sp.set("mode", params.mode);
        if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
        if (params.dateTo) sp.set("dateTo", params.dateTo);
        sp.set("page", String(targetPage));
        return `/events/discover?${sp.toString()}`;
    };
 
    return (
        <>
            <p className="discover-results-count">
                {total} event{total === 1 ? "" : "s"} found
            </p>
 
            {events.length > 0 ? (
                <div className="events">
                    {events.map((event: DiscoverCard) => (
                        <EventCard
                          key={event._id}
                          eventId={event._id.toString()}
                          title={event.title}
                          image={event.image}
                          slug={event.slug}
                          location={event.location}
                          date={event.date}
                          time={event.time}
                          mode={event.mode}
                          price={event.price || 0}
                          tags={event.tags}
                          hostName={event.organizer || "Alex Rivera"}
                          organization="DevSphere Community"
                        />
                    ))}
                </div>
            ) : (
                <div className="glass border border-border-dark p-6 text-light-200">
                    No events match these filters yet.
                </div>
            )}
 
            {totalPages > 1 && (
                <div className="discover-pagination">
                    {page > 1 && (
                        <Link href={buildPageHref(page - 1)} className="discover-pagination-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous
                        </Link>
                    )}
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                        <Link href={buildPageHref(page + 1)} className="discover-pagination-link">
                            Next
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
 
