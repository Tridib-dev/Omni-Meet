'use client';

import React, { useState } from "react";

type ButtonVisualState = "normal" | "hover" | "active" | "loading";

interface StepNavProps {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  isFirstStep?: boolean;
  isContinueDisabled?: boolean;
  isLoading?: boolean;
}

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
      className={`onb-btn ${variant === "primary" ? "onb-btn-primary" : "onb-btn-ghost"}`}
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
      {loading && <span className="onb-btn-spinner" aria-hidden="true" />}
    </button>
  );
};

const StepNav = ({
  onBack,
  onContinue,
  continueLabel,
  isFirstStep,
  isContinueDisabled,
  isLoading,
}: StepNavProps) => {
  return (
    <div className="onb-step-footer">
      {!isFirstStep && onBack ? (
        <StateButton variant="ghost" onClick={onBack}>
          ← Back
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
        {continueLabel ?? "Continue →"}
      </StateButton>
    </div>
  );
};

export default StepNav;
