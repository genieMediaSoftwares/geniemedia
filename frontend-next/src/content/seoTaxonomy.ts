export type Tier = "primary" | "secondary" | "semantic" | "local" | "supporting";

export interface ServiceTopic {
  name: string;
  path: "/" | "/digital_marketing" | "/web_development" | "/production_house" | "/podcast_studio";
  subtopics: string[];
  terms: Record<Tier, string[]>;
}

export const BRAND = { name: "Genie Media & Studio", alternateName: "Genie Media" } as const;
export const LOCATION = { city: "Visakhapatnam", alternateName: "Vizag", region: "Andhra Pradesh" } as const;

export const SEO_TAXONOMY: ServiceTopic[] = [
  {
    name: "Genie Media & Studio",
    path: "/",
    subtopics: ["Digital Marketing", "Website Development", "Production House", "Podcast Studio"],
    terms: {
      primary: ["Genie Media & Studio", "digital marketing"],
      secondary: ["website development", "production house", "podcast studio", "SEO", "social media marketing", "Google Ads", "branding"],
      semantic: ["creative media", "online visibility", "business growth", "brand videos"],
      local: ["Vizag", "Visakhapatnam", "Andhra Pradesh", "digital marketing agency in Vizag"],
      supporting: ["Genie Media"],
    },
  },
  {
    name: "Digital Marketing",
    path: "/digital_marketing",
    subtopics: ["SEO", "Local SEO & Google Business Profile", "Google Ads / PPC", "Social Media Marketing & Meta Ads", "Content Marketing", "Lead Generation", "Conversion Optimization", "Branding"],
    terms: {
      primary: ["digital marketing", "digital marketing services", "digital marketing agency", "digital marketing company"],
      secondary: ["SEO services", "Google Ads", "PPC", "social media marketing", "content marketing", "lead generation", "conversion optimization", "branding", "digital marketing strategy"],
      semantic: [
        "search engine optimization", "local SEO", "technical SEO", "on-page SEO", "keyword research", "Google Business Profile",
        "organic traffic", "Google rankings", "conversion tracking", "paid search", "search engine marketing", "performance marketing",
        "social media management", "social media strategy", "brand awareness", "audience engagement", "landing pages",
        "conversion rate optimization", "ROI", "online visibility", "business growth", "analytics",
        "Google Maps", "Meta Ads", "display ads", "remarketing", "small businesses", "startups",
      ],
      local: ["digital marketing services in Vizag", "digital marketing agency in Vizag", "digital marketing company in Vizag", "SEO services in Vizag", "social media marketing in Vizag", "Visakhapatnam", "Andhra Pradesh", "near me"],
      supporting: ["Genie Media & Studio", "website development", "production house"],
    },
  },
  {
    name: "Website Development",
    path: "/web_development",
    subtopics: ["Web Design / UI/UX", "Custom Web Development (React, Next.js, Node.js)", "Ecommerce Development (Shopify, WooCommerce)", "WordPress Development", "Website Maintenance & Optimization", "Hosting & Deployment"],
    terms: {
      primary: ["web development", "web development company"],
      secondary: ["website development", "website design", "custom web development", "ecommerce website development", "WordPress website development", "UI/UX", "web development services"],
      semantic: [
        "React", "Next.js", "Node.js", "web applications", "responsive", "mobile-friendly", "SEO-friendly", "business websites",
        "landing pages", "redesign", "website maintenance", "speed optimization", "user experience", "hosting",
      ],
      local: ["web development company in Vizag", "web development services in Vizag", "Visakhapatnam"],
      supporting: ["Genie Media & Studio", "digital marketing", "podcast studio", "projects"],
    },
  },
  {
    name: "Production House",
    path: "/production_house",
    subtopics: ["Video Production", "Corporate Videos", "Commercial & Product Videos", "Brand & Promotional Videos", "Events, Weddings & Live Streaming", "Post-Production & Editing", "Photography"],
    terms: {
      primary: ["production house", "video production"],
      secondary: ["corporate videos", "commercial and product videos", "promotional videos", "post-production", "video editing", "photography", "live streaming"],
      semantic: ["scriptwriting", "storyboarding", "filming", "brand films", "Reels", "YouTube", "color grading", "event coverage", "video content"],
      local: ["production house in Vizag", "Visakhapatnam"],
      supporting: ["Genie Media & Studio", "podcast studio", "digital marketing", "website development"],
    },
  },
  {
    name: "Podcast Studio",
    path: "/podcast_studio",
    subtopics: ["Podcast Studio Rental", "Podcast Recording", "Video Podcast Production", "Podcast Filming", "Podcast Editing", "Podcast Content (clips for social media)"],
    terms: {
      primary: ["podcast studio", "podcast recording"],
      secondary: ["video podcast", "podcast production", "podcast studio rental", "podcast editing", "podcast filming"],
      semantic: ["audio", "interviews", "branded podcasts", "corporate podcasts", "content creators", "businesses", "production team", "cameras", "microphones", "Reels"],
      local: ["podcast studio in Vizag", "Visakhapatnam"],
      supporting: ["Genie Media & Studio", "video production", "social media marketing"],
    },
  },
];

export const REJECTED_TERMS: Array<{ terms: string[]; reason: string }> = [
  { terms: ["motion graphics", "animation video production"], reason: "Not a listed Genie Media & Studio service." },
  { terms: ["LinkedIn marketing", "LinkedIn ads", "YouTube marketing", "YouTube ads", "online reputation management", "marketing automation", "inbound marketing", "influencer marketing", "WhatsApp marketing", "email marketing agency"], reason: "Not listed among the digital marketing services; confirm before adding." },
  { terms: ["podcast streaming setup", "podcast photography"], reason: "Not listed among the podcast studio's services." },
  { terms: ["leadraft digital marketing", "any other agency name"], reason: "Competitor names are never targets." },
  { terms: ["digital marketing digital marketing", "ad in marketing", "digital marketing for", "digital marketing in", "digital marketing in vizagVizag"], reason: "Scraped or run-together fragments, not real search phrases." },
  { terms: ["best digital marketing agency", "top digital marketing agency", "leading", "expert", "trusted", "best website design"], reason: "Unverifiable superlatives; the pages describe services instead of claiming to be the best." },
  { terms: ["local local seo services", "near me google ads agency", "roi driven ppc agency", "data driven sem agency", "visakhapatnam ap"], reason: "Generated modifier combinations, not natural phrases; the base service + city terms cover them." },
  { terms: ["digital marketing packages", "digital marketing pricing"], reason: "No published prices; the cost FAQ answers the question without inventing packages." },
  { terms: ["view project", "book meeting call", "floor kp icon", "kp icon yendada"], reason: "Navigation and address fragments, not search topics." },
];

export const BLOG_TOPICS: Array<{ title: string; supports: ServiceTopic["path"] }> = [
  { title: "How Local SEO Helps Businesses in Visakhapatnam", supports: "/digital_marketing" },
  { title: "Google Ads vs SEO for Local Businesses in Vizag", supports: "/digital_marketing" },
  { title: "Social Media Marketing for Small Businesses: Where to Start", supports: "/digital_marketing" },
  { title: "Web Development Company in Vizag: What Businesses Should Look For", supports: "/web_development" },
  { title: "What Makes a High-Converting Business Website", supports: "/web_development" },
  { title: "How Website Speed Affects User Experience and SEO", supports: "/web_development" },
  { title: "WordPress, Shopify or Custom Code: Choosing a Platform", supports: "/web_development" },
  { title: "Corporate Video Production for Businesses in Vizag", supports: "/production_house" },
  { title: "How Businesses Can Use Video Content for Marketing", supports: "/production_house" },
  { title: "How to Start a Professional Video Podcast", supports: "/podcast_studio" },
  { title: "Podcast Production vs Podcast Recording: What You Need", supports: "/podcast_studio" },
  { title: "How Podcast Content Can Support a Brand", supports: "/podcast_studio" },
];
