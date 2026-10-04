import type { Metadata, Viewport } from "next";

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics, { GtmNoScript } from "@/components/Analytics";
import { GOOGLE_SITE_VERIFICATION, SITE, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  // Pages set their own absolute titles; this only covers anything that does not.
  title: { default: "Genie Media & Studio", template: "%s | Genie Media & Studio" },
  description: SITE.description,
  applicationName: SITE.name,
  verification: { google: GOOGLE_SITE_VERIFICATION },
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
    // suppressHydrationWarning: browser extensions (ColorZilla's
    // `cz-shortcut-listen`, Grammarly, password managers…) add attributes to
    // <html>/<body> before React hydrates. This only ignores attribute
    // differences on these two elements; mismatches inside the page are
    // still reported.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GtmNoScript />
        <Header />
        {/* The single <main> landmark for every route. Pages must not render
            their own <main>. `flow-root` stops a page's first margin collapsing
            out through <main>, which used to register as a layout shift. */}
        <main id="main-content" style={{ display: "flow-root" }}>
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
