'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "../mongodb";
import { Booking } from "@/database/booking.model";

// ─── Create Booking ───────────────────────────────────────────────────────────
// No longer accepts email as a param — pulls identity from the active
// Clerk session so a user can only book as themselves.

export const CreateBooking = async ({
    eventId,
    slug,
}: {
    eventId: string;
    slug: string;
}) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "You must be signed in to book an event." };
        }

        // Pull the verified email directly from Clerk — no trusting client input
        const user = await currentUser();
        const email = user?.emailAddresses?.[0]?.emailAddress;

        if (!email) {
            return { success: false, error: "No email address found on your account." };
        }

        await connectToDatabase();

        await Booking.create({
            clerkId: userId,
            eventId,
            slug,
            email: email.toLowerCase().trim(),
        });

        return { success: true };
    } catch (error: any) {
        if (error.code === 11000) {
            return {
                success: false,
                error: "You've already booked this event.",
            };
        }
        console.error("Booking Creation Failed", error);
        return { success: false, error: "Failed to create booking." };
    }
};

// ─── Attendee Count ───────────────────────────────────────────────────────────

export const getAttendeesCount = async (eventId: string): Promise<number> => {
    try {
        await connectToDatabase();
        return await Booking.countDocuments({ eventId });
    } catch (error) {
        console.error("Failed to get attendees count:", error);
        return 0;
    }
};

// ─── Check if current user has booked ────────────────────────────────────────
// Replaces the old email-based check — uses clerkId from session instead.

export const hasUserBookedEvent = async (eventId: string): Promise<boolean> => {
    try {
        const { userId } = await auth();
        if (!userId) return false;

        await connectToDatabase();

        const booking = await Booking.findOne({ clerkId: userId, eventId });
        return !!booking;
    } catch (error) {
        console.error("Failed to check booking status:", error);
        return false;
    }
};

// ─── Get all bookings for current user ───────────────────────────────────────

export const getUserBookings = async () => {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        await connectToDatabase();

        const bookings = await Booking.find({ clerkId: userId })
            .populate("eventId")
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(bookings));
    } catch (error) {
        console.error("Failed to get user bookings:", error);
        return [];
    }
};