// app/api/razorpay/create-order/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { isValidObjectId } from "mongoose";
import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { rupeesToPaise } from "@/lib/payments/money";

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

        const body = await req.json() as { eventId?: unknown };
        const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";

        if (!eventId || !isValidObjectId(eventId)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();
        const event = await Event.findById(eventId).select("price title slug").lean<{
            price?: number;
            title: string;
            slug: string;
        } | null>();
        if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

        const amountPaise = rupeesToPaise(event.price ?? 0);
        if (!amountPaise) {
            return NextResponse.json({ error: "This event does not require payment" }, { status: 400 });
        }

        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now().toString().slice(-10)}`,
            notes: {
                eventId,
                eventTitle: event.title,
                eventSlug: event.slug,
                clerkId: userId,
                amountPaise: String(amountPaise),
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
