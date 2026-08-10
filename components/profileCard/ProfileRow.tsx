"use client"

import { useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { SkeletonBlock, SkeletonCircle } from "./Skeleton"
import type { IUser } from "@/database/User.model" // matches the rest of this codebase's model import convention

/**
 * Minimum fields every row flavor needs — deliberately not the full IUser.
 * Anything relational (follow state, event role, pending/sent state) is
 * NOT part of this type: it's context-specific and passed in per flavor,
 * not read off the user document. See ProfileRowShell's `badge`/`trailing`
 * slots below.
 */
export type ProfileRowUser = Pick<IUser, "clerkId" | "photo" | "firstName" | "lastName" | "username"> & {
  isVerified?: boolean
}

export interface ProfileRowShellProps {
  user: ProfileRowUser
  /** Small pill near the name — e.g. an event-scoped role ("Organizer"). */
  badge?: ReactNode
  /** Right-aligned action area — a button, a state pill, whatever the flavor needs. */
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}

/**
 * The dumb shared base: avatar, name, username, and two slots. Knows
 * nothing about co-organizers, sharing, or following — flavor components
 * own that. Keep this the only place row layout/spacing lives so every
 * list in the app stays visually consistent.
 */
export function ProfileRowShell({
  user,
  badge,
  trailing,
  onClick,
  className,
}: ProfileRowShellProps) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <div
      data-slot="profile-row"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border/20 bg-card px-3 py-2.5 transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-muted/50",
        className
      )}
    >
      <div className="relative shrink-0">
        <img
          src={user.photo}
          alt={fullName}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-card"
        />
        {user.isVerified && (
          <div className="absolute bottom-0 right-0 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-500 text-white ring-2 ring-card">
            <Check className="w-2 h-2" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground leading-tight">{fullName}</p>
          {badge}
        </div>
        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  )
}

export function ProfileRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="profile-row-skeleton"
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border/20 bg-card px-3 py-2.5",
        className
      )}
    >
      <SkeletonCircle className="w-10 h-10 ring-2 ring-card shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <SkeletonBlock className="h-3.5 w-28 rounded-full" />
        <SkeletonBlock className="h-3 w-20 rounded-full" />
      </div>
      <SkeletonBlock className="h-8 w-20 rounded-xl shrink-0" />
    </div>
  )
}

// --- Shared trailing-button styling, matching ProfileCard's Follow button --

function RowActionButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={cn(
        "rounded-xl border border-border/20 px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
        "disabled:opacity-60",
        active
          ? "bg-muted text-muted-foreground hover:bg-muted/80"
          : "bg-foreground text-background hover:bg-foreground/90"
      )}
    >
      {children}
    </motion.button>
  )
}

// --- Flavor 1: adding/removing a co-organizer candidate ---------------------

export interface CoOrganizerCandidateRowProps {
  user: ProfileRowUser
  isCoOrganizer: boolean
  pending?: boolean
  onAdd: () => void
  onRemove: () => void
  onClick?: () => void
  className?: string
}

export function CoOrganizerCandidateRow({
  user,
  isCoOrganizer,
  pending = false,
  onAdd,
  onRemove,
  onClick,
  className,
}: CoOrganizerCandidateRowProps) {
  return (
    <ProfileRowShell
      user={user}
      onClick={onClick}
      className={className}
      trailing={
        <RowActionButton active={isCoOrganizer} disabled={pending} onClick={isCoOrganizer ? onRemove : onAdd}>
          {pending ? "..." : isCoOrganizer ? "Remove" : "Invite"}
        </RowActionButton>
      }
    />
  )
}

// --- Flavor 2: sharing an event to a follower --------------------------------

export interface ShareToFollowerRowProps {
  user: ProfileRowUser
  onSend: () => Promise<void> | void
  onClick?: () => void
  className?: string
}

export function ShareToFollowerRow({ user, onSend, onClick, className }: ShareToFollowerRowProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")

  async function handleSend() {
    if (status !== "idle") return
    setStatus("sending")
    try {
      await onSend()
      setStatus("sent")
    } catch {
      setStatus("idle") // let them retry on failure
    }
  }

  return (
    <ProfileRowShell
      user={user}
      onClick={onClick}
      className={className}
      trailing={
        <RowActionButton active={status === "sent"} disabled={status !== "idle"} onClick={handleSend}>
          {status === "sending" ? "..." : status === "sent" ? "Sent" : "Send"}
        </RowActionButton>
      }
    />
  )
}

// --- Flavor 3: co-organizer list in event detail (role badge + follow) ------

export interface CoOrganizerListRowProps {
  user: ProfileRowUser
  role: "organizer" | "co-organizer"
  isFollowing: boolean
  onToggleFollow: () => void
  followPending?: boolean
  onClick?: () => void
  className?: string
}

export function CoOrganizerListRow({
  user,
  role,
  isFollowing,
  onToggleFollow,
  followPending = false,
  onClick,
  className,
}: CoOrganizerListRowProps) {
  return (
    <ProfileRowShell
      user={user}
      onClick={onClick}
      className={className}
      badge={
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            role === "organizer" ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {role === "organizer" ? "Organizer" : "Co-organizer"}
        </span>
      }
      trailing={
        <RowActionButton active={isFollowing} disabled={followPending} onClick={onToggleFollow}>
          {followPending ? "..." : isFollowing ? "Following" : "Follow"}
        </RowActionButton>
      }
    />
  )
}
