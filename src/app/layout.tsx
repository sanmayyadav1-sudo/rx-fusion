import type { Metadata } from "next";
import { sora, inter, jetbrainsMono } from "@/lib/fonts";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import ActivityTracker from "@/components/ActivityTracker";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export const metadata: Metadata = {
  title: {
    default: "RxFusion | Pharmacy Education Platform",
    template: "%s | RxFusion",
  },
  description: "Access premium pharmacy lecture notes, resources, and articles. Designed specifically for Pharm D, B Pharm, and D Pharm students.",
  keywords: ["Pharmacy Education", "B Pharm Notes", "Pharm D Study Material", "D Pharm syllabus", "RxFusion notes", "Pharmacology"],
  authors: [{ name: "RxFusion Editorial" }],
  openGraph: {
    title: "RxFusion | Pharmacy Education Platform",
    description: "Access premium pharmacy lecture notes, study materials, and scientific blogs.",
    url: "https://rxfusion.netlify.app",
    siteName: "RxFusion",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ActivityTracker />
          <Navbar />
          <AnnouncementPopup />
          <WhatsAppFloatingButton />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
