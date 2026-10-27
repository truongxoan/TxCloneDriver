import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Rajdhani", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Orbitron", "Rajdhani", "ui-sans-serif", "sans-serif"],
        mono: ["'Share Tech Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          glass: "var(--surface-glass)",
          elevated: "var(--surface-elevated)",
          border: "var(--surface-border)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          glow: "var(--primary-glow)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          glow: "var(--accent-glow)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glow-sm": "0 0 15px -3px var(--primary-glow)",
        "glow-lg": "0 0 30px -4px var(--primary-glow)",
        "glow-accent": "0 0 25px -3px var(--accent-glow)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "storm-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124,58,237,0)" },
          "50%": { boxShadow: "0 0 30px 5px rgba(124,58,237,0.3)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "storm-pulse": "storm-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
