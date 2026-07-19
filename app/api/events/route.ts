// app/api/events/route.ts

import { Event } from "@/database/event.model";
import { User } from "@/database/User.model";
import connectToDatabase from "@/lib/mongodb";
import imagekit from "@/lib/imagekit";
import { type EventCategory } from "@/lib/constants/event-categories";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { validateEmails } from "@/lib/validateemail";
import { slugifySegment } from "@/lib/seo-events";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notifyFollowersOfNewEvent } from "@/lib/notifications";

type AgendaItem = {
    startTime: string;
    endTime: string;
    keynote: string;
};

type ImageKitUploadResult = {
    url: string;
    fileId?: string;
    file_id?: string;
    fileID?: string;
};

const isDuplicateKeyError = (error: unknown): boolean =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000;

/**
 * Normally the Clerk `user.created` webhook has already inserted this row.
 * If it hasn't yet (webhook not reachable in dev, a missed delivery, or a
 * race where the event fires but hasn't been processed), fetch the profile
 * straight from Clerk and create it here instead of failing the request.
 */
const getOrCreateUser = async (userId: string) => {
    let creator = await User.findOneAndUpdate(
        { clerkId: userId },
        { $inc: { eventsHostedCount: 1 } },
        { returnDocument: "after" }
    ).select("username firstName lastName photo eventsHostedCount");

    if (creator) return creator;

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
        // Matches the same "no email yet" edge case the webhook already skips.
        return null;
    }

    try {
        creator = await User.create({
            clerkId: userId,
            email,
            username: clerkUser.username ?? email.split("@")[0],
            firstName: clerkUser.firstName || email.split("@")[0],
            lastName: clerkUser.lastName ?? "",
            photo: clerkUser.imageUrl ?? "",
            onboarded: false,
            onboardingStep: 0,
            eventsHostedCount: 1,
        });
    } catch (err) {
        // The webhook may have inserted the row in the split-second between
        // our findOneAndUpdate above and this create — re-fetch instead of failing.
        if (isDuplicateKeyError(err)) {
            creator = await User.findOneAndUpdate(
                { clerkId: userId },
                { $inc: { eventsHostedCount: 1 } },
                { returnDocument: "after" }
            ).select("username firstName lastName photo eventsHostedCount");
        } else {
            throw err;
        }
    }

    return creator;
};

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // ==================== CREATOR PROFILE (self-healing) ====================
        const creator = await getOrCreateUser(userId);
        if (!creator) {
            return NextResponse.json(
                { message: "We couldn't find an email on your account yet. Please finish signing up and try again." },
                { status: 404 }
            );
        }
        const isFirstEvent = (creator.eventsHostedCount ?? 1) === 1;
        // ==========================================================================

        const formData = await req.formData();

        const eventFields = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

        const title = String(eventFields.title ?? "").trim();
        if (!title) {
            return NextResponse.json({ message: "Title is required" }, { status: 400 });
        }

        const slug = slugifySegment(title);

        const organizerEmails = formData.getAll("organizerEmails") as string[];
        const emailCheck = await validateEmails(organizerEmails);
        if (!emailCheck.valid) {
            return Response.json({ error: emailCheck.reason }, { status: 400 });
        }

        // ==================== IMAGE VALIDATION ====================
        const fileEntry = formData.get("image");
        if (!(fileEntry instanceof File) || fileEntry.size === 0) {
            return NextResponse.json({ message: 'Image File is required' }, { status: 400 });
        }

        const file = fileEntry;

        const MAX_FILE_SIZE = 3 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                message: 'Image size must be less than 3MB. Please upload a smaller image.'
            }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                message: 'Only JPG, PNG, and WebP images are allowed.'
            }, { status: 400 });
        }
        // ========================================================

        const tags = formData.getAll('tags') as string[];
        const audience = formData.getAll('audience') as string[];

        let agenda: AgendaItem[];
        try {
            agenda = JSON.parse(formData.get('agenda') as string);
            if (!Array.isArray(agenda) || agenda.length === 0) {
                throw new Error("Agenda must be a non-empty array.");
            }
        } catch {
            return NextResponse.json({ message: "Invalid agenda data." }, { status: 400 });
        }

        const existingEvent = await Event.findOne({ slug });
        if (existingEvent) {
            return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
        }

        // Upload Image
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const cleanFileName = `${Date.now()}-${slugifySegment(title)}.${file.name.split('.').pop() || 'jpg'}`;

        const uploadResult = await imagekit.upload({
            file: buffer,
            fileName: cleanFileName,
            folder: "/DevEvent",
            useUniqueFileName: true,
        }) as ImageKitUploadResult;

        if (!uploadResult?.url) {
            return NextResponse.json({ message: 'Image upload failed. Please try again.' }, { status: 500 });
        }

        const imageFileId = uploadResult.fileId || uploadResult.file_id || uploadResult.fileID;

        try {
            const create_event = await Event.create({
                title: String(eventFields.title ?? ""),
                slug,
                description: String(eventFields.description ?? ""),
                overview: String(eventFields.overview ?? ""),
                image: uploadResult.url,
                venue: String(eventFields.venue ?? ""),
                location: String(eventFields.location ?? ""),
                address: String(eventFields.address ?? ""),
                city: String(eventFields.city ?? ""),
                state: String(eventFields.state ?? ""),
                country: String(eventFields.country ?? ""),
                category: String(eventFields.category ?? "") as EventCategory,
                date: String(eventFields.date ?? ""),
                time: String(eventFields.time ?? ""),
                mode: String(eventFields.mode ?? ""),
                audience,
                price: Number(eventFields.price ?? 0),
                sponsors: JSON.parse(formData.get('sponsors') as string || '[]'),
                organizer: String(eventFields.organizer ?? ""),
                tags,
                agenda,
                organizerEmails,
                creatorClerkId: userId,
            });

            await notifyFollowersOfNewEvent({
                creatorClerkId: userId,
                eventId: create_event._id.toString(),
                eventSlug: create_event.slug,
                eventTitle: create_event.title,
            });

            revalidateTag("events", "default");
            if (creator.username) {
                revalidatePath(`/profile/${creator.username}`);
            }
            return NextResponse.json({
                message: 'Event Created Successfully',
                event: create_event,
                isFirstEvent,
            }, { status: 201 });

        } catch (createErr: unknown) {
            if (imageFileId) {
                try {
                    await imagekit.deleteFile(imageFileId);
                } catch (deleteErr) {
                    console.error('ImageKit cleanup failed:', deleteErr);
                }
            }

            if (isDuplicateKeyError(createErr)) {
                return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
            }

            console.error('Event creation failed:', createErr);
            return NextResponse.json({
                message: 'Event Creation failed',
                error: createErr instanceof Error ? createErr.message : 'Unknown error',
            }, { status: 500 });
        }

    } catch (err: unknown) {
        if (isDuplicateKeyError(err)) {
            return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
        }
        console.error(err);
        return NextResponse.json({
            message: 'Event Creation failed',
            error: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectToDatabase();
        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({ message: 'Event Fetched Successfully', events }, { status: 200 });
    } catch (err) {
        console.error('Event fetching failed:', err);
        return NextResponse.json({ message: 'Event Fetching Failed', error: err }, { status: 500 });
    }
}