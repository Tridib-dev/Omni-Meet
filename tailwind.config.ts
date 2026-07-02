import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme palette
        dark: {
          100: "#1f2937",
          200: "#334155",
          300: "#475569",
          400: "#64748b",
        },
        light: {
          100: "#f1f5f9",
          200: "#cbd5e1",
          300: "#94a3b8",
          400: "#64748b",
        },
        primary: "#06b6d4",        // cyan-500
        // Optional: more precise shades
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-schibsted-grotesk)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;