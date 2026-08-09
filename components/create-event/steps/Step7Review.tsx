'use client';

import React from "react";
import { EventDraft, WizardStepKey, WIZARD_STEPS, validateStep } from "../types";
import EventPreview from "../preview/EventPreview";
import { ProfileRowShell, ProfileRowUser } from "@/components/profileCard";

interface Step7Props {
  draft: EventDraft;
  onJumpToStep: (step: WizardStepKey) => void;
  organizerUser: ProfileRowUser | null;
}

const Step7Review = ({ draft, onJumpToStep, organizerUser }: Step7Props) => {
  const editableSteps = WIZARD_STEPS.filter((s) => s.key !== "review");
  const incompleteSteps = editableSteps.filter((s) => !validateStep(draft, s.key));

  return (
    <>
      <p className="cew-step-eyebrow">Step 7 of 7</p>
      <h1 className="cew-step-title">Take one last look</h1>
      <p className="cew-step-subtitle">This is close to how attendees will see it. Tap any section to fix something.</p>
      <div className="field">
        <label>Organizer</label>
        {organizerUser ? (
          <ProfileRowShell user={organizerUser} />
        ) : (
          <div className="rounded-2xl border border-border/20 bg-card px-3 py-2.5 text-sm text-muted-foreground">
            Organizer info unavailable
          </div>
        )}
      </div>
      <div className="cew-step-body">
        <EventPreview draft={draft} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {editableSteps.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onJumpToStep(s.key)}
              className="cew-btn cew-btn-ghost"
              data-state="normal"
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              Edit {s.label}
              {incompleteSteps.some((i) => i.key === s.key) && (
                <span style={{ color: "var(--cew-danger)", marginLeft: 6 }}>•</span>
              )}
            </button>
          ))}
        </div>

        {incompleteSteps.length > 0 && (
          <p className="field-error">
            A few things still need attention before you can publish — marked with a dot above.
          </p>
        )}
      </div>
    </>
  );
};

export default Step7Review;
