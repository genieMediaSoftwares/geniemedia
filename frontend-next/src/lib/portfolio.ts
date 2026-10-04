import type { PortfolioItem } from "@/types";

interface ServiceLink {
  href: string;
  label: string;
}

/**
 * The service page each admin project category belongs to, so a portfolio card
 * can link the work to the service that produced it. A category not listed
 * here renders without a link rather than pointing somewhere wrong.
 */
const SERVICE_FOR_CATEGORY: Record<string, ServiceLink> = {
  "web development": { href: "/web_development", label: "Web Development" },
  "e-commerce": { href: "/web_development", label: "E-commerce Website" },
  "digital marketing": { href: "/digital_marketing", label: "Digital Marketing" },
  production: { href: "/production_house", label: "Video Production" },
  podcast: { href: "/podcast_studio", label: "Podcast" },
};

export const serviceForCategory = (category: string | null | undefined): ServiceLink | null =>
  SERVICE_FOR_CATEGORY[String(category || "").trim().toLowerCase()] || null;

/**
 * The live list from the API, or the offline fallback when the API could not
 * be reached (null). A successful empty list stays empty.
 */
export const portfolioOrFallback = (projects: PortfolioItem[] | null | undefined, fallback: PortfolioItem[]): PortfolioItem[] =>
  projects ?? fallback;
