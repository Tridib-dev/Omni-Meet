'use client';

import React, { useState } from "react";

export type OptionCardVariant = "default" | "compact" | "centered";

export interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: OptionCardVariant;
}

const VARIANT_CLASS: Record<OptionCardVariant, string> = {
  default: "",
  compact: "onb-option-card--compact",
  centered: "onb-option-card--centered",
};

const OptionCard = ({ selected, onSelect, title, description, icon, variant = "default" }: OptionCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const state = isPressed ? "active" : isHovering ? "hover" : "normal";

  return (
    <button
      type="button"
      className={`onb-option-card ${VARIANT_CLASS[variant]}`}
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
      <div className="onb-halo" aria-hidden="true" />
      {icon && <span className="onb-option-card-icon">{icon}</span>}
      <span className="onb-option-card-label">{title}</span>
      {description && <span className="onb-option-card-desc">{description}</span>}
    </button>
  );
};

export default OptionCard;
