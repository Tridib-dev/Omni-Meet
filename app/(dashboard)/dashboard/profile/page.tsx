// app/(dashboard)/dashboard/profile/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { PageHeader } from "@/components/dashboard/shell";
import { getUserStats } from "@/lib/actions/dashboard.actions";

export const metadata = { title: "Profile — DevEvent" };

export default async function ProfilePage() {
    const [user, stats] = await Promise.all([currentUser(), getUserStats()]);
    if (!user) redirect("/sign-in");

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Anonymous";
    const email = user.emailAddresses[0]?.emailAddress ?? "";
    const joinedDate = new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long", year: "numeric",
    });

    const STATS = [
        { label: "Events attended", value: stats.attended, color: "#06b6d4" },
        { label: "Events organized", value: stats.organized, color: "#8b5cf6" },
        { label: "Events saved", value: stats.saved, color: "#f59e0b" },
        { label: "Total spent", value: `₹${stats.totalSpent.toLocaleString("en-IN")}`, color: "#22c55e" },
    ];

    return (
        <div>
            <PageHeader kicker="Your identity" title="Profile" />

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Left — Profile card */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                    {/* Banner */}
                    <div
                        className="h-28 relative"
                        style={{
                            background: "radial-gradient(ellipse at 30% 50%, rgba(6,182,212,0.3), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.25), transparent 60%), #0d1117",
                        }}
                    />

                    {/* Avatar + info */}
                    <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-10 mb-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 flex-shrink-0"
                                style={{ borderColor: "#0d1117" }}>
                                {user.imageUrl ? (
                                    <Image
                                        src={user.imageUrl}
                                        alt={fullName}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white">
                                        {fullName.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <h2 className="text-[20px] font-semibold text-white tracking-tight">{fullName}</h2>
                        <p className="text-[13px] text-white/40 mt-0.5">{email}</p>
                        <p className="text-[12px] text-white/25 mt-1">Member since {joinedDate}</p>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                            {STATS.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="px-3 py-3 rounded-xl text-center"
                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                    <p className="text-[22px] font-semibold tracking-tight" style={{ color: stat.color }}>
                                        {stat.value}
                                    </p>
                                    <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — Quick links */}
                <div className="space-y-3">
                    {[
                        { label: "My Tickets", href: "/dashboard/attended", desc: `${stats.attended} tickets`, icon: "🎟️" },
                        { label: "Saved Events", href: "/dashboard/saved", desc: `${stats.saved} saved`, icon: "🔖" },
                        { label: "My Events", href: "/dashboard/organized", desc: `${stats.organized} events`, icon: "📅" },
                        { label: "Settings", href: "/dashboard/settings", desc: "Account preferences", icon: "⚙️" },
                    ].map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            <span className="text-xl">{link.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-white/80">{link.label}</p>
                                <p className="text-[11px] text-white/30">{link.desc}</p>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}