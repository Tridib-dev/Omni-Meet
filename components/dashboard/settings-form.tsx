"use client";

// components/dashboard/settings-form.tsx
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/dashboard.actions";

interface Props {
    initialData: {
        firstName: string;
        lastName: string;
        email: string;
        imageUrl: string;
    };
}

const Section = ({ title, description, children }: {
    title: string; description?: string; children: React.ReactNode;
}) => (
    <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-[14px] font-medium text-white/90">{title}</h3>
            {description && <p className="text-[12px] text-white/35 mt-0.5">{description}</p>}
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
);

const Field = ({ label, helper, children }: {
    label: string; helper?: string; children: React.ReactNode;
}) => (
    <div>
        <label className="block text-[12px] font-medium text-white/55 mb-1.5">{label}</label>
        {children}
        {helper && <p className="text-[11px] text-white/25 mt-1">{helper}</p>}
    </div>
);

const inputClass = `w-full px-3 py-2 rounded-lg text-[13px] text-white/80 outline-none transition-colors focus:border-cyan-500/50`;
const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
};

export default function SettingsForm({ initialData }: Props) {
    const [firstName, setFirstName] = useState(initialData.firstName);
    const [lastName, setLastName] = useState(initialData.lastName);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const result = await updateUserProfile({ firstName, lastName });
        if (result.success) {
            toast.success("Profile updated.");
        } else {
            toast.error(result.error ?? "Failed to update.");
        }
        setSaving(false);
    };

    return (
        <div className="space-y-4 max-w-[680px]">
            {/* Account section */}
            <Section title="Account" description="Your public profile information.">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-cyan-500 to-violet-600">
                        {initialData.imageUrl && (
                            <Image
                                src={initialData.imageUrl}
                                alt="Avatar"
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div>
                        <p className="text-[13px] text-white/60">Profile photo</p>
                        <p className="text-[11px] text-white/25 mt-0.5">Managed via Clerk — update in your account settings.</p>
                    </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="First name">
                        <input
                            className={inputClass}
                            style={inputStyle}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </Field>
                    <Field label="Last name">
                        <input
                            className={inputClass}
                            style={inputStyle}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </Field>
                </div>

                <Field label="Email" helper="Email is managed by Clerk and cannot be changed here.">
                    <input
                        className={inputClass}
                        style={{ ...inputStyle, opacity: 0.5 }}
                        value={initialData.email}
                        disabled
                    />
                </Field>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}
                >
                    {saving ? "Saving…" : "Save changes"}
                </button>
            </Section>

            {/* Notifications section */}
            <Section title="Notifications" description="Choose what updates you receive.">
                {[
                    { label: "Event reminders", desc: "Get notified before events you've booked" },
                    { label: "New events nearby", desc: "Discover events in your area" },
                    { label: "Organizer updates", desc: "Changes to events you've booked" },
                ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                        <div>
                            <p className="text-[13px] text-white/70">{item.label}</p>
                            <p className="text-[11px] text-white/30">{item.desc}</p>
                        </div>
                        <button
                            className="w-10 h-5 rounded-full transition-colors relative"
                            style={{ background: "rgba(6,182,212,0.3)", border: "1px solid rgba(6,182,212,0.4)" }}
                        >
                            <span className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-cyan-400 transition-transform" />
                        </button>
                    </div>
                ))}
            </Section>

            {/* Danger zone */}
            <Section title="Danger zone" description="Irreversible actions. Proceed with caution.">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[13px] text-white/70">Delete account</p>
                        <p className="text-[11px] text-white/30">Permanently delete your account and all data.</p>
                    </div>
                    <button
                        className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                        onClick={() => toast.error("Contact support to delete your account.")}
                    >
                        Delete account
                    </button>
                </div>
            </Section>
        </div>
    );
}
