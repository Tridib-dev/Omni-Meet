"use client"

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
}

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
}: ProfileCardProps) {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion
  const fullName = `${firstName} ${lastName}`.trim()
  const imageSrc = photo || "https://placehold.co/160x160/png?text=DE"

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
      className={cn(
        "relative w-full max-w-[320px] min-w-60 mx-auto rounded-3xl border border-border/20 bg-card text-card-foreground overflow-hidden shadow-xl shadow-black/5",
        href && "cursor-pointer",
        "dark:shadow-black/20",
        className
      )}
    >
      {/* Compact banner — just enough to anchor the avatar */}
      <div className="h-14 sm:h-16 w-full bg-linear-to-br from-muted to-muted/40" />

      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center px-5 sm:px-6 pb-5 sm:pb-6 -mt-8 sm:-mt-10"
      >
        {/* Avatar — the visual anchor */}
        <motion.div variants={itemVariants} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-card shadow-md sm:h-20 sm:w-20">
          {/* <img
            src={photo}
            alt={fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-card shadow-md"
          /> */}


          <Image
            src={imageSrc}
            alt={fullName}
            fill
            sizes="(min-width: 640px) 80px, 64px"
            className="object-cover"
          />

          {isVerified && (
            <div className="absolute bottom-0 right-0 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 text-white ring-2 ring-card">
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          )}
        </motion.div>

        {/* Name */}
        <motion.h2
          variants={itemVariants}
          className="mt-3 text-base sm:text-lg font-bold text-foreground leading-tight text-center w-full truncate px-2"
        >
          {fullName}
        </motion.h2>

        {/* Username — disambiguates people with the same display name */}
        <motion.p
          variants={itemVariants}
          className="text-sm text-muted-foreground w-full truncate text-center px-2"
        >
          @{username}
        </motion.p>

        {/* Bio — always reserves 2 lines of height so every card matches, regardless of bio length */}
        <motion.p
          variants={itemVariants}
          className="mt-3 text-sm text-muted-foreground text-center leading-relaxed line-clamp-2 min-h-[2.85rem]"
        >
          {bio}
        </motion.p>

        {/* Ticket-stub style divider — a small nod to an events platform */}
        <motion.div
          variants={itemVariants}
          className="w-full mt-4 border-t border-dashed border-border/50"
        />

        {/* Events hosted — credibility signal */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-1.5 mt-4 text-sm"
        >
          <CalendarCheck2 className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{eventsHostedCount}</span>
          <span className="text-muted-foreground">events hosted</span>
        </motion.div>

        {/* Interests — top 2-3 as chips. Fixed min-height so cards align even with 0 interests */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-1.5 mt-3 min-h-7 max-w-full"
        >
          {interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full truncate max-w-36"
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
            "w-full cursor-pointer py-2 sm:py-2.5 px-4 rounded-2xl font-semibold text-sm transition-colors duration-200 mt-5",
            "border border-border/20 shadow-sm",
            "disabled:cursor-not-allowed disabled:opacity-60",
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
