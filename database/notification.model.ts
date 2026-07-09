import { Schema, model, models, Model } from "mongoose";

export type NotificationType = "follow" | "event_created";

export interface INotification {
    recipientClerkId: string;
    actorClerkId: string;
    actorUsername: string;
    actorName: string;
    actorPhoto: string;
    type: NotificationType;
    title: string;
    body: string;
    eventId?: string;
    eventSlug?: string;
    eventTitle?: string;
    profileUsername?: string;
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
            enum: ["follow", "event_created"],
            index: true,
        },
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true, trim: true },
        eventId: { type: String, index: true },
        eventSlug: { type: String, index: true },
        eventTitle: { type: String, trim: true },
        profileUsername: { type: String, trim: true, index: true },
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
