import { sendEmail } from "../send";
import {
    html as bookingConfirmationHtml,
    subject as bookingConfirmationSubject,
    type BookingConfirmationData,
} from "../templates/BookingConfirmation";
import {
    html as orderReceiptHtml,
    subject as orderReceiptSubject,
    type OrderReceiptData,
} from "../templates/OrderReceipt";

export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
    try {
        const html = await bookingConfirmationHtml(data);
        await sendEmail(data.to, bookingConfirmationSubject(data.eventTitle), html);
    } catch (error) {
        console.error("[Email] sendBookingConfirmation failed:", error);
    }
}

export async function sendOrderReceipt(data: OrderReceiptData): Promise<void> {
    try {
        const html = await orderReceiptHtml(data);
        await sendEmail(data.to, orderReceiptSubject(data.eventTitle), html);
    } catch (error) {
        console.error("[Email] sendOrderReceipt failed:", error);
    }
}
