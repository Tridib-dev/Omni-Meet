import React from "react";

const common = { width: 84, height: 84, viewBox: "0 0 84 84", fill: "none" } as const;
const stroke = { stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Profile — an identity card with a person mark */
const ProfileDoodle = () => (
  <svg {...common}>
    <rect x="14" y="18" width="56" height="48" rx="10" {...stroke} />
    <circle cx="42" cy="38" r="9" {...stroke} />
    <path d="M26 56c3-9 12-13 16-13s13 4 16 13" {...stroke} />
  </svg>
);

/** Interests — a target with a couple of tag marks orbiting it */
const InterestsDoodle = () => (
  <svg {...common}>
    <circle cx="42" cy="42" r="18" {...stroke} />
    <circle cx="42" cy="42" r="6" {...stroke} />
    <path d="M64 20l6 6M14 58l6 6" {...stroke} />
  </svg>
);

/** Connect tools — interlocking puzzle-piece / plug shape */
const ToolsDoodle = () => (
  <svg {...common}>
    <path
      d="M30 18h12v6a4 4 0 0 0 8 0v-6h12v12h-6a4 4 0 0 0 0 8h6v12H50v-6a4 4 0 0 0-8 0v6H30V38h6a4 4 0 0 0 0-8h-6V18z"
      {...stroke}
    />
  </svg>
);

/** Connect ads — a megaphone */
const AdsDoodle = () => (
  <svg {...common}>
    <path d="M18 38l24-12v32l-24-12z" {...stroke} />
    <path d="M18 38h-4a6 6 0 0 0 0 12h4" {...stroke} />
    <path d="M42 26l18-8v40l-18-8" {...stroke} />
    <path d="M26 50q4 10-4 14" {...stroke} />
  </svg>
);

/** Source — a compass */
const SourceDoodle = () => (
  <svg {...common}>
    <circle cx="42" cy="42" r="22" {...stroke} />
    <path d="M50 34l-6 14-12 6 6-14 12-6z" {...stroke} />
  </svg>
);

/** Complete — a rocket taking off */
const CompleteDoodle = () => (
  <svg {...common}>
    <path d="M42 14c8 6 12 16 10 30l-10 8-10-8c-2-14 2-24 10-30z" {...stroke} />
    <circle cx="42" cy="32" r="4" {...stroke} />
    <path d="M30 44l-8 6 4 2M54 44l8 6-4 2M38 52l-2 10M46 52l2 10" {...stroke} />
  </svg>
);

export const ONBOARDING_ILLUSTRATIONS: Record<string, React.ReactNode> = {
  "/onboarding/profile": <ProfileDoodle />,
  "/onboarding/interests": <InterestsDoodle />,
  "/onboarding/connect-tools": <ToolsDoodle />,
  "/onboarding/connect-ads": <AdsDoodle />,
  "/onboarding/source": <SourceDoodle />,
  "/onboarding/complete": <CompleteDoodle />,
};
