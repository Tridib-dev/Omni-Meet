import { Skeleton } from "@/components/ui/skeleton";

function EventCardSkeleton() {
    return (
        <article className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]" aria-hidden="true">
            <Skeleton className="aspect-[662/320] w-full rounded-none bg-slate-200" />
            <div className="space-y-3 px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-3"><Skeleton className="h-5 w-3/5 bg-slate-200" /><Skeleton className="h-7 w-20 shrink-0 rounded-full bg-slate-200" /></div>
                <div className="flex gap-4"><Skeleton className="h-4 w-16 bg-slate-200" /><Skeleton className="h-4 w-20 bg-slate-200" /></div>
                <Skeleton className="h-4 w-4/5 bg-slate-200" />
                <div className="flex gap-4"><Skeleton className="h-4 w-32 bg-slate-200" /><Skeleton className="h-4 w-16 bg-slate-200" /></div>
                <div className="flex items-end justify-between border-t border-slate-100 pt-3"><div className="space-y-2"><Skeleton className="h-3 w-20 bg-slate-200" /><Skeleton className="h-4 w-36 bg-slate-200" /><Skeleton className="h-6 w-16 rounded-full bg-slate-200" /></div><Skeleton className="h-9 w-28 rounded-xl bg-slate-200" /></div>
            </div>
        </article>
    );
}

function ProfileCardSkeleton() {
    return (
        <article className="discover-profile-skeleton overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]" aria-hidden="true">
            <Skeleton className="discover-profile-skeleton-banner h-10 w-full rounded-none bg-gradient-to-r from-indigo-800 to-indigo-400" />
            <div className="discover-profile-skeleton-content p-4">
                <Skeleton className="discover-profile-skeleton-avatar size-14 shrink-0 rounded-full border-4 border-white bg-slate-200" />
                <div className="discover-profile-skeleton-copy min-w-0 space-y-2"><Skeleton className="h-5 w-32 bg-slate-200" /><Skeleton className="h-3 w-24 bg-slate-200" /><Skeleton className="h-3 w-full bg-slate-200" /><Skeleton className="h-3 w-4/5 bg-slate-200" /></div>
                <div className="discover-profile-skeleton-footer space-y-3 border-t border-slate-100 pt-3"><Skeleton className="h-4 w-28 bg-slate-200" /><Skeleton className="h-9 w-full rounded-xl bg-slate-200" /></div>
            </div>
        </article>
    );
}

export function DiscoverResultsSkeleton({ type }: { type: "events" | "profiles" }) {
    return type === "profiles" ? (
        <div className="space-y-6" role="status" aria-label="Loading profiles"><Skeleton className="h-4 w-28 bg-slate-200" /><div className="discover-profile-grid">{Array.from({ length: 6 }, (_, index) => <ProfileCardSkeleton key={index} />)}</div></div>
    ) : (
        <div className="space-y-6" role="status" aria-label="Loading events"><Skeleton className="h-4 w-24 bg-slate-200" /><div className="events">{Array.from({ length: 6 }, (_, index) => <EventCardSkeleton key={index} />)}</div></div>
    );
}
