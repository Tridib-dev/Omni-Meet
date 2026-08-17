import { redirect } from "next/navigation";

export default async function LegacyEventAnalyticsRedirect({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    redirect(`/dashboard/events/${id}/overview`);
}
