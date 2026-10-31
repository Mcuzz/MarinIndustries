import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],

  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surfaceElevated: "var(--color-surface-elevated)",
        textPrimary: "var(--color-text-primary)",
        textSecondary: "var(--color-text-secondary)",
        textMuted: "var(--color-text-muted)",
        borderStrong: "var(--color-border-strong)",
        interactive: "rgb(var(--color-interactive-rgb) / <alpha-value>)",
        interactiveHover: "var(--color-interactive-hover)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        brandBg: "var(--brand-bg)",
        brandSurface: "var(--brand-surface)",
        brandSurfaceAlt: "var(--brand-surface-alt)",
        brandLine: "var(--brand-line)",
        brandDark: "var(--brand-dark)",
        brandBlue: "var(--brand-blue)",
        brandBlueDeep: "var(--brand-blue-deep)",
        brandAccent: "rgb(var(--color-accent-rgb) / <alpha-value>)",
        brandAccentSoft: "var(--brand-accent-soft)",
        brandAccentHover: "var(--brand-accent-hover)",
        brandLight: "var(--brand-light)",
        brandText: "rgb(var(--color-text-secondary-rgb) / <alpha-value>)",
        brandMuted: "var(--brand-muted)"
      },

      fontFamily: {
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"]
      },

      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px"
      },

      boxShadow: {
        sm: "0 0 0 1px rgba(0,0,0,0.04)",
        DEFAULT: "0 0 0 1px rgba(0,0,0,0.04)",
        md: "0 0 0 1px rgba(0,0,0,0.06)",
        lg: "0 0 0 1px rgba(0,0,0,0.08)",
        xl: "0 1px 0 0 rgba(255,176,0,0.25)",
        "2xl": "0 1px 0 0 rgba(255,176,0,0.35)"
      },

      backdropBlur: {
        none: "0",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px"
      }
    }
  },

  plugins: []
};

export default config;
