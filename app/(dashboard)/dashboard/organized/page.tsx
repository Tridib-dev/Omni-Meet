// app/(dashboard)/dashboard/organized/page.tsx
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/shell";
import { getOrganizedEvents } from "@/lib/actions/dashboard.actions";
import SafeImage from "@/components/dashboard/savedPage";

export const metadata = { title: "My Events — DevEvent" };

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function OrganizedPage() {
    const events = await getOrganizedEvents();

    const live = events.filter((e) => e.status === "upcoming").length;
    const totalAttendees = events.reduce((s, e) => s + e.attendeeCount, 0);
    const totalRevenue = events.reduce((s, e) => s + e.revenue, 0);

    return (
        <div>
            <PageHeader
                kicker="Your events"
                title="My Events"
                description="Events you've created and are managing."
                right={
                    <Link
                        href="/create_event"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
                        </svg>
                        Create Event
                    </Link>
                }
            />

            {/* Quick stats row */}
            {events.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: "Live events", value: live, color: "#22c55e" },
                        { label: "Total attendees", value: totalAttendees, color: "#06b6d4" },
                        { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "#f59e0b" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="px-4 py-3 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            <p className="text-[11px] text-white/35 mb-1">{stat.label}</p>
                            <p className="text-[22px] font-semibold tracking-tight" style={{ color: stat.color }}>
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-4xl mb-3">📅</span>
                    <p className="text-[14px] font-medium text-white/50">No events yet</p>
                    <p className="text-[12px] text-white/25 mt-1">Create your first event and start managing attendees.</p>
                    <Link
                        href="/create_event"
                        className="mt-4 px-4 py-2 rounded-lg text-[12px] font-medium transition-colors"
                        style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)", color: "#67e8f9" }}
                    >
                        Create your first event →
                    </Link>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {events.map((ev, i) => (
                        <div
                            key={ev.id}
                            className="flex flex-col rounded-xl overflow-hidden group"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            {/* Image */}
                            <div className="relative h-36 overflow-hidden flex-shrink-0">
                                <SafeImage
                                    src={ev.image}
                                    alt={ev.title}
                                    fill
                                    fallback="https://placehold.co/600x200/0b0f13/444?text=Event"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Status chip */}
                                <span
                                    className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: ev.status === "upcoming" ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.15)",
                                        border: `1px solid ${ev.status === "upcoming" ? "rgba(34,197,94,0.3)" : "rgba(107,114,128,0.2)"}`,
                                        color: ev.status === "upcoming" ? "#22c55e" : "#6b7280",
                                    }}
                                >
                                    {ev.status === "upcoming" ? "Live" : "Ended"}
                                </span>
                                {/* Price */}
                                <span
                                    className="absolute top-3 right-3 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: "rgba(0,0,0,0.6)",
                                        color: ev.price > 0 ? "#f59e0b" : "#22c55e",
                                    }}
                                >
                                    {ev.price > 0 ? `₹${ev.price}` : "Free"}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-[14px] font-medium text-white/90 line-clamp-1 mb-1">
                                    {ev.title}
                                </h3>
                                <p className="text-[12px] text-white/35 mb-4">
                                    {formatDate(ev.date)} · {ev.location}
                                </p>

                                {/* Attendees + Revenue */}
                                <div className="flex items-center gap-4 mb-4 text-[12px]">
                                    <span className="text-white/50">
                                        <span className="text-white/90 font-medium">{ev.attendeeCount}</span> attendees
                                    </span>
                                    {ev.price > 0 && (
                                        <span className="text-white/50">
                                            <span className="text-amber-400 font-medium">₹{ev.revenue.toLocaleString("en-IN")}</span> revenue
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-auto">
                                    <Link
                                        href={`/dashboard/organized/${ev.id}`}
                                        className="flex-1 text-center py-2 rounded-lg text-[12px] font-medium text-white/60 hover:text-white/90 transition-colors"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        View Analytics →
                                    </Link>
                                    <Link
                                        href={`/events/${ev.slug}`}
                                        className="p-2 rounded-lg text-white/35 hover:text-white/60 transition-colors"
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                                        title="View event"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                            <polyline points="15 3 21 3 21 9"/>
                                            <line x1="10" x2="21" y1="14" y2="3"/>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}