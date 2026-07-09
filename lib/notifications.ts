import connectToDatabase from "@/lib/mongodb";
import { Notification, type NotificationType } from "@/database/notification.model";
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
    title: string;
    body: string;
    dedupeKey: string;
    eventId?: string;
    eventSlug?: string;
    eventTitle?: string;
    profileUsername?: string;
}) {
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
                title: params.title,
                body: params.body,
                eventId: params.eventId,
                eventSlug: params.eventSlug,
                eventTitle: params.eventTitle,
                profileUsername: params.profileUsername,
                dedupeKey: params.dedupeKey,
            },
        },
        { upsert: true }
    );
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

export async function buildNotificationHref(notification: {
    type: NotificationType;
    eventSlug?: string;
    profileUsername?: string;
}) {
    if (notification.type === "event_created" && notification.eventSlug) {
        return `/events/${notification.eventSlug}`;
    }

    if (notification.profileUsername) {
        return `/profile/${notification.profileUsername}`;
    }

    return "/dashboard/profile";
}
