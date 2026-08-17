"use server";

import { cache } from "react";
import { isValidObjectId } from "mongoose";
import { getEventAttendees } from "@/lib/actions/gate.actions";

export type ApplicantFilter = "all" | "checked-in" | "pending";

export interface EventApplicantRow {
    id: string;
    type: "free" | "paid";
    email: string;
    checkedIn: boolean;
    checkedInAt?: string;
    bookedAt: string;
}

export interface EventApplicantsData {
    rows: EventApplicantRow[];
    total: number;
    checkedIn: number;
    pending: number;
    todaySignups: number;
    checkinRate: number;
}

export const getEventApplicants = cache(
    async (eventId: string, filter: ApplicantFilter = "all"): Promise<EventApplicantsData> => {
        const empty: EventApplicantsData = {
            rows: [],
            total: 0,
            checkedIn: 0,
            pending: 0,
            todaySignups: 0,
            checkinRate: 0,
        };

        if (!isValidObjectId(eventId)) return empty;

        const data = await getEventAttendees(eventId);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        let rows: EventApplicantRow[] = data.attendees.map((attendee) => ({
            id: attendee.id,
            type: attendee.type === "order" ? "paid" : "free",
            email: attendee.email,
            checkedIn: attendee.checkedIn,
            checkedInAt: attendee.checkedInAt,
            bookedAt: attendee.bookedAt,
        }));

        if (filter === "checked-in") {
            rows = rows.filter((row) => row.checkedIn);
        } else if (filter === "pending") {
            rows = rows.filter((row) => !row.checkedIn);
        }

        const todaySignups = data.attendees.filter(
            (row) => new Date(row.bookedAt) >= todayStart
        ).length;

        const checkinRate =
            data.total > 0 ? Math.round((data.checkedIn / data.total) * 100) : 0;

        return {
            rows,
            total: data.total,
            checkedIn: data.checkedIn,
            pending: data.remaining,
            todaySignups,
            checkinRate,
        };
    }
);
