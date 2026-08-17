import { HomeQuickActions } from "@/components/dashboard/home/HomeQuickActions";
import { RecommendedEventsCarousel } from "@/components/dashboard/home/RecommendedEventsCarousel";
import type { DiscoverCard } from "@/lib/discover-events";
import Image from "next/image";

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
            <section className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] sm:size-14">
                        {userImage ? (
                            <Image
                                src={userImage}
                                alt={userName}
                                width={56}
                                height={56}
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

                <div className="overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(51,43,224,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_28%),rgba(255,255,255,0.025)] p-3 sm:p-4 lg:p-5">
                    <RecommendedEventsCarousel events={recommendedEvents} />
                </div>
            </section>

            <HomeQuickActions />
        </div>
    );
}
