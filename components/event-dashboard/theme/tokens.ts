/** Event Dashboard design tokens — single source for surfaces, accent, radius, typography. */
export const edTokens = {
    accent: "#332be0",
    accentMuted: "rgba(51, 43, 224, 0.12)",
    accentBorder: "rgba(51, 43, 224, 0.28)",
    canvas: "#080c10",
    panel: "rgba(255,255,255,0.03)",
    panelBorder: "rgba(255,255,255,0.08)",
    elevated: "rgba(255,255,255,0.05)",
    overlay: "rgba(0,0,0,0.6)",
    textPrimary: "rgba(255,255,255,0.92)",
    textSecondary: "rgba(255,255,255,0.58)",
    textTertiary: "rgba(255,255,255,0.38)",
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
