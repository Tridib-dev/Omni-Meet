"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export default function HorizontalScrollProgress({
    children,
    className,
    contentClassName,
    viewportRef: externalViewportRef,
    orientation = "horizontal",
}: {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    viewportRef?: RefObject<HTMLDivElement | null>;
    orientation?: "horizontal" | "vertical";
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
            const viewportSize = orientation === "vertical" ? viewport.clientHeight : viewport.clientWidth;
            const contentSize = orientation === "vertical" ? viewport.scrollHeight : viewport.scrollWidth;
            const scrollPosition = orientation === "vertical" ? viewport.scrollTop : viewport.scrollLeft;
            const maxScroll = contentSize - viewportSize;
            const safeMaxScroll = Math.max(maxScroll, 0);
            const nextProgress = safeMaxScroll > 0 ? scrollPosition / safeMaxScroll : 0;
            const nextVisibleFraction = contentSize > 0 ? viewportSize / contentSize : 1;

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
    }, [externalViewportRef, orientation]);

    return (
        <div className={cn(orientation === "vertical" ? "flex items-stretch gap-2" : "space-y-2", className)}>
            <div
                ref={externalViewportRef ?? internalViewportRef}
                className={cn(
                    orientation === "vertical"
                        ? "min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
                        : "overflow-x-auto overflow-y-hidden",
                    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    contentClassName
                )}
            >
                {children}
            </div>
            <div
                aria-hidden="true"
                className={cn(
                    orientation === "vertical"
                        ? "relative w-1.5 shrink-0 overflow-hidden rounded-full bg-slate-200 transition-opacity duration-150"
                        : "relative h-1.5 overflow-hidden rounded-full bg-slate-200 transition-opacity duration-150",
                    !hasOverflow && "pointer-events-none opacity-0"
                )}
            >
                <div
                    className={cn(
                        "absolute rounded-full from-[#332be0] via-[#4c46ff] to-[#332be0] shadow-[0_0_18px_rgba(51,43,224,0.18)]",
                        orientation === "vertical"
                            ? "left-0 w-full bg-gradient-to-b transition-[top,height] duration-150"
                            : "left-0 top-0 h-full bg-gradient-to-r transition-[left,width] duration-150"
                    )}
                    style={
                        orientation === "vertical"
                            ? {
                                  height: `${visibleFraction * 100}%`,
                                  top: `${progress * (100 - visibleFraction * 100)}%`,
                                  opacity: hasOverflow ? 1 : 0.55,
                              }
                            : {
                                  width: `${visibleFraction * 100}%`,
                                  left: `${progress * (100 - visibleFraction * 100)}%`,
                                  opacity: hasOverflow ? 1 : 0.55,
                              }
                    }
                />
            </div>
        </div>
    );
}
