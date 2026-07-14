'use client';

import React, { useEffect, useRef } from "react";
import { WIZARD_STEPS, WizardStepKey } from "./types";
import BackButton from "./BackButton";

export type StepStatus = "completed" | "current" | "upcoming";

interface WizardTopBarProps {
  currentStep: WizardStepKey;
  stepStatuses: Record<WizardStepKey, StepStatus>;
  onClose?: () => void;
  onStepClick?: (step: WizardStepKey) => void;
  /** Reports the bar's real rendered height so the page below can pad exactly right — no guessed pixel values. */
  onHeightChange?: (height: number) => void;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5L6.2 11.7L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WizardTopBar = ({ currentStep, stepStatuses, onClose, onStepClick, onHeightChange }: WizardTopBarProps) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el || !onHeightChange) return;

    onHeightChange(el.offsetHeight);

    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height ?? el.offsetHeight;
      onHeightChange(Math.ceil(height) + el.offsetHeight - el.clientHeight); // account for border
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHeightChange]);

  const completedCount = WIZARD_STEPS.filter((s) => stepStatuses[s.key] === "completed").length;
  const fillPercent = (completedCount / (WIZARD_STEPS.length - 1)) * 100;
  const currentLabel = WIZARD_STEPS.find((s) => s.key === currentStep)?.label ?? "";

  return (
    <div className="cew-topbar" ref={barRef}>
      {onClose && <BackButton onClick={onClose} />}

      <div className="cew-marble-rail" role="list" aria-label="Event creation progress">
        <div className="cew-marble-track">
          <div className="cew-marble-track-fill" style={{ width: `${fillPercent}%` }} />
        </div>

        {WIZARD_STEPS.map((step, i) => {
          const status = stepStatuses[step.key];
          const isClickable = status !== "upcoming" && !!onStepClick;

          return (
            <button
              key={step.key}
              type="button"
              className="cew-marble-step"
              data-status={status}
              data-clickable={isClickable}
              role="listitem"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step.key)}
              aria-current={status === "current" ? "step" : undefined}
              aria-label={`${step.label}${status === "completed" ? " — completed" : ""}`}
            >
              <div className="cew-marble">{status === "completed" ? <CheckIcon /> : i + 1}</div>
              <span className="cew-marble-label">{step.label}</span>
            </button>
          );
        })}

        <span className="cew-topbar-current-label">{currentLabel}</span>
      </div>
    </div>
  );
};

export default WizardTopBar;