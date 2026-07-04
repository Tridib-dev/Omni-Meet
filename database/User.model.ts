import { Schema, model, models, Model, HydratedDocument } from "mongoose";

export interface IUser {
    clerkId: string;         // Clerk's user ID — primary link between Clerk and DB
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    photo: string;
    createdAt: Date;
    updatedAt: Date;
}

type UserDocument = HydratedDocument<IUser>;
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
    },
    { timestamps: true }
);

const User =
    (models.User as UserModel | undefined) ??
    model<IUser>("User", userSchema);

export { User };
export default User;