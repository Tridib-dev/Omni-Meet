"use client";

// components/dashboard/settings-form.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { useClerk } from "@clerk/nextjs";
import {
    Bell,
    Globe2,
    Shield,
    Sparkles,
    UserCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserProfile, updateUserSettings } from "@/lib/actions/dashboard.actions";
import Switch from "@/components/ui/toggle";


type NotificationKey = "eventReminders" | "nearbyEvents" | "organizerUpdates" | "productUpdates";

type NotificationSettings = Record<NotificationKey, boolean>;

type SettingsMetadata = {
    devEventSettings?: {
        notifications?: Partial<NotificationSettings>;
    };
};

interface Props {
    initialData: {
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        imageUrl: string;
        publicMetadata?: SettingsMetadata;
    };
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
    eventReminders: true,
    nearbyEvents: true,
    organizerUpdates: true,
    productUpdates: false,
};

const Section = ({
    title,
    description,
    icon,
    children,
}: {
    title: string;
    description?: string;
    icon?: ReactNode;
    children: ReactNode;
}) => (
    <section
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            {icon ? (
                <div className="mt-0.5 rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600">
                    {icon}
                </div>
            ) : null}
            <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
                {description ? <p className="mt-1 text-[12px] leading-5 text-slate-500">{description}</p> : null}
            </div>
        </div>
        <div className="space-y-5 px-5 py-5 sm:px-6">{children}</div>
    </section>
);

const Field = ({
    label,
    helper,
    children,
}: {
    label: string;
    helper?: string;
    children: ReactNode;
}) => (
    <div>
        <label className="mb-1.5 block text-[12px] font-medium text-slate-600">{label}</label>
        {children}
        {helper ? <p className="mt-1 text-[11px] leading-5 text-slate-400">{helper}</p> : null}
    </div>
);

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15";
const inputStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
};

function mergeNotifications(initial?: Partial<NotificationSettings>): NotificationSettings {
    return {
        eventReminders: initial?.eventReminders ?? DEFAULT_NOTIFICATIONS.eventReminders,
        nearbyEvents: initial?.nearbyEvents ?? DEFAULT_NOTIFICATIONS.nearbyEvents,
        organizerUpdates: initial?.organizerUpdates ?? DEFAULT_NOTIFICATIONS.organizerUpdates,
        productUpdates: initial?.productUpdates ?? DEFAULT_NOTIFICATIONS.productUpdates,
    };
}

export default function SettingsForm({ initialData }: Props) {
    const clerk = useClerk();
    const [firstName, setFirstName] = useState(initialData.firstName);
    const [lastName, setLastName] = useState(initialData.lastName);
    const [savingProfile, setSavingProfile] = useState(false);
    const [notifications, setNotifications] = useState<NotificationSettings>(
        mergeNotifications(initialData.publicMetadata?.devEventSettings?.notifications)
    );
    const [savingNotificationKey, setSavingNotificationKey] = useState<NotificationKey | null>(null);
    const [signingOut, setSigningOut] = useState(false);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        const result = await updateUserProfile({ firstName, lastName });
        if (result.success) {
            toast.success("Profile details updated.");
        } else {
            toast.error(result.error ?? "Failed to update profile.");
        }
        setSavingProfile(false);
    };

    const handleToggleNotification = async (key: NotificationKey) => {
        const next = { ...notifications, [key]: !notifications[key] };
        setNotifications(next);
        setSavingNotificationKey(key);

        const result = await updateUserSettings({
            publicMetadata: {
                devEventSettings: {
                    notifications: next,
                },
            },
        });

        if (result.success) {
            toast.success("Preference saved.");
        } else {
            setNotifications((current) => ({ ...current, [key]: !current[key] }));
            toast.error(result.error ?? "Failed to save preference.");
        }

        setSavingNotificationKey(null);
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await clerk.signOut({ redirectUrl: "/" });
        } finally {
            setSigningOut(false);
        }
    };

    return (
        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-5">
                <Section
                    title="Account"
                    description="Keep your identity synced in Clerk and in the app at the same time."
                    icon={<UserCircle2 className="h-4 w-4" />}
                >
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-500 to-violet-600">
                            {initialData.imageUrl ? (
                                <Image
                                    src={initialData.imageUrl}
                                    alt="Avatar"
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            ) : null}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-medium text-slate-800">
                                {initialData.firstName || initialData.lastName
                                    ? [initialData.firstName, initialData.lastName].filter(Boolean).join(" ")
                                    : "Your profile photo"}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                                Avatar, email, password, sessions, and connected accounts live in Clerk.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <Field label="First name">
                            <input
                                className={inputClass}
                                style={inputStyle}
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                            />
                        </Field>
                        <Field label="Last name">
                            <input
                                className={inputClass}
                                style={inputStyle}
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                            />
                        </Field>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Username" helper="Managed by Clerk, and mirrored in the app profile.">
                            <input
                                className={inputClass}
                                style={{ ...inputStyle, opacity: 0.65 }}
                                value={initialData.username}
                                disabled
                            />
                        </Field>
                        <Field label="Email" helper="Managed by Clerk and verified from your session.">
                            <input
                                className={inputClass}
                                style={{ ...inputStyle, opacity: 0.65 }}
                                value={initialData.email}
                                disabled
                            />
                        </Field>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {savingProfile ? "Saving…" : "Save profile"}
                        </button>

                        <button
                            type="button"
                            onClick={() => clerk.openUserProfile()}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            Open Clerk account center
                        </button>
                    </div>
                </Section>

                <Section
                    title="Security"
                    description="Use Clerk’s built-in UI for email, password, MFA, connected accounts, and sessions."
                    icon={<Shield className="h-4 w-4" />}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => clerk.openUserProfile()}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition-colors hover:bg-slate-100"
                        >
                            <div>
                                <p className="text-[13px] font-medium text-slate-800">Manage security</p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-500">Password, MFA, active sessions.</p>
                            </div>
                            <Shield className="h-4 w-4 text-indigo-600" />
                        </button>

                        <button
                            type="button"
                            onClick={() => clerk.openUserProfile()}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition-colors hover:bg-slate-100"
                        >
                            <div>
                                <p className="text-[13px] font-medium text-slate-800">Manage account</p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-500">Email, avatar, connected accounts.</p>
                            </div>
                            <Sparkles className="h-4 w-4 text-violet-600" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div>
                            <p className="text-[13px] font-medium text-slate-800">Sign out</p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-500">Leave this device and clear the current session.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {signingOut ? "Signing out…" : "Sign out"}
                        </button>
                    </div>
                </Section>
            </div>

            <div className="space-y-5">
                <Section
                    title="Preferences"
                    description="These are app-owned preferences we can extend over time without changing the Clerk flow."
                    icon={<Bell className="h-4 w-4" />}
                >
                    <PreferenceRow
                        title="Event reminders"
                        description="Notify me before events I’ve booked."
                        checked={notifications.eventReminders}
                        loading={savingNotificationKey === "eventReminders"}
                        onToggle={() => handleToggleNotification("eventReminders")}
                    />
                    <PreferenceRow
                        title="New events nearby"
                        description="Surface nearby events in discovery and home views."
                        checked={notifications.nearbyEvents}
                        loading={savingNotificationKey === "nearbyEvents"}
                        onToggle={() => handleToggleNotification("nearbyEvents")}
                    />
                    <PreferenceRow
                        title="Organizer updates"
                        description="Alert me when booked events change."
                        checked={notifications.organizerUpdates}
                        loading={savingNotificationKey === "organizerUpdates"}
                        onToggle={() => handleToggleNotification("organizerUpdates")}
                    />
                    <PreferenceRow
                        title="Product updates"
                        description="Occasional announcements about new app features."
                        checked={notifications.productUpdates}
                        loading={savingNotificationKey === "productUpdates"}
                        onToggle={() => handleToggleNotification("productUpdates")}
                    />
                </Section>

                <Section
                    title="Future settings"
                    description="We can keep adding app-owned controls here as we finalize them."
                    icon={<Globe2 className="h-4 w-4" />}
                >
                    <div className="space-y-3">
                        <FutureSettingCard
                            title="Privacy mode"
                            description="Later we can add visibility controls for the public profile and activity feed."
                        />
                        <FutureSettingCard
                            title="Theme & layout"
                            description="A future home for display density, surface preferences, and theme options."
                        />
                        <FutureSettingCard
                            title="Notification routing"
                            description="We can route alerts to email, in-app, or both when the model is finalized."
                        />
                    </div>
                </Section>
            </div>
        </div>
    );
}

function PreferenceRow({
    title,
    description,
    checked,
    loading,
    onToggle,
}: {
    title: string;
    description: string;
    checked: boolean;
    loading: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-800">{title}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{description}</p>
            </div>

            <Switch
                checked={checked}
                onChange={onToggle}
                disabled={loading}
            />
        </div>
    );
}

function FutureSettingCard({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
            <p className="text-[13px] font-medium text-slate-700">{title}</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">{description}</p>
        </div>
    );
}
