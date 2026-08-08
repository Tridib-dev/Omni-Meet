"use client"

import { cn } from "@/lib/utils"
import { SkeletonBlock, SkeletonCircle } from "./Skeleton"

export interface ProfileCardSkeletonProps {
  className?: string
}

/**
 * Mirrors ProfileCard's structure and sizing exactly (same container,
 * banner, avatar offset, spacing) so swapping loading -> loaded never
 * shifts layout. If ProfileCard's dimensions change, update both.
 */
export function ProfileCardSkeleton({ className }: ProfileCardSkeletonProps) {
  return (
    <div
      data-slot="profile-card-skeleton"
      className={cn(
        "relative w-full max-w-[320px] min-w-[240px] mx-auto rounded-3xl border border-border/20 bg-card overflow-hidden shadow-xl shadow-black/5",
        "dark:shadow-black/20",
        className
      )}
    >
      <div className="h-14 sm:h-16 w-full bg-gradient-to-br from-muted to-muted/40" />

      <div className="flex flex-col items-center px-5 sm:px-6 pb-5 sm:pb-6 -mt-8 sm:-mt-10">
        <SkeletonCircle className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-card shrink-0" />

        <SkeletonBlock className="mt-4 h-5 w-32 rounded-full" />
        <SkeletonBlock className="mt-2 h-3.5 w-20 rounded-full" />

        <div className="mt-3 w-full space-y-1.5">
          <SkeletonBlock className="h-3.5 w-full rounded-full" />
          <SkeletonBlock className="h-3.5 w-5/6 mx-auto rounded-full" />
        </div>

        <div className="w-full mt-4 border-t border-dashed border-border/50" />

        <div className="flex items-center gap-1.5 mt-4">
          <SkeletonBlock className="w-4 h-4 rounded-md" />
          <SkeletonBlock className="h-3.5 w-24 rounded-full" />
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-3">
          <SkeletonBlock className="h-[1.75rem] w-16 rounded-full" />
          <SkeletonBlock className="h-[1.75rem] w-14 rounded-full" />
          <SkeletonBlock className="h-[1.75rem] w-20 rounded-full" />
        </div>

        <SkeletonBlock className="w-full h-10 sm:h-11 rounded-2xl mt-5" />
      </div>
    </div>
  )
}
