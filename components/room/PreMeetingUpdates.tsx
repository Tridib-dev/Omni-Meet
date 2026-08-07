"use client";

import { ArrowRight, Megaphone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BottomModal } from "@/components/uitripled/bottom-modal";
import { useSyncExternalStore } from "react";


type UpdateItem = {
  id: string;
  author: string;
  role: string;
  body: string;
  createdAt: number;
};

type DiscussionUpdateApiItem = {
  id?: string;
  authorName?: string;
  authorRole?: string;
  body?: string;
  createdAt?: string;
};

function formatTime(value: number) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function compactText(text: string, maxLength = 140) {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function toUpdateItem(item: DiscussionUpdateApiItem): UpdateItem {
  return {
    id: String(item.id),
    author: String(item.authorName ?? "Unknown"),
    role: String(item.authorRole ?? "attendee"),
    body: String(item.body ?? ""),
    createdAt: new Date(String(item.createdAt)).getTime(),
  };
}

export interface PreMeetingUpdatesProps {
  eventId: string;
  canModerate: boolean;
}


const subscribeNoop = () => () => {};

export default function PreMeetingUpdates({ eventId }: PreMeetingUpdatesProps) {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissedBannerId, setDismissedBannerId] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  useEffect(() => {
    let active = true;

    async function syncUpdates() {
      try {
        const res = await fetch(`/api/rooms/${eventId}/discussion`, { method: "GET", cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          throw new Error(data?.message ?? "Failed to load updates.");
        }

        const nextUpdates: UpdateItem[] = Array.isArray(data.updates)
          ? (data.updates as DiscussionUpdateApiItem[]).map(toUpdateItem)
          : [];

        setUpdates(nextUpdates);
      } catch (syncError) {
        if (!active) return;
        console.error("[PreMeetingUpdates] failed to load updates", syncError);
      } finally {
        if (active) setLoading(false);
      }
    }

    void syncUpdates();
    const intervalId = window.setInterval(() => {
      void syncUpdates();
    }, 5000);
    const handleExternalRefresh = () => {
      void syncUpdates();
    };
    window.addEventListener("room-updates:changed", handleExternalRefresh);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("room-updates:changed", handleExternalRefresh);
    };
  }, [eventId]);

  const latestUpdate = useMemo(() => updates[0] ?? null, [updates]);
  const bannerVisible = Boolean(latestUpdate && dismissedBannerId !== latestUpdate.id);

  if (!mounted) return null;

  return createPortal(
    <>
      {bannerVisible && latestUpdate && (
        <div className="fixed left-1/2 top-4 z-55 w-[min(92vw,42rem)] -translate-x-1/2 px-4">
          <div className="rounded-3xl border border-[#2A2F3A] bg-[#10151C]/96 px-4 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-(--gv-go,#33D6A0)/15 p-2 text-(--gv-go,#33D6A0)">
                <Megaphone size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#F3F5F8]">Latest update</p>
                <p className="mt-1 text-sm leading-6 text-[#AAB3C1]">{compactText(latestUpdate.body)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#7DDCC6] underline-offset-4 hover:underline"
                  >
                    Learn more
                    <ArrowRight size={14} />
                  </button>
                  <span className="text-[11px] text-[#697386]">
                    {latestUpdate.author} · {formatTime(latestUpdate.createdAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedBannerId(latestUpdate.id)}
                className="rounded-full p-1.5 text-[#7A8394] transition-colors hover:bg-white/5 hover:text-white/80"
                aria-label="Dismiss latest update"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Announcements"
        description="Everything posted for attendees, newest first."
        className="md:max-w-2xl"
      >
        <div className="max-h-[65dvh] space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/45">
              Loading updates...
            </p>
          ) : updates.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/45">
              No updates yet.
            </p>
          ) : (
            updates.map((update) => (
              <article key={update.id} className="rounded-2xl border border-white/10 bg-white/3 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white/90">{update.author}</p>
                    <p className="text-[11px] uppercase tracking-wide text-white/35">{update.role}</p>
                  </div>
                  <span className="text-[11px] text-white/35">{formatTime(update.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/75">{update.body}</p>
              </article>
            ))
          )}
        </div>
      </BottomModal>
    </>,
    document.body
  );
}