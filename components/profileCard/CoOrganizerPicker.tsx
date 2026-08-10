"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { ProfileRowShell, type ProfileRowUser } from "./ProfileRow"
import { AddCoOrganizerModal } from "./AddCoOrganizerModal"

export interface CoOrganizerPickerProps {
  /** The current user creating the event — connections are fetched relative to them. */
  viewerClerkId: string
  value: ProfileRowUser[]
  onChange: (next: ProfileRowUser[]) => void
}

/**
 * Local selection only — this manages the co-organizer list as plain form
 * state (`value`/`onChange`), the same way you'd wire any other multi-value
 * field on a create-event form. Nothing here writes to the database; submit
 * the resulting clerkIds along with the rest of the event payload.
 */
export function CoOrganizerPicker({ viewerClerkId, value, onChange }: CoOrganizerPickerProps) {
  const [open, setOpen] = useState(false)
  const selectedClerkIds = new Set(value.map((u) => u.clerkId))

  function handleToggle(user: ProfileRowUser) {
    if (selectedClerkIds.has(user.clerkId)) {
      onChange(value.filter((u) => u.clerkId !== user.clerkId))
    } else {
      onChange([...value, user])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((user) => (
        <ProfileRowShell
          key={user.clerkId}
          user={user}
          trailing={
            <button
              type="button"
              onClick={() => handleToggle(user)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/20 text-muted-foreground transition-colors hover:bg-muted/50"
              aria-label={`Remove ${user.firstName} ${user.lastName}`}
            >
              <X size={14} />
            </button>
          }
        />
      ))}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border/50 bg-muted/20 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-accent-foreground"
      >
        <Plus size={16} />
        Invite co-organizer
      </button>

      <AddCoOrganizerModal
        open={open}
        onOpenChange={setOpen}
        viewerClerkId={viewerClerkId}
        selectedClerkIds={selectedClerkIds}
        onToggle={handleToggle}
      />
    </div>
  )
}
