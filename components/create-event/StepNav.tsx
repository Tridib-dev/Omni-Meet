'use client';

import React, { useState } from "react";

type ButtonVisualState = "normal" | "hover" | "active" | "loading";

interface StepNavProps {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isContinueDisabled?: boolean;
  isLoading?: boolean;
}

/**
 * A single controlled button that derives its data-state from real
 * pointer/loading signals, rather than relying on bare CSS :hover
 * (which doesn't give a distinct "clicked" feel and behaves oddly
 * on touch devices).
 */
const StateButton = ({
  children,
  onClick,
  variant,
  disabled,
  loading,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant: "primary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const state: ButtonVisualState = loading
    ? "loading"
    : isPressed
    ? "active"
    : isHovering
    ? "hover"
    : "normal";

  return (
    <button
      type={type}
      className={`cew-btn ${variant === "primary" ? "cew-btn-primary" : "cew-btn-ghost"}`}
      data-state={state}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
    >
      {children}
      {loading && <span className="cew-btn-spinner" aria-hidden="true" />}
    </button>
  );
};

const StepNav = ({
  onBack,
  onContinue,
  continueLabel,
  isFirstStep,
  isLastStep,
  isContinueDisabled,
  isLoading,
}: StepNavProps) => {
  return (
    <div className="cew-step-footer">
      {!isFirstStep ? (
        <StateButton variant="ghost" onClick={onBack}>
          Back
        </StateButton>
      ) : (
        <span />
      )}

      <StateButton
        variant="primary"
        onClick={onContinue}
        disabled={isContinueDisabled}
        loading={isLoading}
      >
        {continueLabel ?? (isLastStep ? "Publish event" : "Continue")}
      </StateButton>
    </div>
  );
};

export default StepNav;
