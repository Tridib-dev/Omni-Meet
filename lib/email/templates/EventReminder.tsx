import { Section, Text } from "@react-email/components";
import { render } from "@react-email/render";
import { EmailWrapper } from "../wrapper";
import { BASE_URL, theme } from "../theme";

export type ReminderTiming = "3d" | "1d" | "1h" | "15m";

export type EventReminderData = {
    to: string;
    firstName?: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventSlug: string;
    ticketId?: string;
    timing: ReminderTiming;
};

const timingLabel: Record<ReminderTiming, string> = {
    "3d": "in 3 days",
    "1d": "tomorrow",
    "1h": "in 1 hour",
    "15m": "in 15 minutes",
};

export function subject(eventTitle: string, timing: ReminderTiming): string {
    return `${eventTitle} starts ${timingLabel[timing]}`;
}

function EventReminderTemplate(data: EventReminderData) {
    const eventUrl = `${BASE_URL}/events/${data.eventSlug}`;
    const ticketUrl = `${BASE_URL}/dashboard/attended`;
    const greeting = data.firstName?.trim() ? `Hi ${data.firstName.trim()},` : "Hi there,";

    return (
        <EmailWrapper
            previewText={`${data.eventTitle} starts ${timingLabel[data.timing]}`}
            footerEmail={data.to}
        >
            <Section style={{ paddingBottom: "24px" }}>
                <Text
                    style={{
                        margin: "0 0 6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: theme.colors.primary,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                    }}
                >
                    Event reminder
                </Text>
                <Text
                    style={{
                        margin: "0 0 10px",
                        fontSize: "26px",
                        lineHeight: "32px",
                        fontWeight: 700,
                        color: theme.colors.dark,
                    }}
                >
                    {greeting} {data.eventTitle} starts {timingLabel[data.timing]}.
                </Text>
                <Text style={{ margin: "0", fontSize: "15px", lineHeight: "24px", color: theme.colors.textPrimary }}>
                    Here&apos;s your quick reminder so you don&apos;t miss it.
                </Text>
            </Section>

            <Section
                style={{
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.md,
                    padding: "20px 24px",
                    marginBottom: "24px",
                }}
            >
                <Text style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 700, color: theme.colors.dark }}>
                    {data.eventTitle}
                </Text>
                <Text style={{ margin: "0 0 6px", fontSize: "12px", color: theme.colors.textSecondary }}>
                    Date
                </Text>
                <Text style={{ margin: "0 0 12px", fontSize: "14px", color: theme.colors.textPrimary }}>
                    {data.eventDate}
                </Text>
                <Text style={{ margin: "0 0 6px", fontSize: "12px", color: theme.colors.textSecondary }}>
                    Time
                </Text>
                <Text style={{ margin: "0 0 12px", fontSize: "14px", color: theme.colors.textPrimary }}>
                    {data.eventTime}
                </Text>
                <Text style={{ margin: "0 0 6px", fontSize: "12px", color: theme.colors.textSecondary }}>
                    Location
                </Text>
                <Text style={{ margin: "0", fontSize: "14px", color: theme.colors.textPrimary }}>
                    {data.eventLocation}
                </Text>
            </Section>

            <Section>
                <Section style={{ width: "50%", display: "inline-block", paddingRight: "8px" }}>
                    <a
                        href={ticketUrl}
                        style={{
                            display: "block",
                            textAlign: "center",
                            backgroundColor: theme.colors.primary,
                            color: "#ffffff",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: 700,
                            padding: "12px 16px",
                            borderRadius: "10px",
                        }}
                    >
                        View ticket →
                    </a>
                </Section>
                <Section style={{ width: "50%", display: "inline-block", paddingLeft: "8px" }}>
                    <a
                        href={eventUrl}
                        style={{
                            display: "block",
                            textAlign: "center",
                            backgroundColor: theme.colors.background,
                            color: theme.colors.textPrimary,
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: 700,
                            padding: "12px 16px",
                            borderRadius: "10px",
                            border: `1px solid ${theme.colors.border}`,
                        }}
                    >
                        Open event
                    </a>
                </Section>
            </Section>
        </EmailWrapper>
    );
}

export async function html(data: EventReminderData): Promise<string> {
    return render(<EventReminderTemplate {...data} />);
}
