export const tokens = {
  colors: {
    navy: "#102A43",
    blue: "#1677B8",
    teal: "#247C83",
    ww: "#FCFCFA",
    tx: "#243B53",
    tx2: "#627D98",
    ln: "#DCE3EA",
    // Semantic mappings
    primary: "#102A43",
    accent: "#1677B8",
    accentTeal: "#247C83",
    surface: "#FCFCFA",
    card: "#FFFFFF",
    dark: "#102A43",
    muted: "#627D98",
    warning: "#F4A261",
    error: "#B3392F",
    success: "#247C83",
    heroGrad: "radial-gradient(closest-side, rgba(22,119,184,.55), rgba(36,124,131,.18) 60%, transparent)",
  },
  fonts: {
    display: "var(--font-newsreader), Newsreader, Georgia, serif",
    serif: "var(--font-newsreader), Newsreader, Georgia, serif",
    body: "var(--font-instrument), 'Instrument Sans', system-ui, sans-serif",
    sans: "var(--font-instrument), 'Instrument Sans', system-ui, sans-serif",
    mono: "var(--font-mono), monospace",
  },
  shadows: {
    sh: "0 1px 2px rgba(16,42,67,.06), 0 8px 24px -12px rgba(16,42,67,.18)",
    card: "0 1px 2px rgba(16,42,67,.06), 0 8px 24px -12px rgba(16,42,67,.18)",
  },
  borderRadius: {
    btn: "6px",
    card: "8px",
    pill: "20px",
  },
} as const;

export type DesignTokens = typeof tokens;
export type BrandColors = keyof typeof tokens.colors;
