export type EventActivityKind =
    | "booking"
    | "payment"
    | "co_organizer_invite"
    | "co_organizer_accepted"
    | "co_organizer_denied"
    | "system";

export interface EventActivityItem {
    id: string;
    kind: EventActivityKind;
    title: string;
    description?: string;
    timestamp: string;
}
