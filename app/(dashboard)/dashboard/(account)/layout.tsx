import DashboardShell from "@/components/dashboard/shell";
import { getAccessibleDashboardEvents } from "@/lib/event-dashboard/access";

export default async function AccountDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const recentEvents = await getAccessibleDashboardEvents();

    return <DashboardShell recentEvents={recentEvents}>{children}</DashboardShell>;
}
