// Registry of all service sub-pages, used by the routes, sitemap, llms.txt, schema and
// related-link resolution. Add a new section here and give it a [service] route.
import type { ServicePagePath } from "@/types";
import type { ServiceSubPage } from "@/content/serviceSubPage";
import { DM_SERVICE_PAGES } from "@/content/dmServicePages";
import { WEB_DEV_PAGES } from "@/content/webDevPages";
import { PODCAST_PAGES } from "@/content/podcastPages";

export interface ServiceSection {
  path: ServicePagePath;
  label: string;
  /** Anchor text for the link back to the section's main page. */
  hubLinkText: string;
  /** Intro under the "Benefits" heading. */
  benefitsNote: string;
  /** Names from content/testimonials.ts to show on this section's pages. */
  testimonialNames: string[];
  /** Show WhatsApp buttons instead of the phone/email CTAs, with this label. */
  whatsapp?: string;
  /** Second line under the pricing paragraph. */
  pricingNote?: string;
  /** Intro under the industries/audiences heading. */
  industriesIntro?: string;
  /** Location line in the closing CTA. */
  ctaLocation?: string;
  pages: ServiceSubPage[];
}

export const DIGITAL_MARKETING_SECTION: ServiceSection = {
  path: "/digital_marketing",
  label: "Digital Marketing",
  hubLinkText: "digital marketing agency page",
  benefitsNote:
    "We cannot promise specific rankings or results, because no agency controls search engines or ad auctions. Here is what this work is designed to improve.",
  testimonialNames: ["Deepak Kumar Sharma", "Kedhar Panda", "Aruna Sai Kumar"],
  whatsapp: "Message on WhatsApp",
  ctaLocation: "Based in Visakhapatnam, Andhra Pradesh. Working with businesses in Vizag and across India.",
  pages: DM_SERVICE_PAGES,
};

export const WEB_DEVELOPMENT_SECTION: ServiceSection = {
  path: "/web_development",
  label: "Web Development",
  hubLinkText: "web development company page",
  benefitsNote: "Here is what this work is designed to improve for your business and your visitors.",
  testimonialNames: ["Deepak Kumar Sharma", "Kedhar Panda", "Heena M Shrivastava"],
  industriesIntro: "We build websites for businesses in Vizag and across India, working in person or fully remotely.",
  ctaLocation: "Our web team is based in Visakhapatnam and builds websites for businesses in Vizag and across India.",
  pages: WEB_DEV_PAGES,
};

export const PODCAST_SECTION: ServiceSection = {
  path: "/podcast_studio",
  label: "Podcast Studio",
  hubLinkText: "podcast studio in Vizag page",
  benefitsNote: "Here is what you get from recording and producing with our team in Visakhapatnam.",
  testimonialNames: ["Sasidhar Pydiraju", "Aruna Sai Kumar", "Shanmuk"],
  whatsapp: "Book on WhatsApp",
  pricingNote: "Message us on WhatsApp to check availability and get a quote for any editing or add-ons before you book.",
  industriesIntro: "Recording happens at our studio in Yendada, Visakhapatnam, used by creators and businesses from Vizag and across Andhra Pradesh. Editing, production and repurposing are also available remotely across India.",
  ctaLocation: "Podcast studio in Yendada, Visakhapatnam, Andhra Pradesh. Remote editing and production support across India.",
  pages: PODCAST_PAGES,
};

export const SERVICE_SECTIONS: ServiceSection[] = [DIGITAL_MARKETING_SECTION, WEB_DEVELOPMENT_SECTION, PODCAST_SECTION];

export const subPagePath = (section: ServiceSection, slug: string): string => `${section.path}/${slug}`;

export const ALL_SUB_PAGES = SERVICE_SECTIONS.flatMap((section) =>
  section.pages.map((page) => ({ section, page, path: subPagePath(section, page.slug) })),
);

export const findSubPage = (section: ServiceSection, slug: string): ServiceSubPage | undefined =>
  section.pages.find((p) => p.slug === slug);

export const findSubPageByPath = (path: string) => ALL_SUB_PAGES.find((e) => e.path === path);
