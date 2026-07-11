'use client';

import React from "react";
import { EventDraft } from "../types";
import FreePaidToggle from "../fields/FreePaidToggle";

interface Step5Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step5Tickets = ({ draft, onUpdate }: Step5Props) => {
  return (
    <>
      <p className="cew-step-eyebrow">Step 5 of 7</p>
      <h1 className="cew-step-title">How does it get paid for?</h1>
      <p className="cew-step-subtitle">You can always adjust pricing later from event settings.</p>

      <div className="cew-step-body">
        <FreePaidToggle
          isFree={draft.isFree}
          price={draft.price}
          onChange={({ isFree, price }) => onUpdate({ isFree, price })}
        />
      </div>
    </>
  );
};

export default Step5Tickets;
