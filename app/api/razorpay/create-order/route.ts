// app/api/razorpay/create-order/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, eventId, eventTitle, eventSlug } = await req.json();

        if (!amount || !eventId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // amount must be in paise (multiply rupees × 100)
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now().toString().slice(-10)}`,
            notes: {
                eventId,
                eventTitle,
                eventSlug,
                clerkId: userId,
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error("[Razorpay create-order]", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}