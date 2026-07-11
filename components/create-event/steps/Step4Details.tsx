'use client';

import React from "react";
import { EventDraft } from "../types";
import TagPicker from "../fields/TagPicker";
import AgendaFields from "../fields/AgendaFields";

interface Step4Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step4Details = ({ draft, onUpdate }: Step4Props) => {
  return (
    <>
      <p className="cew-step-eyebrow">Step 4 of 7</p>
      <h1 className="cew-step-title">Fill in the details</h1>
      <p className="cew-step-subtitle">Who's it for, what's it tagged as, and what's on the schedule.</p>

      <div className="cew-step-body">
        <div className="field">
          <label htmlFor="audience">Audience</label>
          <input
            id="audience"
            name="audience"
            type="text"
            value={draft.audience}
            onChange={(e) => onUpdate({ audience: e.target.value })}
            placeholder="Cloud engineers, DevOps, AI researchers"
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
