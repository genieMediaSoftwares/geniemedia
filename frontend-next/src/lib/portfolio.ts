import type { PortfolioItem } from "@/types";

interface ServiceLink {
  href: string;
  label: string;
}

const SERVICE_FOR_CATEGORY: Record<string, ServiceLink> = {
  "web development": { href: "/web_development", label: "Web Development" },
  "e-commerce": { href: "/web_development", label: "E-commerce Website" },
  "digital marketing": { href: "/digital_marketing", label: "Digital Marketing" },
  production: { href: "/production_house", label: "Video Production" },
  podcast: { href: "/podcast_studio", label: "Podcast" },
};

export const serviceForCategory = (category: string | null | undefined): ServiceLink | null =>
  SERVICE_FOR_CATEGORY[String(category || "").trim().toLowerCase()] || null;

export const portfolioOrFallback = (projects: PortfolioItem[] | null | undefined, fallback: PortfolioItem[]): PortfolioItem[] =>
  projects ?? fallback;
