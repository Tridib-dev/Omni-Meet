import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { defaultMorphConfig, stageDepth, type MorphConfig } from "./config";
import { useMorphSprings } from "./useMorphSprings";

export interface MorphNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
  /** Optional dot on the icon. */
  badge?: boolean;
}

export interface MorphNavProps {
  items: MorphNavItem[];
  /** Controlled active id. `null` = nothing selected (panel collapsed). */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  /** Vertical = icon rail on the right. Horizontal = icon rail on top. */
  orientation?: "vertical" | "horizontal";
  /** Partial overrides for every geometry / spring constant. */
  config?: Partial<MorphConfig>;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function MorphNav({
  items,
  value,
  defaultValue = null,
  onValueChange,
  orientation = "vertical",
  config: configOverrides,
  className,
}: MorphNavProps) {
  const config = useMemo(
    () => ({ ...defaultMorphConfig, ...configOverrides }),
    [configOverrides],
  );
  const depth = stageDepth(config);
  const vertical = orientation === "vertical";

  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue);
  const active = value !== undefined ? value : uncontrolled;
  const activeIndex = items.findIndex((i) => i.id === active);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  const setActive = useCallback(
    (id: string | null) => {
      if (value === undefined) setUncontrolled(id);
      onValueChange?.(id);
    },
    [value, onValueChange],
  );

  // --- measurement (cached, recomputed only when the rail resizes) ---------
  const railRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const [centers, setCenters] = useState<Record<string, number>>({});

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const railBox = rail.getBoundingClientRect();
    const next: Record<string, number> = {};
    buttonRefs.current.forEach((el, id) => {
      const box = el.getBoundingClientRect();
      next[id] = vertical
        ? box.top - railBox.top + rail.offsetTop + box.height / 2
        : box.left - railBox.left + rail.offsetLeft + box.width / 2;
    });
    setCenters((prev) => {
      const same =
        Object.keys(next).length === Object.keys(prev).length &&
        Object.keys(next).every(
          (k) => Math.abs((prev[k] ?? -1) - (next[k] ?? 0)) < 0.5,
        );
      return same ? prev : next;
    });
  }, [vertical]);

  useIsomorphicLayoutEffect(() => {
    measure();
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [measure, items.length, config.iconSize, config.iconGap]);

  const fallbackCenter = config.panelLength / 2;
  const measuredCenter = active ? centers[active] : undefined;
  const [lastCenter, setLastCenter] = useState(fallbackCenter);
  const activeCenter = measuredCenter ?? lastCenter;
  // Deliberately setting state during render, not in an effect — this is
  // the sanctioned pattern for "remember the last known value so we don't
  // snap to the fallback for one frame while waiting on a measurement".
  // React bails out and re-renders immediately with the new state before
  // anything paints, so there's no visible flicker; the equality guard
  // prevents this from looping.
  if (measuredCenter !== undefined && measuredCenter !== lastCenter) {
    setLastCenter(measuredCenter);
  }

  const springs = useMorphSprings(config, {
    open: activeItem ? 1 : 0,
    bumpCenter: activeCenter,
  });

  // --- interaction ---------------------------------------------------------
  const focusItem = (index: number) => {
    const item = items[(index + items.length) % items.length];
    if (item) buttonRefs.current.get(item.id)?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const next = vertical ? "ArrowDown" : "ArrowRight";
    const prev = vertical ? "ArrowUp" : "ArrowLeft";
    if (event.key === next) {
      event.preventDefault();
      focusItem(index + 1);
    } else if (event.key === prev) {
      event.preventDefault();
      focusItem(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItem(items.length - 1);
    } else if (event.key === "Escape" && active) {
      event.preventDefault();
      setActive(null);
    }
  };

  const rovingIndex = activeIndex >= 0 ? activeIndex : 0;

  // --- rendering -----------------------------------------------------------
  const stageStyle = vertical
    ? { width: depth, height: config.panelLength }
    : { width: config.panelLength, height: depth };

  const railStyle = vertical
    ? {
        left: config.panelSize + config.bumpDepth - config.iconSize / 2,
        top: 0,
        bottom: 0,
      }
    : {
        top: depth - config.panelSize - config.bumpDepth - config.iconSize / 2,
        left: 0,
        right: 0,
      };

  const contentStyle = vertical
    ? { left: 0, top: 0, width: config.panelSize, height: config.panelLength }
    : { left: 0, bottom: 0, width: config.panelLength, height: config.panelSize };

  return (
    <div
      className={cn("relative select-none", className)}
      style={stageStyle}
      onKeyDown={(e) => {
        if (e.key === "Escape" && active) setActive(null);
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={stageStyle.width}
        height={stageStyle.height}
        viewBox={`0 0 ${stageStyle.width} ${stageStyle.height}`}
        aria-hidden="true"
      >
        <motion.path
          d={springs.d}
          transform={vertical ? undefined : `translate(0, ${depth}) rotate(-90)`}
          className="fill-[#14171D] stroke-[#262B35]"
          strokeWidth={1}
        />
      </svg>

      <motion.div
        className="absolute overflow-hidden"
        style={{ ...contentStyle, opacity: springs.open }}
        aria-hidden={activeItem ? undefined : true}
      >
        <div
          className="h-full w-full"
          style={{ padding: config.panelPadding }}
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={activeItem ? `${baseId}-tab-${activeItem.id}` : undefined}
          tabIndex={activeItem ? 0 : -1}
        >
          <AnimatePresence mode="wait" initial={false}>
            {activeItem && (
              <motion.div
                key={activeItem.id}
                className="h-full w-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: config.contentFade, ease: "easeOut" }}
              >
                {activeItem.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div
        ref={railRef}
        role="tablist"
        aria-orientation={vertical ? "vertical" : "horizontal"}
        aria-label="Session panels"
        className={cn(
          "absolute flex items-center justify-center",
          vertical ? "flex-col" : "flex-row",
        )}
        style={{ ...railStyle, gap: config.iconGap }}
      >
        {items.map((item, index) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) buttonRefs.current.set(item.id, el);
                else buttonRefs.current.delete(item.id);
              }}
              id={`${baseId}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={isActive ? `${baseId}-panel` : undefined}
              aria-label={item.label}
              title={item.label}
              tabIndex={index === rovingIndex ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, index)}
              onClick={() => setActive(isActive ? null : item.id)}
              style={{ width: config.iconSize, height: config.iconSize }}
              className={cn(
                "relative z-10 grid place-items-center rounded-full transition-colors duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0C10]",
                isActive
                  ? "border border-transparent text-[#4f46e5]"
                  : "border border-[#262B35] bg-[#14171D] text-[#8891A3] hover:text-[#F3F5F8]",
              )}
            >
              {item.icon}
              {item.badge && !isActive && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-[#4f46e5]" />
              )}
              <span className="sr-only">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
