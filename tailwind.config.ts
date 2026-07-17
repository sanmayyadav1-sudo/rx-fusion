import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          dark: "#0F2B48",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "#00B084",
        },
        secondary: "var(--accent)",
        surface: "var(--background)",
        card: "var(--card)",
        dark: "var(--dark)",
        muted: "var(--muted)",
        warning: "var(--warning)",
        error: "var(--error)",
        success: "var(--success)",
      },
      backgroundImage: {
        "hero-grad": "var(--hero-grad)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-sora)", "sans-serif"],
        heading: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        // Custom Scale mapping
        hero: ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "800" }],
        h1: ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.75", fontWeight: "400" }],
        label: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.15em", fontWeight: "600" }],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.07)",
        glow: "0 0 20px rgba(0,200,150,0.25)",
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-left": "slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
