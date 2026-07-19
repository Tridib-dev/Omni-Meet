'use client';

import React from "react";
import { EventDraft } from "../types";
import TagPicker from "../fields/TagPicker";
import AgendaFields from "../fields/AgendaFields";
import { AUDIENCE_PERSONAS } from "@/lib/constants/audience-personas";

interface Step4Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step4Details = ({ draft, onUpdate }: Step4Props) => {
  return (
    <>
      <p className="cew-step-eyebrow">Step 4 of 7</p>
      <h1 className="cew-step-title">Fill in the details</h1>
      <p className="cew-step-subtitle">Who&apos;s it for, what&apos;s it tagged as, and what&apos;s on the schedule.</p>

      <div className="cew-step-body">
        <div className="field">
          <label>Audience</label>
          <TagPicker
            options={AUDIENCE_PERSONAS}
            placeholder="Search roles, focus areas, org types..."
            onChange={(audience) => onUpdate({ audience })}
          />
        </div>

        <div className="field">
          <label>Tags</label>
          <TagPicker onChange={(tags) => onUpdate({ tags })} />
        </div>

        <div className="field">
          <label>Agenda</label>
          <AgendaFields onChange={(agenda) => onUpdate({ agenda })} />
        </div>
      </div>
    </>
  );
};

export default Step4Details;