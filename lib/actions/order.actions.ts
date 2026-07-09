"use server";

import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/database/Order.model";

// Called after Razorpay payment is verified — creates the paid order record
export const createOrder = async ({
    eventId,
    eventTitle,
    eventSlug,
    amount,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}: {
    eventId: string;
    eventTitle: string;
    eventSlug: string;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}) => {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        await connectToDatabase();

        const order = await Order.findOneAndUpdate(
            { razorpayOrderId },
            {
                clerkId: userId,
                eventId,
                eventTitle,
                eventSlug,
                amount,
                razorpayPaymentId,
                razorpaySignature,
                status: "paid",
            },
            { upsert: true, returnDocument: "after" }
        );

        return { success: true, order: JSON.parse(JSON.stringify(order)) };
    } catch (error) {
        console.error("[createOrder]", error);
        return { success: false, error: "Failed to save order." };
    }
};

// Check if the current user has a paid order for an event
export const hasUserPaidForEvent = async (eventId: string): Promise<boolean> => {
    try {
        const { userId } = await auth();
        if (!userId) return false;

        await connectToDatabase();

        const order = await Order.findOne({
            clerkId: userId,
            eventId,
            status: "paid",
        });

        return !!order;
    } catch {
        return false;
    }
};

// Get all paid orders for the current user (for dashboard)
export const getUserOrders = async () => {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        await connectToDatabase();

        const orders = await Order.find({ clerkId: userId, status: "paid" })
            .populate("eventId")
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(orders));
    } catch {
        return [];
    }
};