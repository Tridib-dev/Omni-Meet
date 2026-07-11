import React from "react";

const WizardSkeleton = () => {
  return (
    <div className="cew-shell" aria-busy="true" aria-label="Loading event creator">
      <div className="cew-form-pane">
        <div className="cew-skeleton" style={{ height: 6, width: "100%", marginBottom: 28 }} />
        <div className="cew-skeleton" style={{ height: 14, width: 90, marginBottom: 12 }} />
        <div className="cew-skeleton" style={{ height: 30, width: "70%", marginBottom: 8 }} />
        <div className="cew-skeleton" style={{ height: 14, width: "50%", marginBottom: 28 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="cew-skeleton" style={{ height: 46, width: "100%" }} />
          <div className="cew-skeleton" style={{ height: 46, width: "100%" }} />
          <div className="cew-skeleton" style={{ height: 96, width: "100%" }} />
        </div>
      </div>
      <div className="cew-illustration-pane">
        <div className="cew-skeleton" style={{ width: 260, height: 260, borderRadius: 20 }} />
      </div>
    </div>
  );
};

export default WizardSkeleton;
