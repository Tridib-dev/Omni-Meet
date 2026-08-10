import { Types, isValidObjectId } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { CoOrganizer } from "@/database/coOrganizer.model";
import {
    CoOrganizerInvite,
    type CoOrganizerInviteStatus,
    type ICoOrganizerInvite,
} from "@/database/coOrganizerInvite.model";
import { Event } from "@/database/event.model";
import { User } from "@/database/User.model";
import {
    notifyCoOrganizerAccepted,
    notifyCoOrganizerInvited,
    updateCoOrganizerInviteNotificationStatus,
} from "@/lib/notifications";

export type CoOrganizerInviteResultReason =
    | "success"
    | "unauthorized"
    | "not_found"
    | "already_pending"
    | "already_accepted"
    | "invalid";

export type SendCoOrganizerInvitesResult = {
    sent: string[];
    skipped: string[];
};

export type CoOrganizerInviteMutationResult = {
    success: boolean;
    reason?: CoOrganizerInviteResultReason;
    inviteId?: string;
};

export type CoOrganizerInviteSummaryItem = {
    inviteId: string;
    clerkId: string;
    name: string;
    photo: string;
    status: CoOrganizerInviteStatus;
    invitedAt: string;
    respondedAt?: string;
};

export type EventInviteSummary = {
    accepted: CoOrganizerInviteSummaryItem[];
    pending: CoOrganizerInviteSummaryItem[];
    denied: CoOrganizerInviteSummaryItem[];
};

type EventDoc = {
    _id: Types.ObjectId;
    creatorClerkId: string;
    slug: string;
    title: string;
};

type InviteDoc = ICoOrganizerInvite & {
    _id: Types.ObjectId;
};

async function resolveProfile(clerkId: string): Promise<{ name: string; photo: string } | null> {
    const user = await User.findOne({ clerkId })
        .select("firstName lastName username photo")
        .lean<{ firstName?: string; lastName?: string; username?: string; photo?: string }>();

    if (!user) return null;

    const name =
        [user.firstName ?? "", user.lastName ?? ""].filter(Boolean).join(" ").trim() ||
        user.username ||
        "Unknown user";

    return { name, photo: user.photo ?? "" };
}

async function getEventForInvite(eventId: string | Types.ObjectId): Promise<EventDoc | null> {
    if (!isValidObjectId(eventId)) return null;

    const event = await Event.findById(eventId)
        .select("_id creatorClerkId slug title")
        .lean<EventDoc>();

    return event ?? null;
}

async function serializeInviteSummary(invite: InviteDoc): Promise<CoOrganizerInviteSummaryItem | null> {
    const profile = await resolveProfile(invite.inviteeClerkId);
    if (!profile) return null;

    return {
        inviteId: invite._id.toString(),
        clerkId: invite.inviteeClerkId,
        name: profile.name,
        photo: profile.photo,
        status: invite.status,
        invitedAt: invite.invitedAt.toISOString(),
        respondedAt: invite.respondedAt?.toISOString(),
    };
}

export async function sendCoOrganizerInvites(
    eventId: string | Types.ObjectId,
    inviteeClerkIds: string[],
    invitedByClerkId: string
): Promise<SendCoOrganizerInvitesResult> {
    const sent: string[] = [];
    const skipped: string[] = [];

    if (!invitedByClerkId || inviteeClerkIds.length === 0) {
        return { sent, skipped: inviteeClerkIds };
    }

    await connectToDatabase();

    const event = await getEventForInvite(eventId);
    if (!event) {
        return { sent, skipped: inviteeClerkIds };
    }

    if (event.creatorClerkId !== invitedByClerkId) {
        return { sent, skipped: inviteeClerkIds };
    }

    const eventIdStr = event._id.toString();
    const uniqueInvitees = Array.from(
        new Set(inviteeClerkIds.map((id) => id.trim()).filter(Boolean))
    ).filter((id) => id !== invitedByClerkId);

    for (const inviteeClerkId of uniqueInvitees) {
        const userExists = await User.exists({ clerkId: inviteeClerkId });
        if (!userExists) {
            skipped.push(inviteeClerkId);
            continue;
        }

        const alreadyCoOrganizer = await CoOrganizer.exists({
            eventId: event._id,
            clerkId: inviteeClerkId,
        });
        if (alreadyCoOrganizer) {
            skipped.push(inviteeClerkId);
            continue;
        }

        const existingInvite = (await CoOrganizerInvite.findOne({
            eventId: event._id,
            inviteeClerkId,
        }).lean()) as InviteDoc | null;

        if (existingInvite?.status === "pending") {
            skipped.push(inviteeClerkId);
            continue;
        }

        let invite: InviteDoc;

        if (existingInvite) {
            const updated = (await CoOrganizerInvite.findOneAndUpdate(
                { _id: existingInvite._id, status: { $in: ["accepted", "denied"] } },
                {
                    $set: {
                        status: "pending",
                        invitedByClerkId,
                        invitedAt: new Date(),
                        respondedAt: undefined,
                    },
                },
                { new: true }
            ).lean()) as InviteDoc | null;

            if (!updated) {
                skipped.push(inviteeClerkId);
                continue;
            }

            invite = updated;
        } else {
            try {
                invite = (await CoOrganizerInvite.create({
                    eventId: event._id,
                    inviteeClerkId,
                    invitedByClerkId,
                    status: "pending",
                    invitedAt: new Date(),
                })) as InviteDoc;
            } catch {
                skipped.push(inviteeClerkId);
                continue;
            }
        }

        await notifyCoOrganizerInvited({
            inviteId: invite._id.toString(),
            eventId: eventIdStr,
            eventSlug: event.slug,
            eventTitle: event.title,
            inviteeClerkId,
            invitedByClerkId,
        });

        sent.push(inviteeClerkId);
    }

    return { sent, skipped };
}

export async function acceptCoOrganizerInvite(
    inviteId: string,
    actingClerkId: string
): Promise<CoOrganizerInviteMutationResult> {
    if (!isValidObjectId(inviteId) || !actingClerkId) {
        return { success: false, reason: "invalid" };
    }

    await connectToDatabase();

    const invite = (await CoOrganizerInvite.findOneAndUpdate(
        {
            _id: inviteId,
            inviteeClerkId: actingClerkId,
            status: "pending",
        },
        {
            $set: {
                status: "accepted",
                respondedAt: new Date(),
            },
        },
        { new: true }
    ).lean()) as InviteDoc | null;

    if (!invite) {
        return { success: false, reason: "not_found" };
    }

    const event = await getEventForInvite(invite.eventId);
    if (!event) {
        return { success: false, reason: "not_found" };
    }

    const eventIdStr = event._id.toString();

    await CoOrganizer.updateOne(
        { eventId: event._id, clerkId: actingClerkId },
        {
            $setOnInsert: {
                eventId: event._id,
                clerkId: actingClerkId,
                addedByClerkId: invite.invitedByClerkId,
                addedAt: new Date(),
            },
        },
        { upsert: true }
    );

    await updateCoOrganizerInviteNotificationStatus({
        inviteeClerkId: actingClerkId,
        eventId: eventIdStr,
        requestStatus: "accepted",
    });

    await notifyCoOrganizerAccepted({
        eventId: eventIdStr,
        eventSlug: event.slug,
        eventTitle: event.title,
        organizerClerkId: event.creatorClerkId,
        acceptedByClerkId: actingClerkId,
    });

    return { success: true, reason: "success", inviteId };
}

export async function declineCoOrganizerInvite(
    inviteId: string,
    actingClerkId: string
): Promise<CoOrganizerInviteMutationResult> {
    if (!isValidObjectId(inviteId) || !actingClerkId) {
        return { success: false, reason: "invalid" };
    }

    await connectToDatabase();

    const invite = (await CoOrganizerInvite.findOneAndUpdate(
        {
            _id: inviteId,
            inviteeClerkId: actingClerkId,
            status: "pending",
        },
        {
            $set: {
                status: "denied",
                respondedAt: new Date(),
            },
        },
        { new: true }
    ).lean()) as InviteDoc | null;

    if (!invite) {
        return { success: false, reason: "not_found" };
    }

    await updateCoOrganizerInviteNotificationStatus({
        inviteeClerkId: actingClerkId,
        eventId: invite.eventId.toString(),
        requestStatus: "denied",
    });

    return { success: true, reason: "success", inviteId };
}

export async function cancelCoOrganizerInvite(
    inviteId: string,
    actingClerkId: string
): Promise<CoOrganizerInviteMutationResult> {
    if (!isValidObjectId(inviteId) || !actingClerkId) {
        return { success: false, reason: "invalid" };
    }

    await connectToDatabase();

    const invite = (await CoOrganizerInvite.findOne({
        _id: inviteId,
        status: "pending",
    }).lean()) as InviteDoc | null;

    if (!invite) {
        return { success: false, reason: "not_found" };
    }

    const event = await getEventForInvite(invite.eventId);
    if (!event || event.creatorClerkId !== actingClerkId) {
        return { success: false, reason: "unauthorized" };
    }

    await CoOrganizerInvite.deleteOne({ _id: inviteId, status: "pending" });

    await updateCoOrganizerInviteNotificationStatus({
        inviteeClerkId: invite.inviteeClerkId,
        eventId: invite.eventId.toString(),
        requestStatus: "denied",
    });

    return { success: true, reason: "success", inviteId };
}

export async function getPendingInvitesForUser(clerkId: string): Promise<CoOrganizerInviteSummaryItem[]> {
    if (!clerkId) return [];

    await connectToDatabase();

    const invites = (await CoOrganizerInvite.find({
        inviteeClerkId: clerkId,
        status: "pending",
    })
        .sort({ invitedAt: -1 })
        .lean()) as InviteDoc[];

    const resolved = await Promise.all(invites.map((invite) => serializeInviteSummary(invite)));
    return resolved.filter(Boolean) as CoOrganizerInviteSummaryItem[];
}

export async function getEventInviteSummary(eventId: string): Promise<EventInviteSummary> {
    const empty: EventInviteSummary = { accepted: [], pending: [], denied: [] };

    if (!isValidObjectId(eventId)) return empty;

    await connectToDatabase();

    const invites = (await CoOrganizerInvite.find({ eventId })
        .sort({ invitedAt: -1 })
        .lean()) as InviteDoc[];

    const resolved = await Promise.all(invites.map((invite) => serializeInviteSummary(invite)));
    const items = resolved.filter(Boolean) as CoOrganizerInviteSummaryItem[];

    return {
        accepted: items.filter((item) => item.status === "accepted"),
        pending: items.filter((item) => item.status === "pending"),
        denied: items.filter((item) => item.status === "denied"),
    };
}
