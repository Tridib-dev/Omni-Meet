'use client';

import React, { useState } from "react";
import WizardTopBar, { StepStatus } from "./WizardTopBar";
import { WizardStepKey } from "./types";
import { STEP_ILLUSTRATIONS, STEP_CAPTIONS } from "./illustrations";

interface WizardShellProps {
  currentStep: WizardStepKey;
  stepStatuses: Record<WizardStepKey, StepStatus>;
  onClose?: () => void;
  onStepClick?: (step: WizardStepKey) => void;
  children: React.ReactNode;
}

const WizardShell = ({
  currentStep,
  stepStatuses,
  onClose,
  onStepClick,
  children,
}: WizardShellProps) => {
  const [topbarHeight, setTopbarHeight] = useState<number | null>(null);
  const caption = STEP_CAPTIONS[currentStep];

  return (
    <>
      <WizardTopBar
        currentStep={currentStep}
        stepStatuses={stepStatuses}
        onClose={onClose}
        onStepClick={onStepClick}
        onHeightChange={setTopbarHeight}
      />

      <div
        className="cew-page"
        style={topbarHeight !== null ? { paddingTop: topbarHeight } : undefined}
      >
        <div className="cew-shell">
          <div className="cew-form-pane">{children}</div>

          <div className="cew-illustration-pane">
            <div className="cew-doodle-slot cew-doodle-slot--filled">
              {STEP_ILLUSTRATIONS[currentStep]}
            </div>
            <div className="cew-illustration-caption">
              <p className="cew-illustration-caption-title">{caption.title}</p>
              <p className="cew-illustration-caption-subtitle">{caption.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WizardShell;