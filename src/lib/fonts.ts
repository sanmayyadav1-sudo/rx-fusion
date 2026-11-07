import { Instrument_Sans, JetBrains_Mono } from "next/font/google";

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600"],
});

// Newsreader is loaded via Google Fonts link tag in layout.tsx to support opsz without next/font override errors
export const newsreader = {
  variable: "--font-newsreader",
};

// Compatibility exports
export const sora = instrumentSans;
export const inter = instrumentSans;
