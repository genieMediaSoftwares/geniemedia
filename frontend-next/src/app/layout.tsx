import type { Metadata, Viewport } from "next";

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics, { GtmNoScript } from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import { GOOGLE_SITE_VERIFICATION, SITE, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: "Genie Media & Studio", template: "%s | Genie Media & Studio" },
  description: SITE.description,
  applicationName: SITE.name,
  verification: GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : undefined,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: { language: "English" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-3 focus:bg-white focus:text-black">Skip to main content</a>
        <GtmNoScript />
        <Header />
        <main id="main-content" tabIndex={-1} data-seo-content="true" className="flow-root min-w-0">
          {children}
        </main>
        <Footer />
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
