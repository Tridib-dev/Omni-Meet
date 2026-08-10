import { Schema, model, models, Model, Types } from "mongoose";

export type CoOrganizerInviteStatus = "pending" | "accepted" | "denied";

export interface ICoOrganizerInvite {
    eventId: Types.ObjectId;
    inviteeClerkId: string;
    invitedByClerkId: string;
    status: CoOrganizerInviteStatus;
    invitedAt: Date;
    respondedAt?: Date;
}

type CoOrganizerInviteModel = Model<ICoOrganizerInvite>;

const coOrganizerInviteSchema = new Schema<ICoOrganizerInvite>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        inviteeClerkId: {
            type: String,
            required: true,
            trim: true,
        },
        invitedByClerkId: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "accepted", "denied"],
            default: "pending",
        },
        invitedAt: {
            type: Date,
            default: Date.now,
        },
        respondedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

coOrganizerInviteSchema.index(
    { eventId: 1, inviteeClerkId: 1 },
    { unique: true, partialFilterExpression: { status: "pending" } }
);
coOrganizerInviteSchema.index({ inviteeClerkId: 1, status: 1 });
coOrganizerInviteSchema.index({ eventId: 1, status: 1 });

const CoOrganizerInvite =
    (models.CoOrganizerInvite as CoOrganizerInviteModel | undefined) ??
    model<ICoOrganizerInvite>("CoOrganizerInvite", coOrganizerInviteSchema);

export { CoOrganizerInvite };
export default CoOrganizerInvite;
