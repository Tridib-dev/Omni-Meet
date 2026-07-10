export const ONBOARDING_STEPS = [
    "/onboarding/profile",
    "/onboarding/interests",
    "/onboarding/connect-tools",
    "/onboarding/connect-ads",
    "/onboarding/source",
    "/onboarding/complete",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
