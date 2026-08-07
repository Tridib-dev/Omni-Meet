"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { defaultMorphConfig, stageDepth, type MorphConfig } from "./config";
import { MorphNav, type MorphNavItem } from "./MorphNav";

export interface RoomMorphStageProps {
  /** The video/call UI — rendered in the remaining space next to the nav. */
  stageContent: ReactNode;
  items: MorphNavItem[];
  /** Controlled active tab id. `null` = every panel collapsed. */
  value: string | null;
  onValueChange: (id: string | null) => void;
  /** Breakpoint (px) below which the nav moves to the top and the stage
   *  slides downward instead of sideways. Matches Tailwind's `lg` by default. */
  desktopBreakpoint?: number;
  config?: Partial<MorphConfig>;
  className?: string;
}

function useIsDesktop(breakpoint: number) {
  // Computed directly during the state initializer, not in an effect — this
  // is a value we can read synchronously (window.matchMedia), so there's no
  // external system to "synchronize" with on mount, just a subscription to
  // set up for future changes. Falls back to `true` when window isn't
  // available yet (SSR/first paint) — avoids a vertical→horizontal flash on
  // wide screens, where it matters most.
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isDesktop;
}

function useMeasuredExtent(ref: React.RefObject<HTMLElement | null>, axis: "width" | "height") {
  const [extent, setExtent] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setExtent(axis === "width" ? entry.contentRect.width : entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, axis]);
  return extent;
}

/**
 * How much space to reserve for the nav when every tab is collapsed —
 * just enough to show the icon rail, nothing more. Derived from the same
 * geometry MorphNav itself uses internally (rail offset from the panel
 * edge), so this always stays in sync even if `config` is overridden.
 */
function collapsedExtent(config: MorphConfig) {
  const depth = stageDepth(config);
  const extent = depth - config.panelSize - config.bumpDepth + config.iconSize / 2 + 16;
  return Math.round(Math.max(config.iconSize + 24, extent));
}

export function RoomMorphStage({
  stageContent,
  items,
  value,
  onValueChange,
  desktopBreakpoint = 1024,
  config: configOverrides,
  className,
}: RoomMorphStageProps) {
  const vertical = useIsDesktop(desktopBreakpoint);
  const containerRef = useRef<HTMLDivElement>(null);
  const measuredExtent = useMeasuredExtent(containerRef, vertical ? "height" : "width");

  const config = {
    ...defaultMorphConfig,
    ...configOverrides,
    // Track the real container size instead of the hardcoded 520px default —
    // falls back to the configured/default value only until the first
    // ResizeObserver measurement comes in.
    panelLength: measuredExtent > 0 ? measuredExtent : (configOverrides?.panelLength ?? defaultMorphConfig.panelLength),
  };

  const depth = stageDepth(config);
  const collapsed = collapsedExtent(config);
  const isOpen = value !== null;

  const springTransition = {
    type: "spring" as const,
    stiffness: config.stiffness,
    damping: config.damping,
    mass: config.mass,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-full w-full overflow-hidden bg-[#0A0C10]",
        vertical ? "flex-row" : "flex-col-reverse",
        className,
      )}
    >
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{stageContent}</div>

      <motion.div
        className="relative shrink-0 overflow-hidden"
        initial={false}
        animate={
          vertical
            ? { width: isOpen ? depth : collapsed, height: "100%" }
            : { width: "100%", height: isOpen ? depth : collapsed }
        }
        transition={springTransition}
      >
        <div className={cn("absolute", vertical ? "right-0 top-0" : "left-0 top-0")}>
          <MorphNav
            items={items}
            value={value}
            onValueChange={onValueChange}
            orientation={vertical ? "vertical" : "horizontal"}
            config={config}
          />
        </div>
      </motion.div>
    </div>
  );
}