// lib/email/send.ts
// All outbound email goes through this file.
// Every function is fire-and-forget — a failed email never breaks a booking.

import { resend, FROM_EMAIL, BASE_URL } from "./client";
import {
    bookingConfirmationHtml,
    bookingConfirmationSubject,
    type BookingConfirmationData,
} from "./BookingConfirmation";

// ─── Booking confirmation ─────────────────────────────────────────────────────

export async function sendBookingConfirmation(
    data: BookingConfirmationData
): Promise<void> {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn("[Email] Skipping send — RESEND_API_KEY not set.");
            return;
        }

        const { error } = await resend.emails.send({
            from: `Omni Meet <${FROM_EMAIL}>`,
            to:   [data.to],
            subject: bookingConfirmationSubject(data.eventTitle),
            html: bookingConfirmationHtml(data, BASE_URL),
        });

        if (error) {
            console.error("[Email] sendBookingConfirmation failed:", error);
        } else {
            console.log(`[Email] Confirmation sent to ${data.to} for "${data.eventTitle}"`);
        }
    } catch (err) {
        console.error("[Email] Unexpected error in sendBookingConfirmation:", err);
    }
}
