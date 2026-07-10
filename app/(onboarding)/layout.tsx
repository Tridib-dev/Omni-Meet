// app/(onboarding)/layout.tsx
import OnboardingShell from "@/components/onboarding/OnboardingShell";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return <OnboardingShell>{children}</OnboardingShell>;
}