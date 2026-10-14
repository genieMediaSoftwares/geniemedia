export type PageType = "home" | "service" | "about" | "listing" | "contact" | "legal" | "other";
export type PageIntent = "INFORMATIONAL" | "COMMERCIAL" | "TRANSACTIONAL" | "NAVIGATIONAL" | "LOCAL";

export interface BuiltinPageSeo {
  pageType: PageType;
  primaryTopic: string;
  primaryKeyword: string;
  searchIntent: PageIntent;
  secondaryTopics: string[];
  note: string;
}

export const BUILTIN_PAGE_SEO: Record<string, BuiltinPageSeo> = {
  "/": {
    pageType: "home",
    primaryTopic: "Genie Media & Studio",
    primaryKeyword: "Genie Media & Studio Vizag",
    searchIntent: "LOCAL",
    secondaryTopics: ["SEO", "Google Ads", "social media marketing", "website development", "video production", "podcast studio"],
    note: "Introduces Genie Media's digital marketing services and links to each specialist service page.",
  },
  "/digital_marketing": {
    pageType: "service",
    primaryTopic: "digital marketing",
    primaryKeyword: "digital marketing agency in Vizag",
    searchIntent: "COMMERCIAL",
    secondaryTopics: ["SEO", "local SEO", "social media marketing", "Google Ads", "lead generation", "content marketing"],
    note: "Service page for digital marketing in Visakhapatnam.",
  },
  "/web_development": {
    pageType: "service",
    primaryTopic: "web development",
    primaryKeyword: "website development company in Vizag",
    searchIntent: "COMMERCIAL",
    secondaryTopics: ["website design", "ecommerce website development", "WordPress", "Shopify"],
    note: "Service page for websites and online stores.",
  },
  "/production_house": {
    pageType: "service",
    primaryTopic: "production house",
    primaryKeyword: "production house in Vizag",
    searchIntent: "COMMERCIAL",
    secondaryTopics: ["video production", "corporate videos", "product videos", "video editing", "photography"],
    note: "Service page for video production and photography.",
  },
  "/podcast_studio": {
    pageType: "service",
    primaryTopic: "podcast studio",
    primaryKeyword: "podcast studio in Vizag",
    searchIntent: "COMMERCIAL",
    secondaryTopics: ["podcast recording", "video podcast", "podcast editing"],
    note: "Service page for studio hire and podcast production.",
  },
  "/about": {
    pageType: "about",
    primaryTopic: "Genie Media & Studio",
    primaryKeyword: "Genie Media & Studio",
    searchIntent: "NAVIGATIONAL",
    secondaryTopics: [],
    note: "Company background, team and location. Not a copy of the homepage.",
  },
  "/services": {
    pageType: "listing",
    primaryTopic: "services",
    primaryKeyword: "Genie Media & Studio services",
    searchIntent: "NAVIGATIONAL",
    secondaryTopics: ["digital marketing", "website development", "video production", "podcast studio"],
    note: "Overview that links to the specialist service pages.",
  },
  "/projects": {
    pageType: "listing",
    primaryTopic: "projects",
    primaryKeyword: "Genie Media projects",
    searchIntent: "INFORMATIONAL",
    secondaryTopics: ["website development"],
    note: "Real client projects only.",
  },
  "/case-studies": {
    pageType: "listing",
    primaryTopic: "case studies",
    primaryKeyword: "Genie Media case studies",
    searchIntent: "INFORMATIONAL",
    secondaryTopics: [],
    note: "Real projects with verified details only.",
  },
  "/blogs": {
    pageType: "listing",
    primaryTopic: "digital marketing blog",
    primaryKeyword: "digital marketing blog",
    searchIntent: "INFORMATIONAL",
    secondaryTopics: [],
    note: "Article index.",
  },
  "/reviews": {
    pageType: "listing",
    primaryTopic: "reviews",
    primaryKeyword: "Genie Media reviews",
    searchIntent: "NAVIGATIONAL",
    secondaryTopics: [],
    note: "Genuine reviews only; no review markup for testimonials.",
  },
  "/contact": {
    pageType: "contact",
    primaryTopic: "contact",
    primaryKeyword: "contact Genie Media & Studio",
    searchIntent: "NAVIGATIONAL",
    secondaryTopics: [],
    note: "Accurate address, phone and email.",
  },
  "/privacy-policy": {
    pageType: "legal",
    primaryTopic: "privacy policy",
    primaryKeyword: "privacy policy",
    searchIntent: "INFORMATIONAL",
    secondaryTopics: [],
    note: "Legal page. No service keywords.",
  },
  "/terms-and-conditions": {
    pageType: "legal",
    primaryTopic: "terms and conditions",
    primaryKeyword: "terms and conditions",
    searchIntent: "INFORMATIONAL",
    secondaryTopics: [],
    note: "Legal page. No service keywords.",
  },
};

export const builtinFor = (path: string): BuiltinPageSeo | null => BUILTIN_PAGE_SEO[path] ?? null;
