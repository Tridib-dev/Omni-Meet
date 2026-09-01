"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import posthog from "posthog-js";
import { useUser } from "@clerk/nextjs";
import { toggleWatchlist, isEventSaved } from "@/lib/actions/watchlist.actions";
import { getAttendeesCount } from "@/lib/actions/booking.actions";
import { normalizeEventMode } from "@/lib/constants/event-mode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SaveButtonIcon from "@/components/ui/SaveButtonIcon";

export interface EventProps {
  eventId: string;
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  mode?: string;
  price: number;
  tags?: string[];
  hostName?: string;
  hostAvatar?: string;
  organization?: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventCard({
  eventId, title, image, slug, location, date, time, mode, price = 0,
  tags = [], hostName = "Alex Rivera", hostAvatar, organization = "DevSphere Community",
}: EventProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(true);
  const [attendees, setAttendees] = useState(0);
  const { isSignedIn } = useUser();
  const normalizedMode = normalizeEventMode(mode);
  const modeLabel = normalizedMode === "online" ? "Online" : normalizedMode === "hybrid" ? "Hybrid" : "Offline";

  useEffect(() => {
    let mounted = true;

    async function initializeCard() {
      const [count, saved] = await Promise.all([
        getAttendeesCount(eventId),
        isSignedIn ? isEventSaved(eventId) : Promise.resolve(false),
      ]);
      if (!mounted) return;
      setAttendees(count);
      setIsSaved(saved);
      setSaveLoading(false);
    }

    initializeCard().catch(() => {
      if (mounted) setSaveLoading(false);
    });
    return () => { mounted = false; };
  }, [eventId, isSignedIn]);

  async function handleSave() {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    setSaveLoading(true);
    try {
      const result = await toggleWatchlist(eventId);
      if (result.error) throw new Error(result.error);
      setIsSaved(result.saved);
      posthog.capture("event_saved", { slug, saved: result.saved });
    } catch {
      setIsSaved(!nextSaved);
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
      <Link href={`/events/${slug}`} className="flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500">
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-slate-100">
          <Image src={image || "https://placehold.co/900x600/e2e8f0/475569?text=Event"} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/10" />
          <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-slate-950/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">{modeLabel}</span>
          <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] shadow-sm backdrop-blur-md ${price === 0 ? "border border-emerald-200/70 bg-emerald-500/90 text-white" : "border border-amber-200/70 bg-amber-500/90 text-white"}`}>{price === 0 ? "Free" : `₹${price}`}</span>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-3 flex min-w-0 items-center gap-1.5 text-[12px] text-slate-500"><MapPin size={14} className="shrink-0 text-slate-400" /><span className="truncate">{location}</span></div>
          <h3 className="min-h-[2.75rem] line-clamp-2 text-[18px] font-semibold leading-[1.35] tracking-[-0.03em] text-slate-900 transition-colors group-hover:text-indigo-700">{title}</h3>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Calendar size={14} className="text-slate-400" />{formatDate(date)}</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Clock size={14} className="text-slate-400" />{time}</span>
          </div>
          <div className="mt-4 min-h-[2rem]">
            {tags.length > 0 && <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">#{tag}</span>)}
              {tags.length > 3 && <span className="self-center text-[11px] text-slate-400">+{tags.length - 3}</span>}
            </div>}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar className="size-8 shrink-0 border border-slate-200"><AvatarImage src={hostAvatar} alt={hostName} /><AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-600">{hostName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="min-w-0 text-[11px]"><p className="truncate font-semibold text-slate-700">{hostName}</p><p className="truncate text-slate-400">{organization}</p></div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-slate-400"><Users size={14} />{attendees}</span>
            </div>
          </div>
        </div>
      </Link>
      <SaveButtonIcon saved={isSaved} loading={saveLoading} onToggle={handleSave} ariaLabel={isSaved ? "Remove saved event" : "Save event"} className="absolute left-3 top-3 z-10" />
    </article>
  );
}
