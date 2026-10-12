// Shared shape of the service sub-pages (/digital_marketing, /web_development, /podcast_studio).
// Rendered by src/components/serviceSubPage/ServiceSubPage.tsx. The `plan` block on each page is
// internal SEO planning data (keywords, intent, anchor text, link-back pages, image briefs) and
// is never rendered.
// Never invent clients, results, prices, awards or reviews in page content. Timelines are typical
// ranges the owner approved on 2026-10-12; podcast studio prices come only from podcastStudio.ts.

export type SubPageHeroImage =
  | "dm1" | "dm2" | "dmServices" | "web1" | "web2" | "avantta" | "meera"
  | "studioSet" | "studioSet2" | "studioCameras" | "studioMics" | "studioRecorder";

/** Extra blocks a page can opt into (podcast studio pages). */
export type SubPageExtra = "packages" | "booking" | "studioInfo" | "equipment";

export interface SubPageCard {
  title: string;
  body: string;
  /** Optional "covers" list under the card. */
  bullets?: string[];
  /** Optional link to a deeper page (slug in the same section or a full path). */
  href?: string;
}

/** Free-form H2 section for page-specific topics (e.g. "Google Ads and SEO Together"). */
export interface SubPageSection {
  heading: string;
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
  items?: SubPageCard[];
}

export interface SubPagePlan {
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTail: string[];
  searchIntent: "Commercial" | "Commercial / informational" | "Local commercial";
  audience: string;
  schema: string[];
  anchorTexts: string[];
  linkBackFrom: string[];
  images: Array<{ file: string; alt: string }>;
}

export interface ServiceSubPage {
  slug: string;
  name: string;
  short: string;
  /** Optional menu/hub grouping, e.g. "Platforms". */
  group?: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string[];
  hero: { image: SubPageHeroImage; alt: string };
  whatIs: { heading: string; paragraphs: string[] };
  whoNeeds: { heading: string; items: string[] };
  benefits?: SubPageCard[];
  included: { heading: string; intro: string; items: SubPageCard[] };
  deliverables: string[];
  /** Omit when no approved timeline exists for the service. */
  timeline?: Array<{ phase: string; period: string }>;
  pricing: string;
  process: SubPageCard[];
  industries?: SubPageCard[];
  measurement?: { heading: string; intro: string; items: string[] };
  mistakes?: SubPageCard[];
  faqs: Array<{ q: string; a: string }>;
  /** Slugs in the same section, or full paths ("/web_development/wordpress", "/contact"). */
  related: string[];
  cta: { heading: string; body: string; button: string; href?: string };
  extras?: SubPageExtra[];
  /** Extra H2 sections rendered after the process/mistakes blocks. */
  sections?: SubPageSection[];
  /** Optional overrides for the template's default section headings. */
  headings?: Partial<Record<"benefits" | "deliverables" | "process" | "industries" | "mistakes" | "pricing" | "faq", string>>;
  plan: SubPagePlan;
}
