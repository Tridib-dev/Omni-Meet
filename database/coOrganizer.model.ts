import { Schema, model, models, Model, Types } from "mongoose";

export interface ICoOrganizer {
    eventId: Types.ObjectId;
    clerkId: string;
    addedByClerkId?: string;
    addedAt: Date;
}

type CoOrganizerModel = Model<ICoOrganizer>;

const coOrganizerSchema = new Schema<ICoOrganizer>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        clerkId: {
            type: String,
            required: true,
            trim: true,
        },
        addedByClerkId: {
            type: String,
            trim: true,
        },
        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

coOrganizerSchema.index({ eventId: 1, clerkId: 1 }, { unique: true });
coOrganizerSchema.index({ eventId: 1 });
coOrganizerSchema.index({ clerkId: 1 });

const CoOrganizer =
    (models.CoOrganizer as CoOrganizerModel | undefined) ??
    model<ICoOrganizer>("CoOrganizer", coOrganizerSchema);

export { CoOrganizer };
export default CoOrganizer;
