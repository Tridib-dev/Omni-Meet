// components/ui/dock.tsx
"use client";

import {
  motion,
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from "framer-motion";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 64;
const DEFAULT_DISTANCE = 120;
const DEFAULT_PANEL_HEIGHT = 56;

type DockProps = {
  children: ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

type DockLabelProps = {
  className?: string;
  children: ReactNode;
  /** Injected by DockItem — do not pass manually */
  isHovered?: MotionValue<number>;
};

type DockIconProps = {
  className?: string;
  children: ReactNode;
  /** Injected by DockItem — do not pass manually */
  width?: MotionValue<number>;
};

type DocContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: DocContextType;
}) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("useDock must be used within a DockProvider");
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(() => {
    return Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);
  }, [magnification]);

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{
        height,
        scrollbarWidth: "none",
      }}
      className="mx-2 flex max-w-full items-end overflow-x-auto"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          "mx-auto flex w-fit items-end gap-3 rounded-2xl border border-[#262B35] bg-[#14171D]/95 px-3 py-2 sm:gap-3 sm:px-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur",
          className
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Reaction dock"
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  );
  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center",
        className
      )}
      tabIndex={0}
      role="button"
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;

        return cloneElement(
          child as ReactElement<Record<string, unknown>>,
          {
            width,
            isHovered,
          } as Partial<DockIconProps & DockLabelProps>
        );
      })}
    </motion.div>
  );
}

function DockLabel({ children, className, isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-[#262B35] bg-[#1B1F27] px-2 py-0.5 text-xs text-[#F3F5F8]",
            className
          )}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, width }: DockIconProps) {
  const fallbackWidth = useMotionValue(40);
  const source = width ?? fallbackWidth;
  const widthTransform = useTransform(source, (val: number) => val / 2);

  return (
    <motion.div
      style={{ width: widthTransform }}
      className={cn("flex items-center justify-center text-xl leading-none", className)}
    >
      {children}
    </motion.div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };