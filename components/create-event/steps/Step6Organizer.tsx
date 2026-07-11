'use client';

import React, { useState } from "react";
import { EventDraft } from "../types";
import OrganizerEmails from "../fields/OrganizerEmails";

interface Step6Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step6Organizer = ({ draft, onUpdate }: Step6Props) => {
  const [sponsorInput, setSponsorInput] = useState("");

  const addSponsor = () => {
    const name = sponsorInput.trim();
    if (!name) return;
    onUpdate({ sponsors: [...draft.sponsors, { name }] });
    setSponsorInput("");
  };

  const removeSponsor = (name: string) => {
    onUpdate({ sponsors: draft.sponsors.filter((s) => s.name !== name) });
  };

  return (
    <>
      <p className="cew-step-eyebrow">Step 6 of 7</p>
      <h1 className="cew-step-title">Who's behind this?</h1>
      <p className="cew-step-subtitle">Attendees trust events more when they know who's running them.</p>

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
          <label htmlFor="sponsors">Sponsors (optional)</label>
          <div className="tag-input-wrapper">
            {draft.sponsors.map((s) => (
              <span className="pill pill-removable" key={s.name}>
                {s.name}
                <button type="button" onClick={() => removeSponsor(s.name)} aria-label={`Remove ${s.name}`}>
                  &times;
                </button>
              </span>
            ))}
            <input
              id="sponsors"
              type="text"
              value={sponsorInput}
              onChange={(e) => setSponsorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSponsor();
                }
              }}
              onBlur={addSponsor}
              placeholder={draft.sponsors.length === 0 ? "Sponsor name, press Enter" : ""}
            />
          </div>
          <p className="field-hint">Logos and links can be added later from the event dashboard.</p>
        </div>
      </div>
    </>
  );
};

export default Step6Organizer;
