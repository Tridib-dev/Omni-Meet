"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Base shimmering block. Self-contained animation (via framer-motion,
 * already a dependency here) rather than a Tailwind keyframe, so it doesn't
 * depend on anything being declared in tailwind.config/globals.css.
 */
export function SkeletonBlock({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <span className={cn("relative block overflow-hidden rounded-md bg-muted", className)}>
      {!shouldReduceMotion && (
        <motion.span
          className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/10 to-transparent"
          style={{ backgroundSize: "200% 100%" }}
          animate={{ backgroundPositionX: ["-150%", "150%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      )}
    </span>
  )
}

export function SkeletonCircle({ className }: { className?: string }) {
  return <SkeletonBlock className={cn("rounded-full", className)} />
}
