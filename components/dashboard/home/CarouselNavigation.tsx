"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    onPrev: () => void;
    onNext: () => void;
};

export function CarouselNavigation({ onPrev, onNext }: Props) {
    return (
        <>
            {/* Previous button - left side, hidden on mobile, visible on hover for desktop */}
            <button
                type="button"
                onClick={onPrev}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 transform rounded-full border border-white/30 bg-black/40 p-2 text-white transition-all duration-200 hover:border-white/60 hover:bg-black/60 active:scale-95 sm:left-3 sm:p-2.5 lg:left-4 lg:p-3 opacity-0 lg:hover:opacity-100"
                aria-label="Previous event"
            >
                <ChevronLeft size={16} className="sm:size-5 lg:size-6" />
            </button>

            {/* Next button - right side, hidden on mobile, visible on hover for desktop */}
            <button
                type="button"
                onClick={onNext}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 transform rounded-full border border-white/30 bg-black/40 p-2 text-white transition-all duration-200 hover:border-white/60 hover:bg-black/60 active:scale-95 sm:right-3 sm:p-2.5 lg:right-4 lg:p-3 opacity-0 lg:hover:opacity-100"
                aria-label="Next event"
            >
                <ChevronRight size={16} className="sm:size-5 lg:size-6" />
            </button>
        </>
    );
}
