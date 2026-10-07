import type { MetadataRoute } from "next";

import { getPublishedBlogsSafe } from "@/lib/api/blogs";
import { getPublishedCaseStudiesSafe } from "@/lib/api/caseStudies";
import { caseStudyUrl } from "@/lib/caseStudies";
import { canonicalFor } from "@/lib/site";
import { blogCanonical } from "@/lib/seo/metadata";

export const dynamic = "force-static";

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/digital_marketing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/web_development", priority: 0.9, changeFrequency: "monthly" },
  { path: "/production_house", priority: 0.9, changeFrequency: "monthly" },
  { path: "/podcast_studio", priority: 0.9, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.7, changeFrequency: "weekly" },
  { path: "/reviews", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blogs", priority: 0.8, changeFrequency: "daily" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/terms-and-conditions", priority: 0.3, changeFrequency: "monthly" },
];

const lastModifiedOf = (iso: string | null, ...epochs: Array<number | null>): Date | undefined => {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  for (const e of epochs) if (e) return new Date(e);
  return undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, caseStudies] = await Promise.all([getPublishedBlogsSafe(), getPublishedCaseStudiesSafe()]);

  const latest = blogs
    .map((b) => lastModifiedOf(b.last_modified_at, b.updatedAt, b.createdAt))
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const pages: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: canonicalFor(r.path),
    lastModified: latest,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const posts: MetadataRoute.Sitemap = blogs
    .filter((b) => !b.robots_directive.startsWith("noindex"))
    .map((b) => ({
      url: blogCanonical(b),
      lastModified: lastModifiedOf(b.last_modified_at, b.updatedAt, b.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: b.image ? [b.image] : undefined,
    }));

  const studies: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: caseStudyUrl(cs.slug),
    lastModified: lastModifiedOf(null, cs.updatedAt, cs.publishedAt, cs.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    images: cs.cover ? [cs.cover.url] : undefined,
  }));

  const hub: MetadataRoute.Sitemap = caseStudies.length
    ? [
        {
          url: canonicalFor("/case-studies"),
          lastModified: studies.map((s) => s.lastModified as Date | undefined).filter((d): d is Date => Boolean(d)).sort((a, b) => b.getTime() - a.getTime())[0],
          changeFrequency: "monthly",
          priority: 0.8,
        },
      ]
    : [];

  return [...pages, ...hub, ...studies, ...posts];
}
