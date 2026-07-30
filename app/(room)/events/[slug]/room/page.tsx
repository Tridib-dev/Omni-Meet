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

  if (!meta) notFound();

  return (
    <RoomGate
      eventId={eventId}
      eventSlug={slug.trim()}
      eventTitle={event.title ?? "Event"}
      bannerUrl={event.image}
      initialPhase={meta.phase}
      scheduledStart={meta.scheduledStart}
      scheduledEnd={meta.scheduledEnd}
    />
  );
}
