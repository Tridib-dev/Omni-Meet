"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DiscoverCard } from "@/lib/discover-events";
import HorizontalScrollProgress from "@/components/event-dashboard/shared/HorizontalScrollProgress";
import { RecommendedEventCard } from "@/components/dashboard/home/RecommendedEventCard";
import { cn } from "@/lib/utils";

type Props = {
    events: DiscoverCard[];
};

export function RecommendedEventsCarousel({ events }: Props) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [canScroll, setCanScroll] = useState(false);

    const visibleEvents = useMemo(() => events.slice(0, 8), [events]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const update = () => {
            const overflow = viewport.scrollWidth - viewport.clientWidth > 8;
            setCanScroll(overflow);
        };

        const onScroll = () => {
            const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
            let nextIndex = 0;
            let smallestDistance = Number.POSITIVE_INFINITY;

            cardRefs.current.forEach((card, index) => {
                if (!card) return;
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(cardCenter - viewportCenter);
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    nextIndex = index;
                }
            });

            setActiveIndex(nextIndex);
        };

        update();
        viewport.addEventListener("scroll", onScroll, { passive: true });

        const observer = new ResizeObserver(() => {
            update();
            onScroll();
        });
        observer.observe(viewport);

        return () => {
            viewport.removeEventListener("scroll", onScroll);
            observer.disconnect();
        };
    }, [visibleEvents.length]);

    const scrollToIndex = (index: number) => {
        const target = cardRefs.current[index];
        const viewport = viewportRef.current;
        if (!target || !viewport) return;

        const offset = target.offsetLeft - 16;
        viewport.scrollTo({ left: Math.max(offset, 0), behavior: "smooth" });
        setActiveIndex(index);
    };

    const scrollByCard = (direction: -1 | 1) => {
        const nextIndex = Math.min(
            Math.max(activeIndex + direction, 0),
            Math.max(visibleEvents.length - 1, 0)
        );
        scrollToIndex(nextIndex);
    };

    return (
        <div className="space-y-3">
            <HorizontalScrollProgress
                className="space-y-4"
                viewportRef={viewportRef}
                contentClassName="overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                <div
                    className={cn(
                        "grid grid-flow-col items-stretch gap-4 pb-1",
                        "auto-cols-[minmax(260px,86vw)] sm:auto-cols-[minmax(320px,60vw)] lg:auto-cols-[minmax(360px,32vw)]"
                    )}
                >
                    {visibleEvents.length > 0 ? (
                        visibleEvents.map((event, index) => (
                            <div
                                key={event._id.toString()}
                                ref={(node) => {
                                    cardRefs.current[index] = node;
                                }}
                                className="h-full"
                            >
                                <RecommendedEventCard event={event} index={index} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
                            <p className="text-[14px] font-medium text-white/65">No recommended events yet.</p>
                            <p className="mt-1 text-[12px] text-white/35">We’ll surface event suggestions here once they’re available.</p>
                        </div>
                    )}
                </div>
            </HorizontalScrollProgress>

            <div className="flex items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={() => scrollByCard(-1)}
                    disabled={!canScroll}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/75 transition-colors hover:border-[#332be0]/25 hover:bg-[rgba(51,43,224,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous recommended event"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1.5">
                    {visibleEvents.map((event, index) => (
                        <button
                            key={event._id.toString()}
                            type="button"
                            onClick={() => scrollToIndex(index)}
                            className={cn(
                                "h-2.5 rounded-full transition-all duration-200",
                                index === activeIndex
                                    ? "w-6 bg-[#332be0] shadow-[0_0_0_4px_rgba(51,43,224,0.10)]"
                                    : "w-2.5 bg-white/20 hover:bg-white/30"
                            )}
                            aria-label={`Go to recommended event ${index + 1}`}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => scrollByCard(1)}
                    disabled={!canScroll}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/75 transition-colors hover:border-[#332be0]/25 hover:bg-[rgba(51,43,224,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next recommended event"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
