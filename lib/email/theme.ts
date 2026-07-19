export const theme = {
  colors: {
    primary: "#008AF7",
    primaryLight: "#E8F4FF",
    background: "#f4f6f8",
    card: "#ffffff",
    dark: "#080c10",
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    success: "#16a34a",
    warning: "#d97706",
  },
  font: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "Courier New, monospace",
  },
  radius: { sm: "8px", md: "12px", lg: "16px" },
} as const;

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";