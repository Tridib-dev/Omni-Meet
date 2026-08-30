// app/(dashboard)/dashboard/saved/page.tsx
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/shell";
import { getSavedEvents } from "@/lib/actions/watchlist.actions";
import EventCardV2 from "@/components/EventCardV2";

export const metadata = { title: "Saved Events — DevEvent" };

type SavedEventItem = {
    _id: string;
    eventId: {
        _id?: string;
        slug: string;
        title: string;
        description?: string;
        image: string;
        category?: string;
        location: string;
        date: string;
        tags?: string[];
        price?: number;
    } | null;
};

export default async function SavedPage() {
    const saved = (await getSavedEvents()) as SavedEventItem[];

    return (
        <div>
            <PageHeader
                title="Your collection"
                description="Events you've bookmarked to attend later."
                right={
                    saved.length > 0 ? (
                        <span className="font-mono text-[12px] text-slate-500">{saved.length} saved</span>
                    ) : undefined
                }
            />

            {saved.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-4xl mb-3">🔖</span>
                    <p className="text-[14px] font-medium text-slate-700">Nothing saved yet</p>
                    <p className="mt-1 text-[12px] text-slate-500">Hit the bookmark icon on any event to save it here.</p>
                    <Link
                        href="/events/discover"
                        className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-[12px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                        Browse events →
                    </Link>
                </div>
            ) : (
                <div className="grid gap-3">
                    {saved.map((item) => {
                        const ev = item.eventId;
                        if (!ev) return null;

                        return (
                            <EventCardV2
                                key={item._id}
                                eventId={ev._id ?? item._id}
                                slug={ev.slug}
                                title={ev.title}
                                description={ev.description ?? ""}
                                image={ev.image}
                                category={ev.category}
                                location={ev.location}
                                date={ev.date}
                                tags={ev.tags ?? []}
                                price={ev.price ?? 0}
                                isSaved
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
