'use client';

import React from "react";
import ProgressBar from "./ProgressBar";
import { WIZARD_STEPS, WizardStepKey } from "./types";

interface WizardShellProps {
  currentStep: WizardStepKey;
  illustrationCaption: string;
  children: React.ReactNode;
}

const currentIndexOf = (step: WizardStepKey) =>
  WIZARD_STEPS.findIndex((s) => s.key === step);

/**
 * Swap this for a real per-step SVG/illustration component later.
 * Kept as an explicit, labeled placeholder so it's obvious where
 * doodle art should go — one slot, generous size, halo behind it.
 */
const IllustrationPlaceholder = ({ caption }: { caption: string }) => (
  <div className="cew-doodle-slot">
    <span>Illustration slot — {caption}</span>
  </div>
);

const WizardShell = ({ currentStep, illustrationCaption, children }: WizardShellProps) => {
  const currentIndex = currentIndexOf(currentStep);

  return (
    <div className="cew-shell">
      <div className="cew-form-pane">
        <ProgressBar currentIndex={currentIndex} />
        {children}
      </div>

      <div className="cew-illustration-pane">
        <div className="cew-halo cew-halo--breathing" aria-hidden="true" />
        <IllustrationPlaceholder caption={illustrationCaption} />
      </div>
    </div>
  );
};

export default WizardShell;
