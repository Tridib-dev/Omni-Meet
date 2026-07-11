'use client';

import React from "react";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";
import { EventDraft } from "../types";

interface Step1SparkProps {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step1Spark = ({ draft, onUpdate }: Step1SparkProps) => {
  return (
    <>
      <p className="cew-step-eyebrow">Step 1 of 7</p>
      <h1 className="cew-step-title">What are you putting together?</h1>
      <p className="cew-step-subtitle">
        Start with the name people will see everywhere — you can refine everything else next.
      </p>

      <div className="cew-step-body">
        <div className="field">
          <label htmlFor="title">Event title</label>
          <input
            id="title"
            name="title"
            type="text"
            autoFocus
            value={draft.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Cloud Next 2027"
          />
        </div>

        <div className="field">
          <label htmlFor="tagline">One-line tagline</label>
          <input
            id="tagline"
            name="description"
            type="text"
            value={draft.tagline}
            onChange={(e) => onUpdate({ tagline: e.target.value })}
            placeholder="Where builders ship the next wave of cloud tools"
          />
          <p className="field-hint">Shown on your event card — keep it punchy, under 90 characters.</p>
        </div>

        <div className="field">
          <label>Category</label>
          <div className="cew-card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            {EVENT_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className="cew-mode-card"
                data-selected={draft.category === category}
                onClick={() => onUpdate({ category })}
                style={{ padding: "12px 14px" }}
              >
                <span className="cew-mode-card-label" style={{ fontSize: 13.5 }}>
                  {category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Step1Spark;
