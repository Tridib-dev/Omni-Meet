'use client';

import React, { useState } from "react";

export type OptionCardVariant = "default" | "compact" | "ticket";

export interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode; // small inline icon/emoji shown in the card body
  art?: React.ReactNode; // the bottom-right doodle illustration — swap per card purpose
  variant?: OptionCardVariant;
}

const VARIANT_CLASS: Record<OptionCardVariant, string> = {
  default: "",
  compact: "cew-option-card--compact",
  ticket: "cew-option-card--ticket",
};

/**
 * Every clickable option card (event mode, category, free/paid, and
 * anything you add later) should render through this component instead
 * of hand-rolling its own hover/press/selected logic. To give a new card
 * type its own illustration, just pass a different `art` node — the
 * positioning, overflow, and selected-state scale/rotate are all handled
 * here in exactly one place.
 */
const OptionCard = ({ selected, onSelect, title, description, icon, art, variant = "default" }: OptionCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const state = isPressed ? "active" : isHovering ? "hover" : "normal";

  return (
    <button
      type="button"
      className={`cew-option-card ${VARIANT_CLASS[variant]}`}
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
      {icon && <span className="cew-option-card-icon">{icon}</span>}
      <span className="cew-option-card-label">{title}</span>
      {description && <span className="cew-option-card-desc">{description}</span>}
      {art && (
        <span className="cew-card-art" aria-hidden="true">
          {art}
        </span>
      )}
    </button>
  );
};

export default OptionCard;
