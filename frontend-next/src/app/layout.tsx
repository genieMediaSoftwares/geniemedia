import type { Metadata, Viewport } from "next";

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics, { GtmNoScript } from "@/components/Analytics";
import { GOOGLE_SITE_VERIFICATION, SITE, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: "Genie Media & Studio", template: "%s | Genie Media & Studio" },
  description: SITE.description,
  applicationName: SITE.name,
  verification: GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : undefined,
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/favicon-48.png", sizes: "48x48", type: "image/png" }],
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
        <GtmNoScript />
        <Header />
        <main id="main-content" data-seo-content="true" className="flow-root">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
