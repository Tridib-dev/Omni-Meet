import { sendEmail } from "../send";
import {
    html as eventReminderHtml,
    subject as eventReminderSubject,
    type EventReminderData,
    type ReminderTiming,
} from "../templates/EventReminder";
import {
    html as organizerReminderHtml,
    subject as organizerReminderSubject,
    type OrganizerReminderData,
} from "../templates/OrganizerReminder";

export async function sendEventReminder(
    data: Omit<EventReminderData, "timing">,
    timing: ReminderTiming
): Promise<void> {
    try {
        const html = await eventReminderHtml({ ...data, timing });
        await sendEmail(data.to, eventReminderSubject(data.eventTitle, timing), html);
    } catch (error) {
        console.error("[Email] sendEventReminder failed:", error);
    }
}

export async function sendOrganizerReminder(data: OrganizerReminderData): Promise<void> {
    try {
        const html = await organizerReminderHtml(data);
        await sendEmail(data.to, organizerReminderSubject(data.eventTitle), html);
    } catch (error) {
        console.error("[Email] sendOrganizerReminder failed:", error);
    }
}
