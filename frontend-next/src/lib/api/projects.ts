import "server-only";

import type { PortfolioItem, Project, ProjectStatus } from "@/types";
import { CACHE_TAGS, arr, isRecord, num, serverGetJson, str } from "@/lib/api/client";

export function normalizeProject(raw: unknown): Project | null {
  if (!isRecord(raw)) return null;
  const id = num(raw.id);
  const title = str(raw.title);
  if (id === null || !title) return null;
  return {
    id,
    title,
    description: str(raw.description),
    category: str(raw.category),
    image: str(raw.image),
    projectUrl: str(raw.projectUrl),
    status: (str(raw.status) === "published" ? "published" : "draft") as ProjectStatus,
    displayOrder: num(raw.displayOrder) ?? 0,
    createdAt: num(raw.createdAt),
    updatedAt: num(raw.updatedAt),
  };
}

/** The shape the existing portfolio markup renders ({ name, image, url }). */
export const toPortfolioItem = (p: Project): PortfolioItem => ({
  id: p.id,
  name: p.title,
  image: p.image || "",
  url: p.projectUrl || "",
  description: p.description || "",
  category: p.category || "",
});

/**
 * Published portfolio projects, or null when the API cannot be reached — the
 * caller then renders its offline fallback list, exactly as the Vite hook did.
 * A successful empty response is an empty array, so deleting every project in
 * the admin panel really empties the grid.
 */
export async function getPublishedPortfolio(): Promise<PortfolioItem[] | null> {
  try {
    const data = await serverGetJson("/api/projects", { tags: [CACHE_TAGS.projects] });
    return arr(data)
      .map(normalizeProject)
      .filter((p): p is Project => p !== null && p.status === "published")
      .map(toPortfolioItem);
  } catch (err) {
    console.error("[projects] unavailable:", err instanceof Error ? err.message : err);
    return null;
  }
}
