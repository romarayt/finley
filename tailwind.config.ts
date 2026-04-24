import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
          soft: "hsl(var(--success-soft) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
          soft: "hsl(var(--warning-soft) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--danger) / <alpha-value>)",
          foreground: "hsl(var(--danger-foreground) / <alpha-value>)",
          soft: "hsl(var(--danger-soft) / <alpha-value>)",
        },
        category: {
          food: "hsl(var(--cat-food) / <alpha-value>)",
          transport: "hsl(var(--cat-transport) / <alpha-value>)",
          housing: "hsl(var(--cat-housing) / <alpha-value>)",
          fun: "hsl(var(--cat-fun) / <alpha-value>)",
          health: "hsl(var(--cat-health) / <alpha-value>)",
          work: "hsl(var(--cat-work) / <alpha-value>)",
          subs: "hsl(var(--cat-subs) / <alpha-value>)",
          shopping: "hsl(var(--cat-shopping) / <alpha-value>)",
          education: "hsl(var(--cat-education) / <alpha-value>)",
          other: "hsl(var(--cat-other) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.25rem", { lineHeight: "1.4" }],
        xl: ["1.5625rem", { lineHeight: "1.25" }],
        "2xl": ["1.9375rem", { lineHeight: "1.2" }],
        "3xl": ["2.4375rem", { lineHeight: "1.15" }],
        "4xl": ["2.4375rem", { lineHeight: "1.1" }],
        hero: ["clamp(2.5rem, 6vw, 4rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 hsl(var(--shadow-color) / 0.04)",
        sm: "0 1px 3px 0 hsl(var(--shadow-color) / 0.06), 0 1px 2px -1px hsl(var(--shadow-color) / 0.05)",
        md: "0 4px 8px -2px hsl(var(--shadow-color) / 0.08), 0 2px 4px -2px hsl(var(--shadow-color) / 0.06)",
        lg: "0 12px 24px -4px hsl(var(--shadow-color) / 0.10), 0 4px 8px -4px hsl(var(--shadow-color) / 0.06)",
        xl: "0 24px 40px -8px hsl(var(--shadow-color) / 0.14), 0 8px 16px -8px hsl(var(--shadow-color) / 0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.8s linear infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
