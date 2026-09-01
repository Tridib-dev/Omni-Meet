import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import FigmaEventCardV2 from "@/components/FigmaEventCardV2";
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
    return (
        <section id="discover" className="discover-page">
            <div className="discover-header">
                <div className="discover-hero">
                    <div className="discover-heading-row">
                        <div className="discover-hero-copy">
                            <p className="discover-eyebrow">Explore the community</p>
                            <h1>Discover</h1>
                            <p className="discover-intro">Find your next event, connect with people, and stay close to what is happening in the developer community.</p>
                        </div>
                        <Suspense fallback={null}><DiscoverTypeToggle /></Suspense>
                    </div>
                    <div className="discover-hero-art" aria-hidden="true"><span className="discover-hero-orbit discover-hero-orbit-one" /><span className="discover-hero-orbit discover-hero-orbit-two" /><span className="discover-hero-dot discover-hero-dot-one" /><span className="discover-hero-dot discover-hero-dot-two" /><span className="discover-hero-art-label">Find your next thing</span></div>
                </div>
                <Suspense fallback={null}><DiscoverSearchBar /></Suspense>
                <Suspense fallback={null}><CategoryTabs searchParams={searchParams} /></Suspense>
            </div>

            <div className="discover-body">
                <Suspense><DiscoverFilterPanel /></Suspense>
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
        const { profiles, total, page, totalPages } = await getDiscoverProfiles({ q: params.q, page: params.page ? Number(params.page) : 1 });
        const buildPageHref = (targetPage: number) => {
            const sp = new URLSearchParams();
            sp.set("type", "profiles");
            if (params.q) sp.set("q", params.q);
            sp.set("page", String(targetPage));
            return `/events/discover?${sp.toString()}`;
        };

        return <>
            <p className="discover-results-count">{total} profile{total === 1 ? "" : "s"} found</p>
            {profiles.length > 0 ? <div className="discover-profile-grid">{profiles.map((profile) => <DiscoverProfileCard key={profile.clerkId} profile={profile} />)}</div> : <DiscoverEmptyState query={params.q} subject="profiles" />}
            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} buildPageHref={buildPageHref} />}
        </>;
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

    return <>
        <p className="discover-results-count">{total} event{total === 1 ? "" : "s"} found</p>
        {events.length > 0 ? <div className="events">{events.map((event: DiscoverCard) => <FigmaEventCardV2 key={event._id} eventId={event._id.toString()} title={event.title} image={event.image} slug={event.slug} category={event.category} venue={event.location} date={event.date} time={event.time} mode={event.mode} price={event.price || 0} organizer={event.organizer || "DevSphere Community"} organizationName={event.organizer || "DevSphere Community"} organizers={event.organizers} />)}</div> : <DiscoverEmptyState query={params.q} subject="events" />}
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} buildPageHref={buildPageHref} />}
    </>;
}

function DiscoverEmptyState({ query, subject }: { query?: string; subject: "events" | "profiles" }) {
    const caption = query?.trim() ? `No search result for “${query.trim()}”` : `No ${subject} found with these filters`;

    return (
        <div className="discover-empty-state" role="status">
            <Image src="/illustrations/no_notification.svg" alt="" width={190} height={190} className="discover-empty-illustration" />
            <h2>No results found</h2>
            <p>{caption}</p>
            {/* Future recommendation slot: add a “Did you mean?” section here. */}
        </div>
    );
}

function Pagination({ page, totalPages, buildPageHref }: { page: number; totalPages: number; buildPageHref: (page: number) => string }) {
    return <div className="discover-pagination">
        {page > 1 && <Link href={buildPageHref(page - 1)} className="discover-pagination-link">← Previous</Link>}
        <span>Page {page} of {totalPages}</span>
        {page < totalPages && <Link href={buildPageHref(page + 1)} className="discover-pagination-link">Next →</Link>}
    </div>;
}
