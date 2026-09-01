"use client";

import Link from "next/link";
import { useState } from "react";
import SaveButtonIcon from "@/components/ui/SaveButtonIcon";

const defaultImage = "https://www.figma.com/api/mcp/asset/e1f65abf-4b5b-4b6f-bd11-fdfda2ad9e0a.png";
const defaultOrganizerImages = [
  "https://www.figma.com/api/mcp/asset/4e4cd6c2-8562-4977-a7b4-9503f5ea476a.png",
  "https://www.figma.com/api/mcp/asset/5c5d9e81-e2fd-4a41-8aec-ac754cb353d4.png",
  "https://www.figma.com/api/mcp/asset/eade3f3a-9b29-426b-94e2-c3c0665ed377.png",
];

export type FigmaEventCardProps = {
  eventId?: string;
  slug?: string;
  title?: string;
  image?: string;
  category?: string;
  description?: string;
  venue?: string;
  date?: string;
  time?: string;
  attendees?: number;
  organizer?: string;
  organizationName?: string;
  organizers?: { name: string; avatar?: string }[];
  mode?: string;
  organizerImages?: string[];
  price?: number;
  isSaved?: boolean;
  onSaveChange?: (saved: boolean) => void;
};

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function FigmaEventCard({
  slug = "discover", title = "Google Cloud Next 2027", image = defaultImage,
  category = "Conference", description = "Join thousands of developers, IT professionals, and business leaders for the next big developer event.",
  venue = "Moscone Center, San Francisco, CA", date = "Wed, 10 Apr 2027", time = "9:00 AM – 5:00 PM",
  attendees = 2847, organizer = "DevSphere Community", organizerImages = defaultOrganizerImages, price = 0,
  isSaved: initialSaved = false, onSaveChange,
}: FigmaEventCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const href = slug === "discover" ? "/events/discover" : `/events/${slug}`;
  const handleSave = () => { const nextSaved = !saved; setSaved(nextSaved); onSaveChange?.(nextSaved); };

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
      <div className="relative aspect-[380/210] w-full shrink-0 overflow-hidden bg-slate-100">
        <img src={image} alt={title} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
        <SaveButtonIcon saved={saved} onToggle={handleSave} ariaLabel={saved ? "Remove saved event" : "Save event"} className="absolute left-4 top-4 z-10 size-9 justify-center rounded-full px-0" />
        <span className={`absolute right-4 top-4 rounded-full border px-3 py-1.5 text-xs font-bold ${price > 0 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{price > 0 ? `₹${price.toLocaleString("en-IN")}` : "FREE"}</span>
      </div>
      <div className="flex flex-1 flex-col gap-5 px-5 py-4 sm:px-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="line-clamp-2 text-[18px] font-bold leading-tight text-slate-900">{title}</h3><p className="mt-2 text-[13px] font-semibold text-indigo-600">{attendees.toLocaleString("en-IN")} attending</p></div><span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">{category}</span></div>
          <p className="line-clamp-2 text-[13px] leading-6 text-slate-500">{description}</p>
        </div>
        <div className="space-y-3 text-[13px] text-slate-700"><p className="flex min-w-0 items-center gap-2"><span aria-hidden="true">⌖</span><span className="truncate">{venue}</span></p><div className="flex flex-wrap gap-x-5 gap-y-2"><span className="whitespace-nowrap">▣ {formatDate(date)}</span><span className="whitespace-nowrap">◷ {time}</span></div></div>
        <div className="mt-auto border-t border-slate-100 pt-4"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-[11px] font-medium uppercase text-slate-400">Organized by</p><p className="truncate text-[13px] font-semibold text-slate-800">{organizer}</p><div className="mt-2 flex items-center">{organizerImages.slice(0, 3).map((avatar, index) => <img key={`${avatar}-${index}`} src={avatar} alt="" className="-mr-2 size-6 rounded-full border-2 border-white object-cover" />)}</div></div><Link href={href} className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-[13px] font-bold text-white shadow-[0_4px_6px_rgba(37,99,235,0.2)] transition-colors hover:bg-blue-700">Register</Link></div></div>
      </div>
    </article>
  );
}
