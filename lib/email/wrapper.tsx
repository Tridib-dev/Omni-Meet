import type { ReactNode } from "react";
import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import { theme } from "./theme";

type EmailWrapperProps = {
    children: ReactNode;
    previewText: string;
    footerEmail: string;
};

const pageStyles = {
    backgroundColor: theme.colors.background,
    margin: "0",
    padding: "32px 16px",
    fontFamily: theme.font.sans,
} as const;

const cardStyles = {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: "0 12px 40px rgba(8, 12, 16, 0.08)",
    overflow: "hidden",
} as const;

const headerStyles = {
    padding: "24px 32px 18px",
} as const;

const accentBarStyles = {
    height: "4px",
    background: `linear-gradient(90deg, ${theme.colors.primary} 0%, #00c2ff 100%)`,
} as const;

const contentStyles = {
    padding: "0 32px 24px",
} as const;

const footerStyles = {
    padding: "16px 32px 24px",
} as const;

const brandStyles = {
    margin: "0",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "1",
    letterSpacing: "-0.02em",
    color: theme.colors.dark,
} as const;

const taglineStyles = {
    margin: "8px 0 0",
    fontSize: "13px",
    lineHeight: "20px",
    color: theme.colors.textSecondary,
} as const;

const footerTextStyles = {
    margin: "0",
    fontSize: "11px",
    lineHeight: "18px",
    color: theme.colors.textSecondary,
} as const;

const hrStyles = {
    borderColor: theme.colors.border,
    margin: "0",
} as const;

export function EmailWrapper({ children, previewText, footerEmail }: EmailWrapperProps) {
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={pageStyles}>
                <Container style={cardStyles}>
                    <Section style={accentBarStyles} />
                    <Section style={headerStyles}>
                        <Text style={brandStyles}>
                            <span style={{ color: theme.colors.dark }}>Dev</span>
                            <span style={{ color: theme.colors.primary }}>Event</span>
                        </Text>
                        <Text style={taglineStyles}>
                            Tickets, receipts, reminders, and updates that stay in sync.
                        </Text>
                    </Section>
                    <Section style={contentStyles}>{children}</Section>
                    <Hr style={hrStyles} />
                    <Section style={footerStyles}>
                        <Text style={footerTextStyles}>
                            sent to {footerEmail} · DevEvent
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
