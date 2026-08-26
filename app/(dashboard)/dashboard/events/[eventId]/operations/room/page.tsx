import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Video } from "lucide-react";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import ActionCardRail from "@/components/event-dashboard/shared/ActionCardRail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventDashboardContext } from "@/lib/event-dashboard/access";
import { getActionRailItems } from "@/lib/event-dashboard/navigation";
import { isOperationAvailable } from "@/lib/event-dashboard/mode";
import { edTokens } from "@/components/event-dashboard/theme/tokens";

export const metadata = { title: "Room — Event Dashboard" };

export default async function EventRoomPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;
    const context = await getEventDashboardContext(eventId);
    if (!context) notFound();

    if (!isOperationAvailable(context.normalizedMode, "room")) {
        redirect(`/dashboard/events/${eventId}/overview`);
    }

    const actionItems = getActionRailItems(eventId, context.normalizedMode, "room");
    const roomHref = `/events/${context.slug}/room`;

    return (
        <div className="space-y-8">
            <PageSection
                title="Room"
                description="Control the live room, stage, and online experience."
            />

            <div className="space-y-4">
                <Card className="overflow-hidden">
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div
                                className="flex size-10 items-center justify-center rounded-xl border border-slate-200"
                                style={{ background: `${edTokens.accent}14` }}
                            >
                                <Video size={18} style={{ color: edTokens.accent }} />
                            </div>
                            <div className="min-w-0">
                                <CardTitle>Live room</CardTitle>
                                <CardDescription>
                                    Open the full room experience to manage stage, chat, and online attendees.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href={roomHref}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:opacity-90"
                            style={{
                                background: edTokens.accent,
                                boxShadow: `0 8px 24px ${edTokens.accent}33`,
                            }}
                        >
                            Enter room
                            <ArrowRight size={16} />
                        </Link>
                    </CardContent>
                </Card>

                <ActionCardRail items={actionItems} />
            </div>
        </div>
    );
}
