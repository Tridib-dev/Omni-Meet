"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";

export type DashboardEventCardItem = {
    id: string;
    title: string;
    image: string;
    slug: string;
    href: string;
    location: string;
    date: string;
    time: string;
    organizer: string;
    organizerImage?: string;
    scope: "attended" | "organized" | "recent";
};

type Props = {
    event: DashboardEventCardItem;
    badgeLabel: string;
    topRightLabel: string;
    ctaLabel: string;
};

function formatDateWithYear(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function DashboardEventCard({ event, badgeLabel, topRightLabel, ctaLabel }: Props) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="group h-full"
        >
            <Link
                href={event.href}
                className="flex h-full min-h-[272px] w-[min(84vw,286px)] flex-col overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.03] transition-transform duration-300 hover:-translate-y-1 hover:border-[#332be0]/30 sm:w-[268px]"
            >
                <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                        src={event.image || "https://placehold.co/900x600/0b0f13/444?text=Event"}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 82vw, 260px"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,15,0.08),rgba(7,9,15,0.45))]" />

                    <div className="absolute left-3 top-3 rounded-full border border-[#332be0]/25 bg-[#332be0]/12 px-2.5 py-1 text-[10px] font-semibold text-[#a5a0ff] backdrop-blur-md">
                        {badgeLabel}
                    </div>

                    <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/85 backdrop-blur-md">
                        {topRightLabel}
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-[17px] font-semibold tracking-[-0.03em] text-white/95">
                        {event.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-[12px] text-white/58">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                            <div className="space-y-2.5">
                                <p className="flex items-center gap-1.5">
                                    <MapPin size={12} className="shrink-0" />
                                    <span className="truncate">{event.location}</span>
                                </p>

                                <p className="flex items-center gap-2">
                                    <span className="inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] text-white/70">
                                        {event.organizerImage ? (
                                            <Image
                                                src={event.organizerImage}
                                                alt={event.organizer}
                                                width={24}
                                                height={24}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User size={10} />
                                        )}
                                    </span>
                                    <span className="truncate">{event.organizer || "Organizer"}</span>
                                </p>
                            </div>

                            <div className="space-y-1.5 lg:text-right">
                                <p className="flex items-center gap-1.5 lg:justify-end">
                                    <Calendar size={12} className="shrink-0" />
                                    <span>{formatDateWithYear(event.date)}</span>
                                </p>
                                <p className="flex items-center gap-1.5 lg:justify-end">
                                    <Clock size={12} className="shrink-0" />
                                    <span>{event.time}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex justify-center pt-4">
                        <span className="inline-flex w-[92%] items-center justify-center gap-1.5 rounded-xl bg-[#332be0] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(51,43,224,0.18)] transition-colors hover:bg-[#4c46ff]">
                            {ctaLabel} <ArrowRight size={15} />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}
