import { Section, Text } from "@react-email/components";
import { render } from "@react-email/render";
import { EmailWrapper } from "../wrapper";
import { BASE_URL, theme } from "../theme";

export type OrganizerReminderData = {
    to: string;
    organizerName?: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    attendeeCount: number;
    checklist?: string[];
};

export function subject(eventTitle: string): string {
    return `Organizer reminder for "${eventTitle}"`;
}

function OrganizerReminderTemplate(data: OrganizerReminderData) {
    const checklist = data.checklist?.length
        ? data.checklist
        : [
              "Review the event agenda",
              "Confirm the venue or link",
              "Prepare the check-in flow",
          ];

    return (
        <EmailWrapper
            previewText={`Organizer reminder for ${data.eventTitle}`}
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
                    Organizer reminder
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
                    {data.eventTitle} is coming up soon.
                </Text>
                <Text style={{ margin: "0", fontSize: "15px", lineHeight: "24px", color: theme.colors.textPrimary }}>
                    {data.organizerName ? `Hi ${data.organizerName}, ` : "Hi, "}
                    here&apos;s a quick run-through before attendees arrive.
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
                    Event snapshot
                </Text>
                <Text style={{ margin: "0 0 6px", fontSize: "12px", color: theme.colors.textSecondary }}>
                    Attendee count
                </Text>
                <Text style={{ margin: "0 0 12px", fontSize: "14px", color: theme.colors.textPrimary }}>
                    {data.attendeeCount.toLocaleString("en-IN")}
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

            <Section
                style={{
                    backgroundColor: theme.colors.dark,
                    borderRadius: theme.radius.md,
                    padding: "20px 24px",
                    marginBottom: "24px",
                }}
            >
                <Text style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                    Checklist
                </Text>
                {checklist.map((item) => (
                    <Text
                        key={item}
                        style={{
                            margin: "0 0 8px",
                            fontSize: "13px",
                            lineHeight: "20px",
                            color: "rgba(255,255,255,0.8)",
                        }}
                    >
                        • {item}
                    </Text>
                ))}
            </Section>

            <Section>
                <a
                    href={`${BASE_URL}/dashboard/organized`}
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
                    Open organizer dashboard →
                </a>
            </Section>
        </EmailWrapper>
    );
}

export async function html(data: OrganizerReminderData): Promise<string> {
    return render(<OrganizerReminderTemplate {...data} />);
}
