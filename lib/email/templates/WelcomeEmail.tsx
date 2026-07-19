import { Section, Text } from "@react-email/components";
import { render } from "@react-email/render";
import { EmailWrapper } from "../wrapper";
import { BASE_URL, theme } from "../theme";

export type WelcomeEmailData = {
    to: string;
    firstName: string;
    username?: string;
};

export function subject(firstName: string): string {
    return `Welcome to DevEvent, ${firstName}`;
}

function WelcomeEmailTemplate(data: WelcomeEmailData) {
    const handle = data.username?.trim() ? `@${data.username.trim()}` : null;
    const exploreUrl = `${BASE_URL}/events`;

    return (
        <EmailWrapper previewText={`Welcome to DevEvent, ${data.firstName}`} footerEmail={data.to}>
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
                    Welcome aboard
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
                    Hi {data.firstName}, you&apos;re all set.
                </Text>
                <Text style={{ margin: "0", fontSize: "15px", lineHeight: "24px", color: theme.colors.textPrimary }}>
                    Thanks for joining DevEvent. We&apos;re excited to have you here.
                    {handle ? ` Your public handle is ${handle}.` : ""}
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
                <Text style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, color: theme.colors.dark }}>
                    What you can do next
                </Text>
                <Text style={{ margin: "0 0 8px", fontSize: "14px", color: theme.colors.textPrimary }}>
                    • Discover events that match your interests
                </Text>
                <Text style={{ margin: "0 0 8px", fontSize: "14px", color: theme.colors.textPrimary }}>
                    • Save events to your watchlist
                </Text>
                <Text style={{ margin: "0", fontSize: "14px", color: theme.colors.textPrimary }}>
                    • Book free or paid tickets in a couple of taps
                </Text>
            </Section>

            <Section>
                <a
                    href={exploreUrl}
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
                    Explore events →
                </a>
            </Section>
        </EmailWrapper>
    );
}

export async function html(data: WelcomeEmailData): Promise<string> {
    return render(<WelcomeEmailTemplate {...data} />);
}
