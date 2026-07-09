import { Schema, model, models, Model } from "mongoose";

export interface IFollow {
    followerId: string;   // clerkId of the user who follows
    followingId: string;  // clerkId of the user being followed
    createdAt: Date;
}

type FollowModel = Model<IFollow>;

const followSchema = new Schema<IFollow>(
    {
        followerId:  { type: String, required: true, index: true },
        followingId: { type: String, required: true, index: true },
    },
    { timestamps: true }
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow =
    (models.Follow as FollowModel | undefined) ??
    model<IFollow>("Follow", followSchema);

export { Follow };
export default Follow;
