import "server-only";

import { cache } from "react";

import type { PublishedServiceSeo } from "@/types";
import { arr, isRecord, num, str } from "@/lib/api/coerce";
import { CACHE_TAGS, serverGetJson } from "@/lib/api/client";
import { SITE_ORIGIN } from "@/lib/site";

const INTERNAL_HREF = /^\/(?!\/)[\w\-./#?=&%]*$/;

const normalize = (raw: unknown): PublishedServiceSeo | null => {
  if (!isRecord(raw)) return null;
  const path = str(raw.path);
  if (!path) return null;
  const title = str(raw.seoTitle) ?? "";
  const description = str(raw.metaDescription) ?? "";
  const canonical = str(raw.canonicalUrl) ?? "";
  const h1 = str(raw.preferredH1) ?? "";
  return {
    path,
    seoTitle: title.length >= 20 && title.length <= 65 ? title : "",
    metaDescription: description.length >= 70 && description.length <= 170 ? description : "",
    preferredH1: h1.length >= 5 && h1.length <= 90 ? h1 : "",
    sections: arr(raw.sections)
      .filter(isRecord)
      .map((s) => ({ heading: str(s.heading) ?? "", body: str(s.body) ?? "" }))
      .filter((s) => s.heading && s.body.length >= 40)
      .slice(0, 8),
    internalLinks: arr(raw.internalLinks)
      .filter(isRecord)
      .map((l) => ({ label: str(l.label) ?? "", href: str(l.href) ?? "" }))
      .filter((l) => l.label && INTERNAL_HREF.test(l.href))
      .slice(0, 8),
    canonicalUrl: canonical.startsWith(`${SITE_ORIGIN}/`) ? canonical : "",
    robotsIndex: raw.robotsIndex !== false,
    robotsFollow: raw.robotsFollow !== false,
    publishedAt: num(raw.publishedAt),
  };
};

export const getPublishedServiceSeoAll = cache(async (): Promise<PublishedServiceSeo[]> => {
  try {
    const data = await serverGetJson("/api/seo/published", { tags: [CACHE_TAGS.serviceSeo] });
    return arr(data)
      .map(normalize)
      .filter((c): c is PublishedServiceSeo => c !== null);
  } catch (err) {
    console.error("[service seo] unavailable, using built-in page settings:", err instanceof Error ? err.message : err);
    return [];
  }
});

export const getPublishedServiceSeo = async (path: string): Promise<PublishedServiceSeo | null> =>
  (await getPublishedServiceSeoAll()).find((c) => c.path === path) ?? null;
