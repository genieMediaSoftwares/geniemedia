import "server-only";

import { cache } from "react";

import type { CaseStudy } from "@/types";
import { CACHE_TAGS, arr, serverGetJson } from "@/lib/api/client";
import { normalizeCaseStudy } from "@/lib/caseStudies";

export const getPublishedCaseStudiesSafe = cache(async (): Promise<CaseStudy[]> => {
  try {
    const data = await serverGetJson("/api/case-studies", { tags: [CACHE_TAGS.caseStudies] });
    return arr(data)
      .map((raw) => normalizeCaseStudy(raw))
      .filter((cs): cs is CaseStudy => cs !== null && cs.status === "published")
      .sort((a, b) => a.displayOrder - b.displayOrder || (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
  } catch (err) {
    console.error("[case studies] unavailable:", err instanceof Error ? err.message : err);
    return [];
  }
});
