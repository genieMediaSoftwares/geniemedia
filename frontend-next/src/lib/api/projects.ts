import "server-only";

import type { PortfolioItem, Project } from "@/types";
import { CACHE_TAGS, arr, serverGetJson } from "@/lib/api/client";
import { normalizeProject, toPortfolioItem } from "@/lib/api/normalize";

export { normalizeProject, toPortfolioItem };

export async function getPublishedPortfolio(): Promise<PortfolioItem[] | null> {
  try {
    const data = await serverGetJson("/api/projects", { tags: [CACHE_TAGS.projects] });
    return arr(data)
      .map((raw) => normalizeProject(raw))
      .filter((p): p is Project => p !== null && p.status === "published")
      .map(toPortfolioItem);
  } catch (err) {
    console.error("[projects] unavailable:", err instanceof Error ? err.message : err);
    return null;
  }
}
