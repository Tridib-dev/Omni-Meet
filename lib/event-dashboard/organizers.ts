"use server";

import { cache } from "react";
import { isValidObjectId } from "mongoose";
import { getEventCoOrganizers } from "@/lib/actions/gate.actions";
import { getEventInviteSummary } from "@/lib/co-organizer-invites";
import { isGateAuthorized } from "@/lib/actions/gate.actions";

export interface EventOrganizersData {
    active: Awaited<ReturnType<typeof getEventCoOrganizers>>;
    pending: Awaited<ReturnType<typeof getEventInviteSummary>>["pending"];
    denied: Awaited<ReturnType<typeof getEventInviteSummary>>["denied"];
    acceptedInvites: Awaited<ReturnType<typeof getEventInviteSummary>>["accepted"];
    committeeSize: number;
    pendingCount: number;
}

export const getEventOrganizers = cache(async (eventId: string): Promise<EventOrganizersData> => {
    const empty: EventOrganizersData = {
        active: [],
        pending: [],
        denied: [],
        acceptedInvites: [],
        committeeSize: 0,
        pendingCount: 0,
    };

    if (!isValidObjectId(eventId)) return empty;

    const authorized = await isGateAuthorized(eventId);
    if (!authorized) return empty;

    const [active, summary] = await Promise.all([
        getEventCoOrganizers(eventId),
        getEventInviteSummary(eventId),
    ]);

    return {
        active,
        pending: summary.pending,
        denied: summary.denied,
        acceptedInvites: summary.accepted,
        committeeSize: active.length,
        pendingCount: summary.pending.length,
    };
});
