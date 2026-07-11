'use client';

import React from "react";
import { EventDraft } from "../types";
import ModeCards from "../fields/ModeCards";
import LocationFields from "../fields/LocationFields";

interface Step2Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step2TimePlace = ({ draft, onUpdate }: Step2Props) => {
  return (
    <>
      <p className="cew-step-eyebrow">Step 2 of 7</p>
      <h1 className="cew-step-title">When and where does it happen?</h1>
      <p className="cew-step-subtitle">Pin down the logistics — attendees plan around this first.</p>

      <div className="cew-step-body">
        <div className="field-row">
          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={draft.date}
              onChange={(e) => onUpdate({ date: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="time">Time</label>
            <input
              id="time"
              name="time"
              type="time"
              value={draft.time}
              onChange={(e) => onUpdate({ time: e.target.value })}
            />
          </div>
        </div>

        <ModeCards value={draft.mode} onChange={(mode) => onUpdate({ mode })} />

        <div className="field-row">
          <div className="field">
            <label htmlFor="venue">Venue</label>
            <input
              id="venue"
              name="venue"
              type="text"
              value={draft.venue}
              onChange={(e) => onUpdate({ venue: e.target.value })}
              placeholder="Moscone Center"
            />
          </div>
          <div className="field">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={draft.address}
              onChange={(e) => onUpdate({ address: e.target.value })}
              placeholder="747 Howard St"
            />
          </div>
        </div>

        <LocationFields onChange={(location) => onUpdate({ location })} />
      </div>
    </>
  );
};

export default Step2TimePlace;
