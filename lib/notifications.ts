import connectToDatabase from "@/lib/mongodb";
import {
    Notification,
    type NotificationCategory,
    type NotificationRequestStatus,
    type NotificationType,
} from "@/database/notification.model";
import { Follow } from "@/database/follow.model";
import { User } from "@/database/User.model";

type ActorSnapshot = {
    clerkId: string;
    username: string;
    name: string;
    photo: string;
};

async function getActorSnapshot(clerkId: string): Promise<ActorSnapshot> {
    const user = await User.findOne({ clerkId })
        .select("clerkId username firstName lastName photo")
        .lean<{ clerkId: string; username?: string; firstName?: string; lastName?: string; photo?: string }>();

    const username = user?.username ?? "";
    const name = [user?.firstName ?? "", user?.lastName ?? ""].filter(Boolean).join(" ").trim() || username || "Someone";

    return {
        clerkId,
        username,
        name,
        photo: user?.photo ?? "",
    };
}

async function upsertNotification(params: {
    recipientClerkId: string;
    actor: ActorSnapshot;
    type: NotificationType;
    category?: NotificationCategory;
    title: string;
    body: string;
    dedupeKey: string;
    eventId?: string;
    eventSlug?: string;
    eventTitle?: string;
    profileUsername?: string;
    inviteId?: string;
    requestStatus?: NotificationRequestStatus;
}) {
    const category =
        params.category ??
        (params.type === "co_organizer_invite" ? "requests" : "activity");

    await Notification.updateOne(
        { dedupeKey: params.dedupeKey },
        {
            $setOnInsert: {
                recipientClerkId: params.recipientClerkId,
                actorClerkId: params.actor.clerkId,
                actorUsername: params.actor.username,
                actorName: params.actor.name,
                actorPhoto: params.actor.photo,
                type: params.type,
                category,
                title: params.title,
                body: params.body,
                eventId: params.eventId,
                eventSlug: params.eventSlug,
                eventTitle: params.eventTitle,
                profileUsername: params.profileUsername,
                inviteId: params.inviteId,
                requestStatus: params.requestStatus,
                dedupeKey: params.dedupeKey,
            },
        },
        { upsert: true }
    );
}

export async function updateCoOrganizerInviteNotificationStatus({
    inviteeClerkId,
    eventId,
    requestStatus,
}: {
    inviteeClerkId: string;
    eventId: string;
    requestStatus: NotificationRequestStatus;
}) {
    await connectToDatabase();

    await Notification.updateOne(
        { dedupeKey: `co_organizer_invite:${inviteeClerkId}:${eventId}` },
        {
            $set: {
                requestStatus,
                readAt: new Date(),
            },
        }
    );
}

export async function deleteCoOrganizerInviteNotification({
    inviteeClerkId,
    eventId,
}: {
    inviteeClerkId: string;
    eventId: string;
}) {
    if (!inviteeClerkId || !eventId) {
        return;
    }

    await connectToDatabase();

    await Notification.deleteOne({
        dedupeKey: `co_organizer_invite:${inviteeClerkId}:${eventId}`,
    });
}

export async function notifyFollowCreated({
    followerClerkId,
    followingClerkId,
}: {
    followerClerkId: string;
    followingClerkId: string;
}) {
    if (!followerClerkId || !followingClerkId || followerClerkId === followingClerkId) {
        return;
    }

    await connectToDatabase();

    const actor = await getActorSnapshot(followerClerkId);
    const target = await User.findOne({ clerkId: followingClerkId })
        .select("username")
        .lean<{ username?: string }>();

    await upsertNotification({
        recipientClerkId: followingClerkId,
        actor,
        type: "follow",
        title: "New follower",
        body: `${actor.name} started following you.`,
        profileUsername: actor.username || undefined,
        dedupeKey: `follow:${followingClerkId}:${followerClerkId}`,
    });

    return target?.username ?? null;
}

export async function notifyFollowersOfNewEvent({
    creatorClerkId,
    eventId,
    eventSlug,
    eventTitle,
}: {
    creatorClerkId: string;
    eventId: string;
    eventSlug: string;
    eventTitle: string;
}) {
    if (!creatorClerkId || !eventId || !eventSlug || !eventTitle) {
        return;
    }

    await connectToDatabase();

    const actor = await getActorSnapshot(creatorClerkId);
    const followers = await Follow.find({ followingId: creatorClerkId })
        .select("followerId")
        .lean<{ followerId: string }[]>();

    if (followers.length === 0) {
        return;
    }

    await Promise.all(
        followers.map((follow) =>
            upsertNotification({
                recipientClerkId: follow.followerId,
                actor,
                type: "event_created",
                title: "New event from someone you follow",
                body: `${actor.name} created ${eventTitle}.`,
                eventId,
                eventSlug,
                eventTitle,
                profileUsername: actor.username || undefined,
                dedupeKey: `event_created:${follow.followerId}:${eventId}`,
            })
        )
    );
}

export async function notifyCoOrganizerInvited({
    inviteId,
    eventId,
    eventSlug,
    eventTitle,
    inviteeClerkId,
    invitedByClerkId,
}: {
    inviteId: string;
    eventId: string;
    eventSlug: string;
    eventTitle: string;
    inviteeClerkId: string;
    invitedByClerkId: string;
}) {
    if (!inviteId || !eventId || !eventSlug || !eventTitle || !inviteeClerkId || !invitedByClerkId) {
        return;
    }

    if (inviteeClerkId === invitedByClerkId) {
        return;
    }

    await connectToDatabase();

    const actor = await getActorSnapshot(invitedByClerkId);

    await Notification.updateOne(
        { dedupeKey: `co_organizer_invite:${inviteeClerkId}:${eventId}` },
        {
            $set: {
                recipientClerkId: inviteeClerkId,
                actorClerkId: actor.clerkId,
                actorUsername: actor.username,
                actorName: actor.name,
                actorPhoto: actor.photo,
                type: "co_organizer_invite" as NotificationType,
                category: "requests" as NotificationCategory,
                title: "Co-organizer invitation",
                body: `${actor.name} invited you to co-organize ${eventTitle}.`,
                eventId,
                eventSlug,
                eventTitle,
                profileUsername: actor.username || undefined,
                inviteId,
                requestStatus: "pending" as NotificationRequestStatus,
                readAt: null,
            },
            $setOnInsert: {
                dedupeKey: `co_organizer_invite:${inviteeClerkId}:${eventId}`,
            },
        },
        { upsert: true }
    );
}

export async function notifyCoOrganizerAccepted({
    eventId,
    eventSlug,
    eventTitle,
    organizerClerkId,
    acceptedByClerkId,
}: {
    eventId: string;
    eventSlug: string;
    eventTitle: string;
    organizerClerkId: string;
    acceptedByClerkId: string;
}) {
    if (!eventId || !eventSlug || !eventTitle || !organizerClerkId || !acceptedByClerkId) {
        return;
    }

    await connectToDatabase();

    const actor = await getActorSnapshot(acceptedByClerkId);

    await upsertNotification({
        recipientClerkId: organizerClerkId,
        actor,
        type: "co_organizer_accepted",
        category: "activity",
        title: "Co-organizer accepted",
        body: `${actor.name} accepted your co-organizer invite for ${eventTitle}.`,
        eventId,
        eventSlug,
        eventTitle,
        profileUsername: actor.username || undefined,
        dedupeKey: `co_organizer_accepted:${organizerClerkId}:${eventId}:${acceptedByClerkId}`,
    });
}

export async function buildNotificationHref(notification: {
    type: NotificationType;
    eventSlug?: string;
    profileUsername?: string;
}) {
    if (
        (notification.type === "event_created" || notification.type === "co_organizer_accepted") &&
        notification.eventSlug
    ) {
        return `/events/${notification.eventSlug}`;
    }

    if (notification.type === "co_organizer_invite" && notification.eventSlug) {
        return `/events/${notification.eventSlug}`;
    }

    if (notification.profileUsername) {
        return `/profile/${notification.profileUsername}`;
    }

    return "/dashboard/profile";
}
