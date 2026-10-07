import { GA4_ID, GOOGLE_SITE_VERIFICATION, GTM_ID, SITE_URL } from "@/lib/env";

export const SITE_ORIGIN = SITE_URL;

export const SITE_HOST = new URL(SITE_URL).host;

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
    streetAddress: "5A-2, 4th Floor, KP Icon, near MK Gold Coast",
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

export { GA4_ID, GOOGLE_SITE_VERIFICATION, GTM_ID };

export const canonicalFor = (path: string): string => {
  const clean = String(path || "/").split("?")[0].split("#")[0];
  if (clean === "/" || clean === "") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${clean.replace(/^\/+/, "").replace(/\/+$/, "")}`;
};
