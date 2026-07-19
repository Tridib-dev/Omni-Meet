'use client';

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type StepStatus = "completed" | "current" | "upcoming";

export interface OnboardingStepDef {
  path: string;
  label: string;
}

interface OnboardingTopBarProps {
  steps: OnboardingStepDef[];
  currentIndex: number;
  onHeightChange?: (height: number) => void;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5L6.2 11.7L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#008AF7" />
    <path d="M8 12.5l2.5 2.5L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const OnboardingTopBar = ({ steps, currentIndex, onHeightChange }: OnboardingTopBarProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = barRef.current;
    if (!el || !onHeightChange) return;

    onHeightChange(el.offsetHeight);

    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height ?? el.offsetHeight;
      onHeightChange(Math.ceil(height) + el.offsetHeight - el.clientHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHeightChange]);

  const statusFor = (i: number): StepStatus =>
    i < currentIndex ? "completed" : i === currentIndex ? "current" : "upcoming";

  const completedCount = steps.filter((_, i) => statusFor(i) === "completed").length;
  const fillPercent = steps.length > 1 ? (completedCount / (steps.length - 1)) * 100 : 0;
  const currentLabel = steps[currentIndex]?.label ?? "";

  return (
    <div className="onb-topbar" ref={barRef}>
      <Link href="/" className="onb-topbar-brand">
        <LogoMark />
        <span className="onb-topbar-brand-name">DevEvent</span>
      </Link>

      <div className="onb-marble-rail" role="list" aria-label="Onboarding progress">
        <div className="onb-marble-track">
          <div className="onb-marble-track-fill" style={{ width: `${fillPercent}%` }} />
        </div>

        {steps.map((step, i) => {
          const status = statusFor(i);
          const isClickable = status === "completed";

          return (
            <button
              key={step.path}
              type="button"
              className="onb-marble-step"
              data-status={status}
              data-clickable={isClickable}
              role="listitem"
              disabled={!isClickable}
              onClick={() => isClickable && router.push(step.path)}
              aria-current={status === "current" ? "step" : undefined}
              aria-label={`${step.label}${status === "completed" ? " — completed" : ""}`}
            >
              <div className="onb-marble">{status === "completed" ? <CheckIcon /> : i + 1}</div>
              <span className="onb-marble-label">{step.label}</span>
            </button>
          );
        })}

        <span className="onb-topbar-current-label">{currentLabel}</span>
      </div>
    </div>
  );
};

export default OnboardingTopBar;
