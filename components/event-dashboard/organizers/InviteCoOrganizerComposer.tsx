"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PageSection from "@/components/event-dashboard/shared/PageSection";
import { AddCoOrganizerModal } from "@/components/profileCard";

export default function InviteCoOrganizerComposer({
    eventId,
    isCreator,
}: {
    eventId: string;
    isCreator: boolean;
}) {
    const { user } = useUser();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    if (!isCreator) return null;

    return (
        <PageSection
            title="Invite co-organizer"
            description="Pick from your connections and send invites directly from the modal."
        >
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#332be0]/30 bg-[#332be0]/12 px-4 py-2 text-[13px] font-medium text-[#a5a0ff] transition-colors hover:bg-[#332be0]/18"
                >
                    <Plus size={16} />
                    Add co-organizer
                </button>
            </div>

            <AddCoOrganizerModal
                open={open}
                onOpenChange={setOpen}
                viewerClerkId={user?.id ?? ""}
                eventId={eventId}
                onChanged={() => router.refresh()}
            />
        </PageSection>
    );
}
