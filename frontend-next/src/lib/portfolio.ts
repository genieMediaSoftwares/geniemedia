import type { PortfolioItem } from "@/types";

interface ServiceLink {
  href: string;
  label: string;
}

const SERVICE_FOR_CATEGORY: Record<string, ServiceLink> = {
  "web development": { href: "/web-development", label: "Web Development" },
  "e-commerce": { href: "/web-development", label: "E-commerce Website" },
  "digital marketing": { href: "/digital-marketing", label: "Digital Marketing" },
  production: { href: "/production-house", label: "Video Production" },
  podcast: { href: "/podcast-studio", label: "Podcast" },
};

export const serviceForCategory = (category: string | null | undefined): ServiceLink | null =>
  SERVICE_FOR_CATEGORY[String(category || "").trim().toLowerCase()] || null;

export const portfolioOrFallback = (projects: PortfolioItem[] | null | undefined, fallback: PortfolioItem[]): PortfolioItem[] =>
  projects ?? fallback;
