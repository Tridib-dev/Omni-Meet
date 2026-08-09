"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { BottomModal } from "@/components/uitripled/bottom-modal"
import { CoOrganizerCandidateRow, ProfileRowSkeleton, type ProfileRowUser } from "./ProfileRow"
import {
  getProfileConnections,
  type ConnectionRelation,
  type ProfileConnection,
} from "@/lib/actions/profile.actions"

export interface AddCoOrganizerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The organizer's own clerkId — connections are fetched relative to them. */
  viewerClerkId: string
  /** clerkIds already picked in the parent form — drives each row's Add/Remove state. */
  selectedClerkIds: Set<string>
  onToggle: (user: ProfileRowUser) => void
}

function toProfileRowUser(connection: ProfileConnection): ProfileRowUser {
  return {
    clerkId: connection.clerkId,
    photo: connection.photo,
    firstName: connection.firstName,
    lastName: connection.lastName,
    username: connection.username,
  }
}

const DARK_MODAL_VARS: CSSProperties = {
  colorScheme: "dark",
  "--background": "#0d1117",
  "--foreground": "#f8fafc",
  "--card": "#121826",
  "--card-foreground": "#f8fafc",
  "--popover": "#121826",
  "--popover-foreground": "#f8fafc",
  "--muted": "#182231",
  "--muted-foreground": "#9aa7b6",
  "--border": "#273347",
  "--input": "#273347",
  "--ring": "#67e8f9",
} as CSSProperties

export function AddCoOrganizerModal({
  open,
  onOpenChange,
  viewerClerkId,
  selectedClerkIds,
  onToggle,
}: AddCoOrganizerModalProps) {
  const [tab, setTab] = useState<ConnectionRelation>("followers")
  const [query, setQuery] = useState("")
  const [connections, setConnections] = useState<ProfileConnection[]>([])
  const [loading, setLoading] = useState(false)

  // Refetch whenever the modal opens or the tab changes. getProfileConnections
  // has no search param today, so filtering below is client-side — fine at
  // typical follower-list sizes; worth moving server-side later if lists get
  // large enough that shipping the whole list becomes wasteful.
  useEffect(() => {
    if (!open) return
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const result = await getProfileConnections(viewerClerkId, tab)
        if (active) setConnections(result)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [open, tab, viewerClerkId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return connections
    return connections.filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
    )
  }, [connections, query])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) setQuery("")
  }

  return (
    <BottomModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Add co-organizer"
      description={`${connections.length} ${tab}`}
      className="md:max-w-md"
    >
      <div style={DARK_MODAL_VARS} className="flex flex-col gap-3 text-white">
        <div className="flex items-center gap-1 rounded-2xl border border-border/20 bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setTab("followers")}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              tab === "followers" ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Followers
          </button>
          <button
            type="button"
            onClick={() => setTab("following")}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              tab === "following" ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Following
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-xl border border-border/20 bg-muted/40 py-2.5 pl-9 pr-3 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:border-border/40"
          />
        </div>

        <div className="max-h-[60dvh] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <ProfileRowSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/20 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              {query ? "No matches." : `No ${tab} yet.`}
            </p>
          ) : (
            filtered.map((connection) => (
              <CoOrganizerCandidateRow
                key={connection.clerkId}
                user={toProfileRowUser(connection)}
                isCoOrganizer={selectedClerkIds.has(connection.clerkId)}
                onAdd={() => onToggle(toProfileRowUser(connection))}
                onRemove={() => onToggle(toProfileRowUser(connection))}
              />
            ))
          )}
        </div>
      </div>
    </BottomModal>
  )
}
