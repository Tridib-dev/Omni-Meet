// app/(site)/events/[slug]/gate/page.tsx
// Server wrapper: resolves the event by slug, gates access, hands off to
// the client shell.
//
// ASSUMPTION: an `getEventBySlug(slug)` action exists on
// "@/lib/actions/event.actions" returning at least
// { _id, title, mode, slug }. Adjust the import/shape if your actual
// action differs (e.g. getEventBySlug vs getEventByIdOrSlug).

import { Suspense } from "react";
import { forbidden, notFound } from "next/navigation";
import { isGateAuthorized } from "@/lib/actions/gate.actions";
import { getEventBySlug } from "@/lib/actions/event.actions";
import GateShell from "@/components/gate/GateShell";

type PageParams = Promise<{ slug?: string }>;


function GateSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0C10] px-4 py-6">
      <div className="mx-auto max-w-2xl animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded bg-[#1B1F27]" />
        <div className="h-16 rounded-xl bg-[#14171D]" />
        <div className="h-10 w-48 rounded-full bg-[#1B1F27]" />
        <div className="h-64 rounded-xl bg-[#14171D]" />
      </div>
    </div>
  );
}

export default async function GatePage({ params }: { params: PageParams }) {
  return (
    <Suspense fallback={<GateSkeleton />}>
      <GateContent params={params} />
    </Suspense>
  );
}

async function GateContent({ params }: { params: PageParams }) {
  const { slug } = await params;

  if (typeof slug !== "string" || !slug.trim()) {
    notFound();
  }

  const event = await getEventBySlug(slug.trim());
  if (!event?._id) {
    notFound();
  }

  const eventId = event._id.toString();
  const authorized = await isGateAuthorized(eventId);
  if (!authorized) {
    forbidden();
  }

  const mode: "online" | "offline" | "hybrid" =
    event.mode === "online" || event.mode === "hybrid" ? event.mode : "offline";

  return (
    <GateShell
      eventId={eventId}
      eventTitle={event.title ?? "Event"}
      eventMode={mode}
      eventSlug={slug.trim()}
    />
  );
}
