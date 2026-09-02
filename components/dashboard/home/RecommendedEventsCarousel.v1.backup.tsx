"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { DiscoverCard } from "@/lib/discover-events";
import { RecommendedEventCard } from "@/components/dashboard/home/RecommendedEventCard";
import { cn } from "@/lib/utils";

type Props = {
    events: DiscoverCard[];
    compact?: boolean;
};

export function RecommendedEventsCarousel({ events, compact = false }: Props) {
    const visibleEvents = useMemo(() => events.slice(0, 6), [events]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);

    useEffect(() => {
        if (visibleEvents.length < 2) return;

        const interval = window.setInterval(() => {
            setDirection(1);
            setActiveIndex((current) => (current + 1) % visibleEvents.length);
        }, 6500);

        return () => window.clearInterval(interval);
    }, [visibleEvents.length]);

    if (!visibleEvents.length) {
        return (
            <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                <p className="text-[14px] font-medium text-slate-700">No recommended events yet.</p>
                <p className="mt-1 text-[12px] text-slate-500">
                    We’ll surface event suggestions here once they’re available.
                </p>
            </div>
        );
    }

    const activeEvent = visibleEvents[activeIndex % visibleEvents.length];

    const goPrev = () => {
        setDirection(-1);
        setActiveIndex((current) => (current - 1 + visibleEvents.length) % visibleEvents.length);
    };

    const goNext = () => {
        setDirection(1);
        setActiveIndex((current) => (current + 1) % visibleEvents.length);
    };

    const cardVariants = {
        enter: (dir: 1 | -1) => ({
            opacity: 0,
            x: dir > 0 ? 44 : -44,
            scale: 0.985,
        }),
        center: {
            opacity: 1,
            x: 0,
            scale: 1,
        },
        exit: (dir: 1 | -1) => ({
            opacity: 0,
            x: dir > 0 ? -44 : 44,
            scale: 0.985,
        }),
    };

    return (
        <div className="space-y-4 sm:space-y-5">
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                        key={activeEvent._id.toString()}
                        custom={direction}
                        variants={cardVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <RecommendedEventCard event={activeEvent} index={activeIndex} compact={compact} />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:size-9"
                    aria-label="Previous recommended event"
                >
                    <ChevronLeft size={compact ? 13 : 14} />
                </button>

                <div className="flex items-center gap-1">
                    {visibleEvents.map((event, index) => (
                        <button
                            key={event._id.toString()}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-200",
                                index === activeIndex
                                    ? "w-[22px] bg-[#332be0] shadow-[0_0_0_3px_rgba(51,43,224,0.10)]"
                                    : "w-2 bg-slate-200 hover:bg-slate-300"
                            )}
                            aria-label={`Go to recommended event ${index + 1}`}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:size-9"
                    aria-label="Next recommended event"
                >
                    <ChevronRight size={compact ? 13 : 14} />
                </button>
            </div>
        </div>
    );
}
