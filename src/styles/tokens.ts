export const tokens = {
  colors: {
    primary: "#1A3C5E",       // deep navy
    accent: "#00C896",        // emerald mint
    surface: "#F0F4F8",       // cool white
    card: "#FFFFFF",
    dark: "#0D1B2A",
    muted: "#5A7184",
    warning: "#F4A261",
    error: "#E63946",
    success: "#2EC4B6",
    heroGrad: "linear-gradient(135deg, #1A3C5E 0%, #0A2540 100%)",
  },
  fonts: {
    display: "var(--font-sora)",
    body: "var(--font-inter)",
    mono: "var(--font-mono)",
  },
  shadows: {
    card: "0 4px 24px rgba(0,0,0,0.07)",
    glow: "0 0 20px rgba(0,200,150,0.25)",
  },
  borderRadius: {
    card: "16px",
    pill: "999px",
  },
} as const;

export type DesignTokens = typeof tokens;
export type BrandColors = keyof typeof tokens.colors;
