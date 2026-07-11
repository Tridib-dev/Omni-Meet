'use client';

import React from "react";
import { WIZARD_STEPS } from "./types";

interface ProgressBarProps {
  currentIndex: number; // 0-based
}

const ProgressBar = ({ currentIndex }: ProgressBarProps) => {
  const total = WIZARD_STEPS.length;
  const progress = currentIndex / (total - 1); // 0..1
  const fillScale = Math.max(progress, 0.02); // always show a sliver so the rail never looks "off"

  return (
    <div className="cew-progress">
      <div className="cew-progress-rail" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={currentIndex + 1}>
        <div
          className="cew-progress-fill"
          style={{ transform: `scaleX(${fillScale})` }}
        />
        <div
          className="cew-progress-puck"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
      <span className="cew-progress-label">
        Step {currentIndex + 1} of {total} · {WIZARD_STEPS[currentIndex].label}
      </span>
    </div>
  );
};

export default ProgressBar;
