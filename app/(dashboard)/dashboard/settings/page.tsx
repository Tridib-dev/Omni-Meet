// app/(dashboard)/dashboard/settings/page.tsx
// "use client" is NOT here — this is a server component that renders a client form

// Actually this needs to be split: server page + client form
// Let's make it a server page that passes data to a client Settings form
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shell";
import SettingsForm from "@/components/dashboard/settings-form";

export const metadata = { title: "Settings — DevEvent" };

export default async function SettingsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    return (
        <div>
            <PageHeader
                kicker="Preferences"
                title="Settings"
                description="Manage your account, notifications, and privacy."
            />
            <SettingsForm
                initialData={{
                    firstName: user.firstName ?? "",
                    lastName: user.lastName ?? "",
                    email: user.emailAddresses[0]?.emailAddress ?? "",
                    imageUrl: user.imageUrl ?? "",
                }}
            />
        </div>
    );
}