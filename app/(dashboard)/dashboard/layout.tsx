// app/(dashboard)/layout.tsx
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/shell";

export const metadata = {
    title: "Dashboard — DevEvent",
};

// Wrapping auth() in a child component + Suspense fixes the
// "Runtime data accessed outside Suspense" warning in Next.js 15
async function AuthGuard({ children }: { children: React.ReactNode }) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
    return <DashboardShell>{children}</DashboardShell>;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#060a0d]">
                <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            </div>
        }>
            <AuthGuard>{children}</AuthGuard>
        </Suspense>
    );
}