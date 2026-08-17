import type { EventActivityItem } from "@/lib/event-dashboard/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatWhen(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function kindLabel(kind: EventActivityItem["kind"]) {
    switch (kind) {
        case "booking":
            return "Booking";
        case "payment":
            return "Payment";
        case "co_organizer_accepted":
            return "Committee";
        case "co_organizer_invite":
            return "Invite";
        case "co_organizer_denied":
            return "Declined";
        default:
            return "Update";
    }
}

export default function ActivityFeed({
    items,
    title = "Recent activity",
}: {
    items: EventActivityItem[];
    title?: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 py-8 text-center text-[13px] text-white/40">
                        No recent activity yet.
                    </p>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="grid gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                        >
                            <div className="min-w-0">
                                <div className="mb-1 flex items-center gap-2">
                                    <Badge variant="secondary">{kindLabel(item.kind)}</Badge>
                                </div>
                                <p className="truncate text-[13px] text-white/85">{item.title}</p>
                                {item.description && (
                                    <p className="mt-0.5 line-clamp-2 text-[11px] text-white/35">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            <span className="flex-shrink-0 text-[11px] text-white/30 sm:text-right">
                                {formatWhen(item.timestamp)}
                            </span>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
