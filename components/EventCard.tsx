"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { useUser } from '@clerk/nextjs';
import { toggleWatchlist, isEventSaved } from '@/lib/actions/watchlist.actions';



import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { getAttendeesCount } from "@/lib/actions/booking.actions";

export interface EventProps {
  eventId: string;           // ← Required for real count
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const EventCard = ({
  eventId,
  title,
  image,
  slug,
  location,
  date,
  time,
  mode,
  price = 0,
  tags = [],
  hostName = "Alex Rivera",
  hostAvatar = "https://github.com/shadcn.png",
  organization = "DevSphere Community",
}: EventProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [attendees, setAttendees] = useState(0);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const init = async () => {
        const [count, saved] = await Promise.all([
            getAttendeesCount(eventId),
            isSignedIn ? isEventSaved(eventId) : Promise.resolve(false),
        ]);
        setAttendees(count);
        setIsSaved(saved);
    };
    init();
  }, [eventId, isSignedIn]);

  
  const handleSave = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!isSignedIn) {
          window.location.href = `/sign-in`;
          return;
      }
      const result = await toggleWatchlist(eventId);
      setIsSaved(result.saved);
      posthog.capture('event_saved', { slug, saved: result.saved });
  };



  const handleClick = () => {
    posthog.capture('event_card_clicked', { slug, title, location });
  };


  return (
    <Link
      href={`/events/${slug}`}
      // onClick={handleClick}
      className="group block bg-dark-200 rounded-3xl overflow-hidden border border-dark-300 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col"
    >
      {/* Image + Badges */}
      <div className="relative aspect-[16/9.5] overflow-hidden flex-shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 410px"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = "https://placehold.co/600x400/png?text=Event+Image"; // Temporary fallback
          }}
        />

        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {mode && (
            <div className="px-4 py-1.5 text-xs font-semibold bg-white/95 backdrop-blur-md text-zinc-900 border border-white/70 rounded-2xl shadow-md">
              {mode === "in-person" ? "In-Person" : mode === "online" ? "Online" : "Hybrid"}
            </div>
          )}

          <div className={`px-4 py-1.5 text-xs font-semibold rounded-2xl shadow-md border backdrop-blur-md
            ${price === 0 ? 'bg-emerald-600 text-white border-emerald-500/40' : 'bg-amber-600 text-white border-amber-500/40'}`}>
            {price === 0 ? 'Free' : `₹${price}`}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="absolute top-3 left-3 p-2 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all"
          style={{
              background: isSaved ? 'rgba(236,72,153,0.85)' : 'rgba(0,0,0,0.70)'
          }}
        >
          <Image src="/icons/pin.svg" alt="Save" width={22} height={22} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-light-300 mb-3">
          <span className="icon-white">
            <Image src="/icons/map-pin.svg" alt="" width={16} height={16} />
          </span>
          <span className="text-sm">{location}</span>
        </div>

        <h3 className="text-xl font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-4">
          {title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-light-300 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="icon-white">
              <Image src="/icons/calendar.svg" alt="" width={16} height={16} />
            </span>
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="icon-white">
              <Image src="/icons/clock.svg" alt="" width={16} height={16} />
            </span>
            <span>{time}</span>
          </div>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-auto">
            {tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="text-xs bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-2xl text-zinc-300 border border-zinc-700/50 transition-all duration-200">
                #{tag}
              </span>
            ))}
            {tags.length > 4 && <span className="text-xs text-zinc-500 self-center pl-2">+{tags.length - 4}</span>}
          </div>
        )}

        <div className="border-t border-dark-300 pt-4 mt-auto" />

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-dark-400">
              <AvatarImage src={hostAvatar} alt={hostName} />
              <AvatarFallback className="bg-zinc-700 text-xs">
                {hostName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="text-sm">
              <p className="text-light-200 font-medium">{hostName}</p>
              <p className="text-light-400 text-xs">{organization}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-light-300 text-sm">
            <span className="icon-white">
              <Image src="/icons/audience.svg" alt="Attendees" width={16} height={16} />
            </span>
            <span>{attendees}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;






// HAve to fix the evnt cards hotsname and organization section 