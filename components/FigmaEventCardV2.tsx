"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, CalendarDays, Clock3, Globe2, Laptop, MapPin, UsersRound } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import SaveButtonIcon from "@/components/ui/SaveButtonIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAttendeesCount } from "@/lib/actions/booking.actions";
import { isEventSaved, toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { normalizeEventMode } from "@/lib/constants/event-mode";
import type { FigmaEventCardProps } from "@/components/FigmaEventCard";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(value: string) {
  const formatPart = (part: string) => {
    const trimmed = part.trim();
    const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (!match) return trimmed;

    const hour = Number(match[1]);
    const minute = match[2] ?? "00";
    const meridiem = match[3]?.toUpperCase();
    if (meridiem) return `${hour}:${minute} ${meridiem}`;

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  };

  return value
    .split(/\s*(?:–|—|-)\s*/)
    .map(formatPart)
    .join(" – ");
}

function initials(value: string) {
  return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "EV";
}

export default function FigmaEventCardV2({
  eventId, slug = "discover", title = "Google Cloud Next 2027", image = "https://www.figma.com/api/mcp/asset/79d75f5e-1768-4e6f-9fc0-13918269a375.png",
  category = "Conference", venue = "Moscone Center, San Francisco, CA", date = "Wed, 10 Apr 2027", time = "9:00 AM – 5:00 PM",
  attendees: initialAttendees, organizer = "DevSphere Community", organizationName, organizers = [], mode, price = 0,
}: FigmaEventCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(true);
  const [attendees, setAttendees] = useState(initialAttendees ?? 0);
  const { isSignedIn } = useUser();
  const normalizedMode = normalizeEventMode(mode);
  const modeLabel = normalizedMode === "online" ? "Online" : normalizedMode === "hybrid" ? "Hybrid" : "Offline";
  const ModeIcon = normalizedMode === "online" ? Laptop : normalizedMode === "hybrid" ? Globe2 : Building2;
  const href = slug === "discover" ? "/events/discover" : `/events/${slug}`;
  const people = organizers.length > 0 ? organizers : [{ name: organizer }];
  const visiblePeople = people.slice(0, 3);
  const extraPeople = Math.max(0, people.length - visiblePeople.length);

  useEffect(() => {
    let mounted = true;
    async function initialize() {
      const [count, savedState] = await Promise.all([
        eventId ? getAttendeesCount(eventId) : Promise.resolve(initialAttendees ?? 0),
        eventId && isSignedIn ? isEventSaved(eventId) : Promise.resolve(false),
      ]);
      if (!mounted) return;
      setAttendees(count);
      setSaved(savedState);
      setSaving(false);
    }
    initialize().catch(() => mounted && setSaving(false));
    return () => { mounted = false; };
  }, [eventId, initialAttendees, isSignedIn]);

  async function handleSave() {
    if (!eventId) {
      setSaved((current) => !current);
      return;
    }
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    const nextSaved = !saved;
    setSaved(nextSaved);
    setSaving(true);
    try {
      const result = await toggleWatchlist(eventId);
      if (result.error) throw new Error(result.error);
      setSaved(result.saved);
    } catch {
      setSaved(!nextSaved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
      <div className="relative aspect-[662/320] w-full shrink-0 overflow-hidden bg-slate-100"><img src={image} alt={title} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" /><SaveButtonIcon saved={saved} loading={saving} onToggle={handleSave} ariaLabel={saved ? "Remove saved event" : "Save event"} className="absolute left-4 top-4 z-10 size-9 justify-center rounded-full px-0" /></div>
      <div className="flex flex-col gap-2 px-5 py-3 sm:px-6">
        <div className="flex flex-col gap-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="min-w-0 flex-1 line-clamp-2 text-[18px] font-bold leading-tight text-slate-900">{title}</h3><span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">{category}</span></div><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500"><span className="inline-flex items-center gap-1.5 font-semibold text-indigo-600"><UsersRound size={15} />{attendees.toLocaleString("en-IN")}</span><span className="inline-flex items-center gap-1.5"><ModeIcon size={15} className="text-slate-400" />{modeLabel}</span></div></div>
        <div className="flex flex-col gap-1.5 text-[13px] text-slate-700"><span className="inline-flex min-w-0 items-center gap-1.5"><MapPin size={15} className="shrink-0 text-slate-400" /><span className="truncate">{venue}</span></span><div className="flex flex-wrap gap-x-4 gap-y-1"><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><CalendarDays size={15} className="text-slate-400" />{formatDate(date)}</span><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Clock3 size={15} className="text-slate-400" />{formatTime(time)}</span></div></div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2"><div className="min-w-0"><p className="text-[11px] font-medium uppercase text-slate-400">Organized by</p><p className="max-w-[190px] truncate text-[13px] font-semibold text-slate-800">{organizationName || organizer}</p><div className="mt-1 flex items-center">{visiblePeople.map((person, index) => <Avatar key={`${person.name}-${index}`} className="-mr-2 size-6 border-2 border-white"><AvatarImage src={person.avatar} alt={person.name} /><AvatarFallback className="bg-slate-100 text-[9px] text-slate-600">{initials(person.name)}</AvatarFallback></Avatar>)}{extraPeople > 0 && <span className="ml-3 text-[11px] font-medium text-slate-500">[{extraPeople}+ more]</span>}</div></div><Link href={href} className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] px-4 text-[12px] font-bold text-white shadow-[0_4px_6px_rgba(37,99,235,0.2)] transition-colors hover:bg-blue-700">{price > 0 ? `Register ₹${price.toLocaleString("en-IN")}` : "Register Free"}</Link></div>
      </div>
    </article>
  );
}
