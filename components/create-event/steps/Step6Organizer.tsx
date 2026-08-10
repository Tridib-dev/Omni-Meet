'use client';

import React from "react";
import { EventDraft } from "../types";
import OrganizerEmails from "../fields/OrganizerEmails";
import SponsorFields from "../fields/SponsorFields";
import { CoOrganizerPicker } from "@/components/profileCard";

interface Step6Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
  viewerClerkId: string;
}

const Step6Organizer = ({ draft, onUpdate, viewerClerkId }: Step6Props) => {
  return (
    <>
      <p className="cew-step-eyebrow">Step 6 of 7</p>
      <h1 className="cew-step-title">Who&apos;s behind this?</h1>
      <p className="cew-step-subtitle">Attendees trust events more when they know who&apos;s running them.</p>

      <div className="cew-step-body">
        <div className="field">
          <label htmlFor="organizer">About the organizer</label>
          <textarea
            id="organizer"
            name="organizer"
            rows={4}
            value={draft.organizer}
            onChange={(e) => onUpdate({ organizer: e.target.value })}
            placeholder="Who is hosting this event?"
          />
        </div>

        <div className="field">
          <label>Organizer contact email(s)</label>
          <OrganizerEmails onChange={(organizerEmails) => onUpdate({ organizerEmails })} />
        </div>

        <div className="field">
          <label>Invite co-organizers (optional)</label>
          <p className="mb-2 text-sm text-muted-foreground">
            They&apos;ll receive a request and must accept before getting organizer access.
          </p>
          <div className="z-99">
            <CoOrganizerPicker
              viewerClerkId={viewerClerkId}
              value={draft.coOrganizers ?? []}
              onChange={(coOrganizers) => onUpdate({ coOrganizers })}
            />
          </div>  
        </div>

        <div className="field">
          <label>Sponsors (optional)</label>
          <SponsorFields onChange={(sponsors) => onUpdate({ sponsors })} />
        </div>
      </div>
    </>
  );
};

export default Step6Organizer;