// Lightweight lists for the header menu, kept separate from the page content files so the
// client bundle does not include the full page copy. Keep in sync with dmServicePages.ts,
// webDevPages.ts and podcastPages.ts (slugs, names and groups).
export interface ServiceNavItem {
  name: string;
  href: string;
  group?: string;
}

export const DM_SERVICE_NAV: ServiceNavItem[] = [
  { name: "SEO Services", href: "/digital_marketing/seo-services", group: "SEO" },
  { name: "Local SEO", href: "/digital_marketing/local-seo", group: "SEO" },
  { name: "Technical SEO", href: "/digital_marketing/technical-seo", group: "SEO" },
  { name: "On-Page SEO", href: "/digital_marketing/on-page-seo", group: "SEO" },
  { name: "Ecommerce SEO", href: "/digital_marketing/ecommerce-seo", group: "SEO" },
  { name: "SEO Audit", href: "/digital_marketing/seo-audit", group: "SEO" },
  { name: "Google Ads Management", href: "/digital_marketing/google-ads", group: "Ads & Social" },
  { name: "Social Media Marketing", href: "/digital_marketing/social-media-marketing", group: "Ads & Social" },
  { name: "Lead Generation", href: "/digital_marketing/lead-generation", group: "Ads & Social" },
  { name: "Content Marketing", href: "/digital_marketing/content-marketing", group: "Content & Conversion" },
  { name: "Conversion Optimization", href: "/digital_marketing/conversion-optimization", group: "Content & Conversion" },
  { name: "Answer Engine Optimization (AEO)", href: "/digital_marketing/aeo", group: "AI Search" },
  { name: "Generative Engine Optimization (GEO)", href: "/digital_marketing/geo", group: "AI Search" },
];

export const WEB_SERVICE_NAV: ServiceNavItem[] = [
  { name: "Website Development", href: "/web_development/website-development", group: "Website Services" },
  { name: "Website Design", href: "/web_development/website-design", group: "Website Services" },
  { name: "Business Websites", href: "/web_development/business-websites", group: "Website Services" },
  { name: "E-commerce Websites", href: "/web_development/ecommerce-websites", group: "Website Services" },
  { name: "SEO-Friendly Websites", href: "/web_development/seo-friendly-websites", group: "Website Services" },
  { name: "WordPress", href: "/web_development/wordpress", group: "Platforms" },
  { name: "Shopify", href: "/web_development/shopify", group: "Platforms" },
  { name: "WooCommerce", href: "/web_development/woocommerce", group: "Platforms" },
  { name: "React Development", href: "/web_development/react-development", group: "Custom & App Development" },
  { name: "Next.js Development", href: "/web_development/nextjs-development", group: "Custom & App Development" },
  { name: "React Native Apps", href: "/web_development/react-native", group: "Custom & App Development" },
  { name: "Website Redesign", href: "/web_development/website-redesign", group: "Care & Performance" },
  { name: "Website Maintenance", href: "/web_development/website-maintenance", group: "Care & Performance" },
  { name: "Speed Optimization", href: "/web_development/website-speed-optimization", group: "Care & Performance" },
];

/** Groups items in order of first appearance; ungrouped lists come back as one unnamed group. */
export const groupNav = (items: ServiceNavItem[]): Array<{ group?: string; items: ServiceNavItem[] }> => {
  const out: Array<{ group?: string; items: ServiceNavItem[] }> = [];
  for (const item of items) {
    const last = out[out.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else out.push({ group: item.group, items: [item] });
  }
  return out;
};

export const PODCAST_SERVICE_NAV: ServiceNavItem[] = [
  { name: "Studio Rental", href: "/podcast_studio/rental", group: "At Our Vizag Studio" },
  { name: "Video Podcast Studio", href: "/podcast_studio/video-podcast", group: "At Our Vizag Studio" },
  { name: "Pricing & Packages", href: "/podcast_studio/pricing", group: "At Our Vizag Studio" },
  { name: "Book the Studio", href: "/podcast_studio/booking", group: "At Our Vizag Studio" },
  { name: "Podcast Production", href: "/podcast_studio/production", group: "Production Across India" },
  { name: "Podcast Editing", href: "/podcast_studio/editing", group: "Production Across India" },
  { name: "Content Repurposing", href: "/podcast_studio/content-repurposing", group: "Production Across India" },
];
