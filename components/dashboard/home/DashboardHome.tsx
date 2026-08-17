import { HomeQuickActions } from "@/components/dashboard/home/HomeQuickActions";
import { RecommendedEventsCarousel } from "@/components/dashboard/home/RecommendedEventsCarousel";
import type { DiscoverCard } from "@/lib/discover-events";

type DashboardHomeProps = {
    userName: string;
    userImage?: string;
    recommendedEvents: DiscoverCard[];
};

export function DashboardHome({
    userName,
    userImage,
    recommendedEvents,
}: DashboardHomeProps) {
    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_28%),rgba(255,255,255,0.025)] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] sm:size-14">
                        {userImage ? (
                            // Using a plain img keeps the hero light and avoids introducing another image wrapper.
                            // The avatar is only decorative here, so a lightweight tag is enough.
                            <img
                                src={userImage}
                                alt={userName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-[13px] font-semibold tracking-[0.08em] text-white/80">
                                {userName.slice(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[12px] font-medium text-white/45 sm:text-[13px]">Welcome back</p>
                        <h1 className="truncate text-[24px] font-semibold tracking-[-0.03em] text-white sm:text-[32px] lg:text-[40px]">
                            {userName}
                        </h1>
                    </div>
                </div>

                <div className="mt-6 sm:mt-7">
                    <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                                Recommended events
                            </p>
                            <h2 className="mt-1 text-[18px] font-semibold text-white/90 sm:text-[22px]">
                                A few events worth your next scroll
                            </h2>
                        </div>
                        <p className="hidden text-[12px] text-white/35 sm:block">
                            Bookmark what looks good and come back later.
                        </p>
                    </div>

                    <div className="mt-4">
                        <RecommendedEventsCarousel events={recommendedEvents} />
                    </div>
                </div>
            </section>

            <HomeQuickActions />
        </div>
    );
}
