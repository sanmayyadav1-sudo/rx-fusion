import type { Metadata } from "next";
import { instrumentSans, newsreader, jetbrainsMono } from "@/lib/fonts";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: {
    default: "RxFusion | Pharmacy Knowledge. Clinical Excellence.",
    template: "%s | RxFusion",
  },
  description:
    "An advanced learning ecosystem designed exclusively for Doctor of Pharmacy (Pharm.D) students, combining academic resources, clinical education and scientific research.",
  keywords: [
    "Pharm.D Education",
    "Doctor of Pharmacy",
    "Clinical Pharmacy",
    "Pharmacology",
    "Pharmacotherapeutics",
    "SOAP Notes",
    "Clinical Cases",
    "Drug Database",
  ],
  authors: [{ name: "RxFusion Editorial" }],
  openGraph: {
    title: "RxFusion | Pharmacy Knowledge. Clinical Excellence.",
    description:
      "An advanced learning ecosystem designed exclusively for Doctor of Pharmacy (Pharm.D) students.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${instrumentSans.variable} ${newsreader.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main id="app" className="flex-grow">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
