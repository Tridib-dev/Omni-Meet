"use client";

import { cn } from "@/lib/utils";

type Props = {
    total: number;
    activeIndex: number;
    onDotClick: (index: number) => void;
};

export function CarouselProgressDots({ total, activeIndex, onDotClick }: Props) {
    return (
        // Absolute positioned at bottom-center
        <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 transform sm:bottom-4 lg:bottom-5">
            <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                {Array.from({ length: total }).map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onDotClick(index)}
                        className={cn(
                            "rounded-full transition-all duration-200",
                            index === activeIndex
                                ? "h-1 w-6 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.3)] sm:h-2 sm:w-7 lg:h-2.5 lg:w-8"
                                : "h-1 w-1 bg-white/40 hover:bg-white/60 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === activeIndex}
                    />
                ))}
            </div>
        </div>
    );
}
