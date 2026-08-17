"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export default function HorizontalScrollProgress({
    children,
    className,
    contentClassName,
    viewportRef: externalViewportRef,
}: {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    viewportRef?: RefObject<HTMLDivElement | null>;
}) {
    const internalViewportRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [visibleFraction, setVisibleFraction] = useState(1);
    const [hasOverflow, setHasOverflow] = useState(false);

    useEffect(() => {
        const viewport = externalViewportRef?.current ?? internalViewportRef.current;
        if (!viewport) return;

        let raf = 0;

        const update = () => {
            const maxScroll = viewport.scrollWidth - viewport.clientWidth;
            const safeMaxScroll = Math.max(maxScroll, 0);
            const nextProgress = safeMaxScroll > 0 ? viewport.scrollLeft / safeMaxScroll : 0;
            const nextVisibleFraction = viewport.scrollWidth > 0 ? viewport.clientWidth / viewport.scrollWidth : 1;

            setHasOverflow(safeMaxScroll > 1);
            setProgress(Math.min(Math.max(nextProgress, 0), 1));
            setVisibleFraction(Math.min(Math.max(nextVisibleFraction, 0.12), 1));
        };

        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };

        update();
        viewport.addEventListener("scroll", onScroll, { passive: true });

        const observer = new ResizeObserver(() => {
            update();
        });
        observer.observe(viewport);

        return () => {
            cancelAnimationFrame(raf);
            viewport.removeEventListener("scroll", onScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <div className={cn("space-y-2", className)}>
            <div
                ref={externalViewportRef ?? internalViewportRef}
                className={cn(
                    "overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    contentClassName
                )}
            >
                {children}
            </div>
            <div
                aria-hidden="true"
                className={cn(
                    "relative h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10 transition-opacity duration-150",
                    !hasOverflow && "pointer-events-none opacity-0"
                )}
            >
                <div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#332be0] via-[#4c46ff] to-[#332be0] shadow-[0_0_18px_rgba(51,43,224,0.18)] transition-[left,width] duration-150"
                    style={{
                        width: `${visibleFraction * 100}%`,
                        left: `${progress * (100 - visibleFraction * 100)}%`,
                        opacity: hasOverflow ? 1 : 0.55,
                    }}
                />
            </div>
        </div>
    );
}
