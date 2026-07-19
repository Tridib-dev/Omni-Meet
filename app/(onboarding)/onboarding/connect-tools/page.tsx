"use client";

// app/(onboarding)/onboarding/connect-tools/page.tsx
import { useRouter } from "next/navigation";
import InfoRow from "@/components/onboarding/InfoRow";
import StepNav from "@/components/onboarding/StepNav";

const TOOLS = [
    {
        id: "slack",
        name: "Slack",
        desc: "Get event reminders and updates in your workspace",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
        ),
        color: "#4A154B",
    },
    {
        id: "notion",
        name: "Notion",
        desc: "Sync your event notes and resources to Notion",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
            </svg>
        ),
        color: "#000000",
    },
    {
        id: "gcal",
        name: "Google Calendar",
        desc: "Auto-add booked events to your calendar",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#4285F4" />
                <rect x="6" y="8" width="12" height="10" rx="1" fill="white" />
                <rect x="9" y="6" width="2" height="4" rx="1" fill="#4285F4" />
                <rect x="13" y="6" width="2" height="4" rx="1" fill="#4285F4" />
                <rect x="6" y="11" width="12" height="1" fill="#E8EAED" />
            </svg>
        ),
        color: "#4285F4",
    },
];

export default function OnboardingConnectTools() {
    const router = useRouter();

    return (
        <>
            <p className="onb-step-eyebrow">Step 3 of 6</p>
            <h1 className="onb-step-title">Connect your tools</h1>
            <p className="onb-step-subtitle">
                Bring DevEvent into the apps you already use. These are optional — set them up anytime from Settings.
            </p>

            <div className="onb-step-body">
                {TOOLS.map((tool) => (
                    <InfoRow
                        key={tool.id}
                        icon={tool.icon}
                        iconBg={`${tool.color}18`}
                        iconColor={tool.color === "#000000" ? "#0b0d10" : tool.color}
                        title={tool.name}
                        description={tool.desc}
                    />
                ))}
            </div>

            <StepNav
                onBack={() => router.back()}
                onContinue={() => router.push("/onboarding/connect-ads")}
                continueLabel="Skip for now →"
            />
        </>
    );
}