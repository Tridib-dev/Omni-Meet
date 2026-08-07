// components/room/OrganizerControls.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { RoomPhase } from "@/lib/actions/room.actions";
import { Input } from "@/components/ui/input";

export interface OrganizerControlsProps {
  eventId: string;
  phase: RoomPhase;
  onChanged: () => void; // triggers a refetch in the parent
}

export default function OrganizerControls({ eventId, phase, onChanged }: OrganizerControlsProps) {
  const [pending, setPending] = useState<"start" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateDraft, setUpdateDraft] = useState("");
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  async function handleStart() {
    if (pending) return;
    setPending("start");
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${eventId}/start`, { method: "POST" });
      if (!res.ok) {
        setError("Couldn't start the meeting — try again.");
        return;
      }
      onChanged();
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(null);
    }
  }

  async function handleUpdateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = updateDraft.trim();
    if (!body || sendingUpdate) return;

    if (body.length > 500) {
      setUpdateError("Updates must be 500 characters or fewer.");
      return;
    }

    setSendingUpdate(true);
    setUpdateError(null);

    try {
      const res = await fetch(`/api/rooms/${eventId}/discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "update", body, clientMutationId: crypto.randomUUID() }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to post update.");
      }

      setUpdateDraft("");
      toast.success("Update posted.");
      window.dispatchEvent(new Event("room-updates:changed"));
    } catch (postError) {
      console.error("[OrganizerControls] failed to post update", postError);
      setUpdateError("Could not post the update. Please try again.");
      toast.error("Could not post the update. Please try again.");
    } finally {
      setSendingUpdate(false);
    }
  }

  // Ending the meeting is now handled by LeaveMeetingModal inside
  // LiveRoomScreen (Leave → "End meeting for everyone"), so there's nothing
  // left for this floating control to show once the room is live.
  if (phase === "ended" || phase === "live") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
      <div className="mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col gap-3 overflow-y-auto rounded-t-4xl border border-[#262B35] border-b-0 bg-[#11161D]/96 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:px-5">
        <div className="mx-auto h-1.5 w-14 rounded-full bg-white/10" />
        <div className="flex flex-col items-center gap-3">
          {error && <p className="rounded-md bg-[#FF5468]/15 px-2 py-1 text-xs text-[#FF5468]">{error}</p>}
          <button
            onClick={handleStart}
            disabled={pending !== null}
            className="min-w-48 rounded-full bg-(--gv-go,#33D6A0) px-7 py-3 text-base font-semibold text-[#0A0C10] shadow-lg shadow-[#33D6A0]/20 transition-transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-60"
          >
            {pending === "start" ? "Starting…" : "Start meeting"}
          </button>
        </div>

        <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-2 rounded-2xl border border-[#262B35] bg-[#0B0E13] p-3 sm:flex-row sm:items-center">
          <Input
            value={updateDraft}
            onChange={(event) => setUpdateDraft(event.target.value)}
            placeholder="new updates for attendees ..."
            className="h-11 rounded-xl border-[#2B3240] bg-[#0A0C10] text-[#F3F5F8] placeholder:text-[#8891A3]"
          />
          <button
            type="submit"
            disabled={sendingUpdate}
            className="h-11 shrink-0 rounded-xl bg-[#33D6A0] px-5 text-sm font-semibold text-[#0A0C10] disabled:opacity-60"
          >
            {sendingUpdate ? "Posting..." : "Post"}
          </button>
        </form>
        {updateError && <p className="text-xs text-[#FF7B8A]">{updateError}</p>}

      </div>
    </div>
  );
}
