"use client";

import { useEffect, useState } from "react";

import BASE_URL from "@/Api";
import type { BlogCard, PortfolioItem } from "@/types";
import { arr } from "@/lib/api/coerce";
import { normalizeBlog, normalizeProject, toBlogCard, toPortfolioItem } from "@/lib/api/normalize";

/**
 * The site is a static export: lists are baked into the HTML at build time.
 * These hooks start from that baked-in list (so the first paint and search
 * engines see real content) and then replace it with the latest data from the
 * backend, so a project or post added in the admin panel shows up without a
 * rebuild. If the request fails, the baked-in list simply stays.
 */
function useLatest<T>(initial: T, path: string, convert: (data: unknown) => T): T {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_URL}${path}`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: unknown) => {
        if (!cancelled && Array.isArray(data)) setValue(convert(data));
      })
      .catch(() => {
        /* keep the build-time list */
      });
    return () => {
      cancelled = true;
    };
    // `convert` is a module-level function; only the endpoint matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return value;
}

const toProjects = (data: unknown): PortfolioItem[] =>
  arr(data)
    .map(normalizeProject)
    .filter((p): p is NonNullable<typeof p> => p !== null && p.status === "published")
    .map(toPortfolioItem);

const toBlogCards = (data: unknown): BlogCard[] =>
  arr(data)
    .map((raw) => normalizeBlog(raw))
    .filter((b): b is NonNullable<typeof b> => b !== null && b.status === "published")
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .map(toBlogCard);

/** Published portfolio projects; `null` (API unreachable at build) is kept until live data arrives. */
export const useLatestProjects = (initial: PortfolioItem[] | null): PortfolioItem[] | null =>
  useLatest<PortfolioItem[] | null>(initial, "/api/projects", toProjects);

/** Published blog cards, newest first. */
export const useLatestBlogCards = (initial: BlogCard[]): BlogCard[] => useLatest<BlogCard[]>(initial, "/api/blogs", toBlogCards);
