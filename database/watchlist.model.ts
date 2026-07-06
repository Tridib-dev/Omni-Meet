import { Schema, model, models, Model, Types } from "mongoose";

export interface IWatchlist {
    clerkId: string;
    eventId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

type WatchlistModel = Model<IWatchlist>;

const watchlistSchema = new Schema<IWatchlist>(
    {
        clerkId: { type: String, required: true, index: true },
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    },
    { timestamps: true }
);

// One save per user per event
watchlistSchema.index({ clerkId: 1, eventId: 1 }, { unique: true });

const Watchlist =
    (models.Watchlist as WatchlistModel | undefined) ??
    model<IWatchlist>("Watchlist", watchlistSchema);

export { Watchlist };
export default Watchlist;