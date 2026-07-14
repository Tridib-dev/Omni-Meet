'use client';

import React from "react";

interface BackButtonProps {
  onClick?: () => void;
  label?: string;
}

/**
 * Same interaction pattern as your reference: a small icon badge that
 * expands into a full pill on hover, revealing the label. Recolored to
 * the wizard's blue/ink/white palette (--cew-* tokens) instead of the
 * green in the original snippet, so it matches the rest of the UI.
 * Swap the inline <svg> for an asset from /public/icons if you'd rather
 * use a custom illustrated arrow.
 */
const BackButton = ({ onClick, label = "Cancel" }: BackButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-11 w-[124px] flex-none items-center rounded-2xl border border-[var(--cew-line)] bg-[var(--cew-paper)] text-sm font-semibold text-[var(--cew-ink)] transition-colors duration-200 hover:border-[var(--cew-line-strong)] hover:bg-[var(--cew-surface)]"
    >
      <span className="absolute left-1 top-1 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cew-red)] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-[116px]">
        <svg width="16" height="16" viewBox="0 0 1024 1024" fill="none" className="text-[var(--cew-red-tint)]" aria-hidden="true">
          <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill="currentColor" />
          <path
            d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="pl-11">{label}</span>
    </button>
  );
};

export default BackButton;
