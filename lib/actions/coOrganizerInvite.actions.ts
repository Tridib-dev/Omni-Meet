"use server";

import { auth } from "@clerk/nextjs/server";
import {
    acceptCoOrganizerInvite,
    declineCoOrganizerInvite,
    type CoOrganizerInviteMutationResult,
} from "@/lib/co-organizer-invites";

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
