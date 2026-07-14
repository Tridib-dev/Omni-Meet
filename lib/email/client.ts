// lib/email/client.ts
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY is not set — emails will not be sent.");
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export const FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
