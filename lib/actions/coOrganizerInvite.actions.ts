"use server";

import { auth } from "@clerk/nextjs/server";
import { getEventOrganizers } from "@/lib/event-dashboard/organizers";
import {
    sendCoOrganizerInvites,
    revokeCoOrganizerInvite,
    acceptCoOrganizerInvite,
    declineCoOrganizerInvite,
    type SendCoOrganizerInvitesResult,
    type CoOrganizerInviteMutationResult,
} from "@/lib/co-organizer-invites";

export async function sendCoOrganizerInvitesAction(
    eventId: string,
    inviteeClerkIds: string[]
): Promise<SendCoOrganizerInvitesResult> {
    const { userId } = await auth();
    if (!userId) {
        return { sent: [], skipped: inviteeClerkIds };
    }

    return sendCoOrganizerInvites(eventId, inviteeClerkIds, userId);
}

export async function getCoOrganizerInviteStateAction(eventId: string): Promise<{
    activeClerkIds: string[];
    pendingClerkIds: string[];
    deniedClerkIds: string[];
}> {
    const data = await getEventOrganizers(eventId);
    return {
        activeClerkIds: data.active.map((item) => item.clerkId),
        pendingClerkIds: data.pending.map((item) => item.clerkId),
        deniedClerkIds: data.denied.map((item) => item.clerkId),
    };
}

export async function revokeCoOrganizerInviteAction(
    eventId: string,
    inviteeClerkId: string
): Promise<CoOrganizerInviteMutationResult> {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, reason: "unauthorized" };
    }

    return revokeCoOrganizerInvite(eventId, inviteeClerkId, userId);
}

export async function acceptCoOrganizerInviteAction(
    inviteId: string
): Promise<CoOrganizerInviteMutationResult> {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, reason: "unauthorized" };
    }

    return acceptCoOrganizerInvite(inviteId, userId);
}

export async function declineCoOrganizerInviteAction(
    inviteId: string
): Promise<CoOrganizerInviteMutationResult> {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, reason: "unauthorized" };
    }

    return declineCoOrganizerInvite(inviteId, userId);
}
