// app/(site)/events/[slug]/room/page.tsx
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/actions/event.actions";
import { ensureRoomForEvent } from "@/lib/actions/room.actions";
import RoomGate from "@/components/room/RoomGate";


type PageParams = Promise<{ slug?: string }>;

export default async function RoomPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  if (typeof slug !== "string" || !slug.trim()) notFound();

  const event = await getEventBySlug(slug.trim());
  if (!event?._id) notFound();

  const eventId = event._id.toString();
  const meta = await ensureRoomForEvent(eventId);

  // No Room doc yet — organizer hasn't created/scheduled the room.
  if (!meta) notFound();

  return (
    <RoomGate
      eventId={eventId}
      eventTitle={event.title ?? "Event"}
      bannerUrl={event.image}
      initialPhase={meta.phase}
      scheduledStart={meta.scheduledStart}
      scheduledEnd={meta.scheduledEnd}
    />
  );
}