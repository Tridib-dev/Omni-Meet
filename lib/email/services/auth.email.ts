import { sendEmail } from "../send";
import { html as welcomeEmailHtml, subject as welcomeEmailSubject, type WelcomeEmailData } from "../templates/WelcomeEmail";

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    try {
        const html = await welcomeEmailHtml(data);
        await sendEmail(data.to, welcomeEmailSubject(data.firstName), html);
    } catch (error) {
        console.error("[Email] sendWelcomeEmail failed:", error);
    }
}
