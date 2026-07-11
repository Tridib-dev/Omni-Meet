'use client';

import React, { useState } from "react";
import type { EventMode } from "../types";

export interface ModeCardsProps {
  value: EventMode | "";
  onChange: (mode: EventMode) => void;
}

const OPTIONS: { value: EventMode; label: string; desc: string; icon: string }[] = [
  { value: "In-Person", label: "In-Person", desc: "A physical venue", icon: "📍" },
  { value: "Online", label: "Online", desc: "Streamed virtually", icon: "💻" },
  { value: "Hybrid (In-Person & Online)", label: "Hybrid", desc: "Both, at once", icon: "🌐" },
];

const ModeCard = ({
  option,
  selected,
  onSelect,
}: {
  option: (typeof OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const state = isPressed ? "active" : isHovering ? "hover" : "normal";

  return (
    <button
      type="button"
      className="cew-mode-card"
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
      <span className="cew-mode-card-icon">{option.icon}</span>
      <span className="cew-mode-card-label">{option.label}</span>
      <span className="cew-mode-card-desc">{option.desc}</span>
    </button>
  );
};

const ModeCards = ({ value, onChange }: ModeCardsProps) => {
  return (
    <div className="field">
      <label>Event mode</label>
      <div className="cew-card-grid">
        {OPTIONS.map((option) => (
          <ModeCard
            key={option.value}
            option={option}
            selected={value === option.value}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
};

export default ModeCards;
