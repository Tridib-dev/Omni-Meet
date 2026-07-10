import { Schema, model, models, Model } from "mongoose";

export interface IUser {
    clerkId: string;         // Clerk's user ID — primary link between Clerk and DB
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    photo: string;
    bio?: string;
    role?: string;
    interests?: string[];
    hearAboutUs?: string;
    onboarded: boolean;
    onboardingStep: number;
    eventsHostedCount: number;
    createdAt: Date;
    updatedAt: Date;
}

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser>(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            default: "",
            trim: true,
        },
        photo: {
            type: String,
            default: "",
        },
        bio: { type: String, default: "", trim: true },
        role: {
            type: String,
            default: "",
            trim: true,
        },
        interests: {
            type: [String],
            default: [],
        },
        hearAboutUs: {
            type: String,
            default: "",
            trim: true,
        },
        onboarded: {
            type: Boolean,
            default: false,
            index: true,
        },
        onboardingStep: {
            type: Number,
            default: 0,
            min: 0,
        },
        eventsHostedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

const User =
    (models.User as UserModel | undefined) ??
    model<IUser>("User", userSchema);

export { User };
export default User;
