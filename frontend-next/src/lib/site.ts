/**
 * Brand / entity facts, mirrored from Backend/config/site.js. Every value here
 * is shown to visitors in the footer and on the contact page, so the entity a
 * crawler reads from JSON-LD is the one a visitor reads on screen. Keep the two
 * files in step.
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://geniemedia.in";

export const SITE_ORIGIN = rawSiteUrl.trim().replace(/\/+$/, "");

export const SITE = {
  url: SITE_ORIGIN,
  name: "Genie Media & Studio",
  legalName: "Genie Media & Studio",
  alternateName: "Genie Media",
  description:
    "Digital marketing agency and creative production studio in Visakhapatnam, India. SEO, Google and Facebook Ads, social media marketing, website and e-commerce development, video production and podcast studio rental.",
  logo: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  defaultOgImage: `${SITE_ORIGIN}/GenieMedia-Logo.png`,
  locale: "en_IN",
  language: "en",
  twitterHandle: "@itsgeniemedia",
  contact: {
    email: "admin@geniemedia.in",
    telephone: "+91-9032845433",
    contactType: "customer service",
    areaServed: ["IN", "AU", "US"],
    availableLanguage: ["en", "hi", "te"],
  },
  address: {
    streetAddress: "5A2, 4th Floor, KP Icon, KP Infra",
    addressLocality: "Yendada, Visakhapatnam",
    addressRegion: "Andhra Pradesh",
    postalCode: "530045",
    addressCountry: "IN",
  },
  sameAs: [
    "https://m.facebook.com/826093997257312/",
    "https://www.instagram.com/itsgeniemedia_official/",
    "https://www.youtube.com/@itsgeniemedia_official",
    "https://www.linkedin.com/company/itsgeniemediaofficial",
  ],
} as const;

export const DEFAULT_AUTHOR = {
  name: "Genie Media Editorial Team",
  bio: "The Genie Media & Studio editorial team writes about digital marketing, SEO and web development, drawing on client campaigns delivered across India, Australia and the United States.",
  url: `${SITE_ORIGIN}/about`,
  jobTitle: "Editorial Team",
} as const;

/** Analytics IDs, unchanged from the Vite build's index.html. */
export const GTM_ID = "GTM-TZLCRWCB";
export const GA4_ID = "G-H5GFQ5HH50";
export const GOOGLE_SITE_VERIFICATION = "TV7lgY0NjiUrtUvsis_iTwxt3hwtztxF_CYIJ7D3b48";

/**
 * Canonical URL for a path. The root keeps its trailing slash and nothing else
 * gets one, matching the sitemap and the host redirects.
 */
export const canonicalFor = (path: string): string => {
  const clean = String(path || "/").split("?")[0].split("#")[0];
  if (clean === "/" || clean === "") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${clean.replace(/^\/+/, "").replace(/\/+$/, "")}`;
};
