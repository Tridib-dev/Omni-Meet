// database/user-badge.model.ts
import { Schema, model, models, Model } from "mongoose";

export interface IUserBadge {
    clerkId: string;
    badgeId: string;
    unlockedAt: Date;
}

type UserBadgeModel = Model<IUserBadge>;

const userBadgeSchema = new Schema<IUserBadge>(
    {
        clerkId:    { type: String, required: true, index: true },
        badgeId:    { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

userBadgeSchema.index({ clerkId: 1, badgeId: 1 }, { unique: true });

const UserBadge =
    (models.UserBadge as UserBadgeModel | undefined) ??
    model<IUserBadge>("UserBadge", userBadgeSchema);

export { UserBadge };
export default UserBadge;
