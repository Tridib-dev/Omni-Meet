"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, Sparkles } from "lucide-react";
import type { DiscoverCard } from "@/lib/discover-events";
import { EventBannerContent } from "./EventBannerContent";
import { CarouselProgressDots } from "./CarouselProgressDots";
import SaveButtonIcon from "@/components/ui/SaveButtonIcon";
import { isEventSaved, toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { useUser } from "@clerk/nextjs";

type Props = {
    events: DiscoverCard[];
    compact?: boolean;
};

type CarouselItem = {
    type: "event" | "create" | "explore";
    id: string;
    data: DiscoverCard | null;
};

export function RecommendedEventsCarousel({ events, compact = false }: Props) {
    const eventItems = useMemo(() => events.slice(0, 6), [events]);
    
    // Create carousel items: events + CTA cards at the end
    const carouselItems = useMemo(() => {
        const items: CarouselItem[] = eventItems.map((event) => ({
            type: "event",
            id: event._id.toString(),
            data: event,
        }));
        
        // Add CTA items at the end
        items.push({
            type: "create",
            id: "create-event-cta",
            data: null,
        });
        items.push({
            type: "explore",
            id: "explore-events-cta",
            data: null,
        });
        
        return items;
    }, [eventItems]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isSignedIn } = useUser();

    // Auto-play carousel (only for actual events, not CTAs)
    useEffect(() => {
        if (eventItems.length < 2) return;

        const interval = window.setInterval(() => {
            setDirection(1);
            setActiveIndex((current) => (current + 1) % eventItems.length);
        }, 6500);

        return () => window.clearInterval(interval);
    }, [eventItems.length]);

    // Check if current event is saved
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (!isSignedIn || carouselItems[activeIndex]?.type !== "event") {
                if (mounted) setLoading(false);
                return;
            }

            const activeEvent = carouselItems[activeIndex]?.data;
            if (!activeEvent) return;

            const nextSaved = await isEventSaved(activeEvent._id.toString());
            if (mounted) {
                setSaved(nextSaved);
                setLoading(false);
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, [activeIndex, carouselItems, isSignedIn]);

    if (!eventItems.length) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">No recommended events yet.</p>
                <p className="mt-1 text-xs text-slate-500">
                    We will surface event suggestions here once they are available.
                </p>
            </div>
        );
    }

    const activeItem = carouselItems[activeIndex % carouselItems.length];

    const goPrev = () => {
        setDirection(-1);
        setActiveIndex((current) => (current - 1 + carouselItems.length) % carouselItems.length);
    };

    const goNext = () => {
        setDirection(1);
        setActiveIndex((current) => (current + 1) % carouselItems.length);
    };

    const handleToggleSave = async () => {
        if (!isSignedIn) {
            window.location.href = "/sign-in";
            return;
        }

        if (activeItem.type !== "event" || !activeItem.data) return;

        const nextSaved = !saved;
        setSaved(nextSaved);
        setLoading(true);
        const result = await toggleWatchlist(activeItem.data._id.toString());
        if (result.error) {
            setSaved(!nextSaved);
        } else {
            setSaved(result.saved);
        }
        setLoading(false);
    };

    const cardVariants = {
        enter: (dir: 1 | -1) => ({
            opacity: 0,
            x: dir > 0 ? 44 : -44,
        }),
        center: {
            opacity: 1,
            x: 0,
        },
        exit: (dir: 1 | -1) => ({
            opacity: 0,
            x: dir > 0 ? -44 : 44,
        }),
    };

    return (
        <div className="w-full">
            {/* Banner Stage Container - Fixed positioning for controls */}
            <div className="relative overflow-hidden rounded-xl bg-slate-900">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                        key={activeItem.id}
                        custom={direction}
                        variants={cardVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="relative h-44 w-full sm:h-60 lg:h-72"
                    >
                        {/* Render different content based on item type */}
                        {activeItem.type === "event" && activeItem.data ? (
                            <>
                                {/* Banner Image */}
                                <Link href={`/events/${activeItem.data.slug}`} className="block h-full w-full">
                                    <Image
                                        src={activeItem.data.image || "https://placehold.co/1200x700/0b0f13/444?text=Event"}
                                        alt={activeItem.data.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1100px"
                                        priority={activeIndex === 0}
                                    />
                                </Link>

                                {/* Event Content (Title, Date, Time, Location) - All in one unified backdrop */}
                                <EventBannerContent event={activeItem.data} compact={compact} />
                            </>
                        ) : activeItem.type === "create" ? (
                            // Create Event CTA Card
                            <Link href="/create_event" className="block h-full w-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900">
                                <div className="relative h-full flex flex-col items-center justify-center gap-3 text-white px-6">
                                    <PlusCircle size={40} className="sm:size-12 lg:size-14" />
                                    <div className="text-center">
                                        <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl">Create Event</h3>
                                        <p className="text-sm sm:text-base text-indigo-100 mt-1">Launch your next event</p>
                                    </div>
                                    <span className="mt-2 text-sm font-medium text-indigo-200">Get Started →</span>
                                </div>
                            </Link>
                        ) : (
                            // Explore Events CTA Card
                            <Link href="/events/discover" className="block h-full w-full bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-900">
                                <div className="relative h-full flex flex-col items-center justify-center gap-3 text-white px-6">
                                    <Sparkles size={40} className="sm:size-12 lg:size-14" />
                                    <div className="text-center">
                                        <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl">Explore Events</h3>
                                        <p className="text-sm sm:text-base text-cyan-100 mt-1">Discover amazing opportunities</p>
                                    </div>
                                    <span className="mt-2 text-sm font-medium text-cyan-200">Browse Now →</span>
                                </div>
                            </Link>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* FIXED Controls - Outside the animated div, stay in place */}

                {/* Save Button - Only show for events */}
                {activeItem.type === "event" && (
                    <div className="absolute right-2 top-2 z-30 sm:right-3 sm:top-3 lg:right-4 lg:top-4">
                        <SaveButtonIcon
                            saved={saved}
                            loading={loading}
                            onToggle={handleToggleSave}
                            ariaLabel={saved ? "Remove bookmark" : "Bookmark event"}
                            className="border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-md hover:bg-black/60"
                        />
                    </div>
                )}

                {/* Navigation Arrows - Stay fixed */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-2 sm:px-3 lg:px-4">
                    <button
                        type="button"
                        onClick={goPrev}
                        className="pointer-events-auto rounded-full border border-white/30 bg-black/40 p-2 text-white transition-all duration-200 hover:border-white/60 hover:bg-black/60 active:scale-95 sm:p-2.5 lg:p-3 opacity-0 lg:hover:opacity-100"
                        aria-label="Previous event"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        className="pointer-events-auto rounded-full border border-white/30 bg-black/40 p-2 text-white transition-all duration-200 hover:border-white/60 hover:bg-black/60 active:scale-95 sm:p-2.5 lg:p-3 opacity-0 lg:hover:opacity-100"
                        aria-label="Next event"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Progress Dots - Always visible, stay fixed at bottom */}
            <div className="flex justify-center mt-3 sm:mt-4 lg:mt-5">
                <CarouselProgressDots
                    total={carouselItems.length}
                    activeIndex={activeIndex}
                    onDotClick={setActiveIndex}
                />
            </div>
        </div>
    );
}
