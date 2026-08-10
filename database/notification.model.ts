import { Schema, model, models, Model } from "mongoose";

export type NotificationCategory = "activity" | "requests";
export type NotificationType =
    | "follow"
    | "event_created"
    | "co_organizer_invite"
    | "co_organizer_accepted";
export type NotificationRequestStatus = "pending" | "accepted" | "denied";

export interface INotification {
    recipientClerkId: string;
    actorClerkId: string;
    actorUsername: string;
    actorName: string;
    actorPhoto: string;
    type: NotificationType;
    category?: NotificationCategory;
    title: string;
    body: string;
    eventId?: string;
    eventSlug?: string;
    eventTitle?: string;
    profileUsername?: string;
    inviteId?: string;
    requestStatus?: NotificationRequestStatus;
    readAt?: Date | null;
    dedupeKey?: string;
    createdAt: Date;
    updatedAt: Date;
}

type NotificationModel = Model<INotification>;

const notificationSchema = new Schema<INotification>(
    {
        recipientClerkId: { type: String, required: true, index: true },
        actorClerkId: { type: String, required: true, index: true },
        actorUsername: { type: String, required: true, trim: true },
        actorName: { type: String, required: true, trim: true },
        actorPhoto: { type: String, default: "" },
        type: {
            type: String,
            required: true,
            enum: ["follow", "event_created", "co_organizer_invite", "co_organizer_accepted"],
            index: true,
        },
        category: {
            type: String,
            enum: ["activity", "requests"],
            index: true,
        },
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true, trim: true },
        eventId: { type: String, index: true },
        eventSlug: { type: String, index: true },
        eventTitle: { type: String, trim: true },
        profileUsername: { type: String, trim: true, index: true },
        inviteId: { type: String, index: true },
        requestStatus: {
            type: String,
            enum: ["pending", "accepted", "denied"],
        },
        readAt: { type: Date, default: null, index: true },
        dedupeKey: { type: String, unique: true, sparse: true, index: true },
    },
    { timestamps: true }
);

notificationSchema.index({ recipientClerkId: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ recipientClerkId: 1, createdAt: -1 });

const Notification =
    (models.Notification as NotificationModel | undefined) ??
    model<INotification>("Notification", notificationSchema);

export { Notification };
export default Notification;
