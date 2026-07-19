'use client';

import React, { useState } from "react";

export interface TagToggleGridProps {
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

const CheckMark = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5L6.2 11.7L13 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TagToggleButton = ({
  tag,
  isSelected,
  onClick,
}: {
  tag: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const state = isPressed ? "active" : isHovering ? "hover" : "normal";

  return (
    <button
      type="button"
      className="onb-tag-toggle"
      data-state={state}
      data-selected={isSelected}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      aria-pressed={isSelected}
    >
      {isSelected && <CheckMark />}
      {tag}
    </button>
  );
};

const TagToggleGrid = ({ options, selected, onToggle }: TagToggleGridProps) => {
  return (
    <div className="onb-tag-toggle-grid">
      {options.map((tag) => (
        <TagToggleButton key={tag} tag={tag} isSelected={selected.includes(tag)} onClick={() => onToggle(tag)} />
      ))}
    </div>
  );
};

export default TagToggleGrid;
