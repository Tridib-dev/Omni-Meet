import { Schema, model, models, Model } from "mongoose";

export type SocialPlatform = "instagram" | "x" | "linkedin";

export interface ISocialAccount {
    clerkId: string;
    platform: SocialPlatform;
    handle: string;
    followersCount: number;
    profileUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

type SocialAccountModel = Model<ISocialAccount>;

const socialAccountSchema = new Schema<ISocialAccount>(
    {
        clerkId:        { type: String, required: true, index: true },
        platform:       { type: String, required: true, enum: ["instagram", "x", "linkedin"] },
        handle:         { type: String, required: true, trim: true },
        followersCount: { type: Number, default: 0, min: 0 },
        profileUrl:     { type: String, default: "" },
    },
    { timestamps: true }
);

// One account per platform per user
socialAccountSchema.index({ clerkId: 1, platform: 1 }, { unique: true });

const SocialAccount =
    (models.SocialAccount as SocialAccountModel | undefined) ??
    model<ISocialAccount>("SocialAccount", socialAccountSchema);

export { SocialAccount };
export default SocialAccount;
