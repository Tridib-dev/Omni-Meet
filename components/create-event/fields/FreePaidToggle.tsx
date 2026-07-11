'use client';

import React, { useState } from "react";

export interface FreePaidToggleProps {
  isFree: boolean;
  price: number;
  onChange: (value: { isFree: boolean; price: number }) => void;
}

type CardState = "normal" | "hover" | "active";

/** Placeholder mark for the Free card — swap for your indie doodle SVG. */
const FreeCardArt = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path
      d="M14 40c4-14 32-14 36 0"
      stroke="#008AF7"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.5"
    />
    <circle cx="32" cy="24" r="6" stroke="#008AF7" strokeWidth="3" opacity="0.5" />
  </svg>
);

/** Placeholder coin mark for the Paid card — swap for your indie doodle SVG. */
const PaidCardArt = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="34" cy="30" r="16" stroke="#008AF7" strokeWidth="3" opacity="0.55" />
    <path d="M34 24v12M29 27h9M29 33h9" stroke="#008AF7" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
  </svg>
);

const ToggleCard = ({
  selected,
  title,
  description,
  art,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  art: React.ReactNode;
  onSelect: () => void;
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const state: CardState = isPressed ? "active" : isHovering ? "hover" : "normal";

  return (
    <button
      type="button"
      className="cew-toggle-card"
      data-state={state}
      data-selected={selected}
      onClick={onSelect}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      aria-pressed={selected}
    >
      <div className="cew-halo" aria-hidden="true" />
      <span className="cew-toggle-card-label">{title}</span>
      <span className="cew-toggle-card-desc">{description}</span>
      <span className="cew-toggle-card-art" aria-hidden="true">
        {art}
      </span>
    </button>
  );
};

const FreePaidToggle = ({ isFree, price, onChange }: FreePaidToggleProps) => {
  return (
    <div className="field">
      <label>Is this event free or paid?</label>

      <div className="cew-toggle-grid">
        <ToggleCard
          selected={isFree}
          title="Free"
          description="No ticket price — anyone can register."
          art={<FreeCardArt />}
          onSelect={() => onChange({ isFree: true, price: 0 })}
        />
        <ToggleCard
          selected={!isFree}
          title="Paid"
          description="Set a ticket price for attendees."
          art={<PaidCardArt />}
          onSelect={() => onChange({ isFree: false, price: price || 0 })}
        />
      </div>

      <div
        className="cew-price-reveal"
        style={{
          maxHeight: isFree ? 0 : 120,
          opacity: isFree ? 0 : 1,
          marginTop: isFree ? 0 : 14,
        }}
      >
        <div className="field">
          <label htmlFor="price">Ticket price (in your local currency)</label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step="1"
            inputMode="decimal"
            value={price || ""}
            onChange={(e) => onChange({ isFree: false, price: Number(e.target.value) })}
            placeholder="e.g. 499"
            required={!isFree}
          />
          <p className="field-hint">Attendees will see this exact amount at checkout.</p>
        </div>
      </div>
    </div>
  );
};

export default FreePaidToggle;
