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
        navy: "#102A43",
        blue: "#1677B8",
        teal: "#247C83",
        ww: "#FCFCFA",
        tx: "#243B53",
        tx2: "#627D98",
        ln: "#DCE3EA",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          dark: "#102A43",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "#125f94",
        },
        surface: "var(--background)",
        card: "var(--card)",
        dark: "var(--dark)",
        muted: "var(--muted)",
        warning: "var(--warning)",
        error: "var(--error)",
        success: "var(--success)",
      },
      fontFamily: {
        sans: ["var(--font-instrument)", "Instrument Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Newsreader", "Georgia", "serif"],
        display: ["var(--font-newsreader)", "Newsreader", "Georgia", "serif"],
        heading: ["var(--font-newsreader)", "Newsreader", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        sh: "0 1px 2px rgba(16,42,67,.06), 0 8px 24px -12px rgba(16,42,67,.18)",
        card: "0 1px 2px rgba(16,42,67,.06), 0 8px 24px -12px rgba(16,42,67,.18)",
      },
      borderRadius: {
        card: "8px",
        pill: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
