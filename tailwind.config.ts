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
        brandBg: "var(--brand-bg)",
        brandSurface: "var(--brand-surface)",
        brandSurfaceAlt: "var(--brand-surface-alt)",
        brandLine: "var(--brand-line)",
        brandDark: "var(--brand-dark)",
        brandBlue: "var(--brand-blue)",
        brandBlueDeep: "var(--brand-blue-deep)",
        brandAccent: "var(--brand-accent)",
        brandAccentSoft: "var(--brand-accent-soft)",
        brandAccentHover: "var(--brand-accent-hover)",
        brandLight: "var(--brand-light)",
        brandText: "var(--brand-text)"
      },

      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        display: ["Archivo", '"IBM Plex Sans"', "sans-serif"],
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