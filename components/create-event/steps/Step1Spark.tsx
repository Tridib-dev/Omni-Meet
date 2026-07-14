'use client';

import React from "react";
import { EVENT_CATEGORIES, EventCategory } from "@/lib/constants/event-categories";
import { EventDraft } from "../types";
import OptionCard from "../fields/OptionCard";

interface Step1SparkProps {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

/** Generic placeholder doodle used for any category without a dedicated one below. */
const DefaultCategoryArt = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M20 5l2.6 7.4L30 15l-7.4 2.6L20 25l-2.6-7.4L10 15l7.4-2.6L20 5z" stroke="#008AF7" strokeWidth="1.8" strokeLinejoin="round" opacity="0.45" />
  </svg>
);

const HackathonArt = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M13 12 6 20l7 8M27 12l7 8-7 8" stroke="#008AF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </svg>
);

const ConferenceArt = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="14" y="6" width="12" height="18" rx="6" stroke="#008AF7" strokeWidth="2" opacity="0.5" />
    <path d="M20 24v8M14 34h12" stroke="#008AF7" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

/**
 * Add an entry here whenever you have a real doodle for a specific
 * category — anything not listed falls back to DefaultCategoryArt, so
 * this can be filled in incrementally rather than all at once.
 */
const CATEGORY_ART: Partial<Record<EventCategory, React.ReactNode>> = {
  Hackathon: <HackathonArt />,
  Conference: <ConferenceArt />,
};

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
          <div className="cew-card-grid">
            {EVENT_CATEGORIES.map((category) => (
              <OptionCard
                key={category}
                variant="default"
                selected={draft.category === category}
                title={category}
                // art={CATEGORY_ART[category] ?? <DefaultCategoryArt />}
                onSelect={() => onUpdate({ category })}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Step1Spark;