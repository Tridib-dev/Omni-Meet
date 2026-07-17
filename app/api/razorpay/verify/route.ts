// app/api/razorpay/verify/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createOrder } from "@/lib/actions/order.actions";
import { sendBookingConfirmation } from "@/lib/email/send";
import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { clerkClient } from "@clerk/nextjs/server";



export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";


        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            eventId,
            eventTitle,
            eventSlug,
            amount,
        } = await req.json();

        // Verify HMAC signature — this is the critical security step
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: "Payment verification failed — invalid signature" },
                { status: 400 }
            );
        }

        // Signature valid — persist the order
        const result = await createOrder({
            eventId,
            eventTitle,
            eventSlug,
            amount,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Send confirmation email — fire and forget
        if (userEmail) {
            await connectToDatabase();
            const eventDoc = await Event.findById(eventId)
                .select("date time location slug")
                .lean() as any;
        
            sendBookingConfirmation({
                to: userEmail,
                eventTitle,
                eventDate: eventDoc?.date ?? "",
                eventTime: eventDoc?.time ?? "",
                eventLocation: eventDoc?.location ?? "",
                ticketId: result.order._id.toString(),
                price: amount,
                eventSlug: eventDoc?.slug ?? eventSlug,
            });
        }
        
        return NextResponse.json({ success: true, order: result.order });
    } catch (error) {
        console.error("[Razorpay verify]", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}