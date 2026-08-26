/** Event Dashboard design tokens — the light SaaS palette used across every endpoint. */
export const edTokens = {
    accent: "#332be0",
    accentMuted: "rgba(51, 43, 224, 0.12)",
    accentBorder: "rgba(51, 43, 224, 0.28)",
    canvas: "#f1f5f9",
    panel: "#ffffff",
    panelBorder: "#e2e8f0",
    elevated: "#f8fafc",
    overlay: "rgba(15,23,42,0.35)",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textTertiary: "#94a3b8",
    success: "#22c55e",
    warning: "#f59e0b",
    info: "#67e8f9",
    radius: {
        panel: "28px",
        card: "16px",
        pill: "9999px",
    },
} as const;

export const edStyles = {
    panel: {
        background: edTokens.panel,
        border: `1px solid ${edTokens.panelBorder}`,
        borderRadius: edTokens.radius.panel,
    },
    card: {
        background: edTokens.elevated,
        border: `1px solid ${edTokens.panelBorder}`,
        borderRadius: edTokens.radius.card,
    },
} as const;
