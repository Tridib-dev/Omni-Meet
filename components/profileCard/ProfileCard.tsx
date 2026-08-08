"use client"

import type { CSSProperties } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { Check, CalendarCheck2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ProfileCardProps {
  photo?: string
  firstName?: string
  lastName?: string
  username?: string
  bio?: string
  isVerified?: boolean
  eventsHostedCount?: number
  interests?: string[]
  enableAnimations?: boolean
  className?: string
  onFollow?: () => void
  isFollowing?: boolean
  href?: string
  followLabel?: string
  followDisabled?: boolean
  /** Caps how wide the card is allowed to grow. "compact" also trims to 2 interest chips. */
  size?: "default" | "compact"
}

/**
 * All sizing below scales off the card's OWN rendered width (via CSS
 * container queries, `cqw`), not the viewport and not a size-prop branch.
 * That's deliberate: this card is dropped into different contexts (a
 * dense discover grid, a wider standalone spot, etc.) and its actual
 * rendered width varies for reasons that have nothing to do with `size`
 * (grid column count, sidebar presence, page padding...). Tying fonts/
 * spacing to the real box the card lives in is the only way they stay
 * proportional everywhere without re-deriving breakpoints by hand.
 *
 * `containerType: inline-size` on the root establishes the query context;
 * everything else reads cqw off of that. This is set inline (not in a
 * global stylesheet) so it works regardless of what wraps this component.
 */
const CONTAINER_STYLE: CSSProperties = { containerType: "inline-size" }

export function ProfileCard({
  photo = "https://placehold.co/160x160/png?text=DE",
  firstName = "Sophie",
  lastName = "Bennett",
  username = "sophiebennett",
  bio = "Product designer who loves hosting small, cozy meetups around design and coffee.",
  isVerified = true,
  eventsHostedCount = 12,
  interests = ["Design", "Coffee", "Hiking"],
  enableAnimations = true,
  className,
  onFollow = () => {},
  isFollowing = false,
  href,
  followLabel,
  followDisabled = false,
  size = "default",
}: ProfileCardProps) {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion
  const fullName = `${firstName} ${lastName}`.trim()
  const imageSrc = photo || "https://placehold.co/160x160/png?text=DE"
  const isCompact = size === "compact"
  const visibleInterests = isCompact ? interests.slice(0, 2) : interests.slice(0, 3)

  const containerVariants: Variants = {
    rest: { scale: 1, y: 0 },
    hover: shouldAnimate
      ? {
          scale: 1.015,
          y: -3,
          transition: { type: "spring" as const, stiffness: 400, damping: 28, mass: 0.6 },
        }
      : {},
  }

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring" as const, stiffness: 400, damping: 26, mass: 0.5 },
    },
  }

  return (
    <motion.div
      data-slot="profile-card"
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={() => {
        if (href) router.push(href)
      }}
      onKeyDown={(event) => {
        if (!href) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          router.push(href)
        }
      }}
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      style={CONTAINER_STYLE}
      className={cn(
        "relative w-full min-w-0 mx-auto rounded-[clamp(14px,7cqw,26px)] border border-border/20 bg-card text-card-foreground overflow-hidden shadow-xl shadow-black/5",
        isCompact ? "max-w-[min(100%,17rem)]" : "max-w-[min(100%,26rem)]",
        href && "cursor-pointer",
        "dark:shadow-black/20",
        className
      )}
    >
      {/* Compact banner — just enough to anchor the avatar */}
      <div className="w-full bg-linear-to-br from-muted to-muted/40 h-[clamp(28px,15cqw,44px)]" />

      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center px-[clamp(12px,6cqw,22px)] pb-[clamp(12px,6cqw,22px)] -mt-[clamp(20px,11cqw,32px)]"
      >
        {/* Avatar — the visual anchor */}
        <motion.div
          variants={itemVariants}
          className="relative shrink-0 overflow-hidden rounded-full ring-[3px] ring-card shadow-md h-[clamp(40px,22cqw,64px)] w-[clamp(40px,22cqw,64px)]"
        >
          <Image
            src={imageSrc}
            alt={fullName}
            fill
            sizes="(min-width: 640px) 64px, 40px"
            className="object-cover"
          />

          {isVerified && (
            <div className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-green-500 text-white ring-2 ring-card h-[clamp(12px,7cqw,20px)] w-[clamp(12px,7cqw,20px)]">
              <Check className="h-[55%] w-[55%]" />
            </div>
          )}
        </motion.div>

        {/* Name */}
        <motion.h2
          variants={itemVariants}
          className="mt-[clamp(6px,3cqw,12px)] font-bold text-foreground leading-tight text-center w-full truncate px-2 text-[clamp(13px,6cqw,18px)]"
        >
          {fullName}
        </motion.h2>

        {/* Username — disambiguates people with the same display name */}
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground w-full truncate text-center px-2 text-[clamp(11px,5cqw,14px)]"
        >
          @{username}
        </motion.p>

        {/* Bio — always reserves 2 lines of height so every card matches, regardless of bio length */}
        <motion.p
          variants={itemVariants}
          className="mt-[clamp(6px,3cqw,12px)] text-muted-foreground text-center leading-relaxed line-clamp-2 text-[clamp(11px,5cqw,14px)] min-h-[calc(clamp(11px,5cqw,14px)*1.5*2)]"
        >
          {bio}
        </motion.p>

        {/* Ticket-stub style divider — a small nod to an events platform */}
        <motion.div
          variants={itemVariants}
          className="w-full border-t border-dashed border-border/50 mt-[clamp(10px,5cqw,16px)]"
        />

        {/* Events hosted — credibility signal */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-1.5 mt-[clamp(10px,5cqw,16px)] text-[clamp(11px,5cqw,14px)]"
        >
          <CalendarCheck2 className="text-muted-foreground h-[clamp(12px,5.5cqw,16px)] w-[clamp(12px,5.5cqw,16px)]" />
          <span className="font-semibold text-foreground">{eventsHostedCount}</span>
          <span className="text-muted-foreground">events hosted</span>
        </motion.div>

        {/* Interests — top 2-3 as chips. Fixed min-height so cards align even with 0 interests */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-1.5 max-w-full mt-[clamp(8px,4cqw,14px)] min-h-[clamp(18px,8cqw,28px)]"
        >
          {visibleInterests.map((interest) => (
            <span
              key={interest}
              className="font-medium text-muted-foreground bg-muted rounded-full truncate max-w-[45%] px-[clamp(6px,3cqw,10px)] py-[clamp(2px,1.2cqw,4px)] text-[clamp(9px,4cqw,12px)]"
            >
              {interest}
            </span>
          ))}
        </motion.div>

        {/* Follow Button */}
        <motion.button
          variants={itemVariants}
          onClick={(event) => {
            event.stopPropagation()
            onFollow()
          }}
          disabled={followDisabled}
          whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full cursor-pointer font-semibold transition-colors duration-200",
            "border border-border/20 shadow-sm",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "mt-[clamp(14px,7cqw,20px)] rounded-[clamp(10px,5cqw,16px)] px-[clamp(12px,6cqw,16px)] py-[clamp(6px,3.2cqw,10px)] text-[clamp(11px,5cqw,14px)]",
            isFollowing
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : "bg-foreground text-background hover:bg-foreground/90"
          )}
        >
          {followLabel ?? (isFollowing ? "Following" : "Follow +")}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}