"use client";

import { useEffect, useState } from "react";

import BASE_URL from "@/Api";
import type { BlogCard, PortfolioItem } from "@/types";
import { arr } from "@/lib/api/coerce";
import { normalizeBlog, normalizeProject, toBlogCard, toPortfolioItem } from "@/lib/api/normalize";

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
      });
    return () => {
      cancelled = true;
    };
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

export const useLatestProjects = (initial: PortfolioItem[] | null): PortfolioItem[] | null =>
  useLatest<PortfolioItem[] | null>(initial, "/api/projects", toProjects);

export const useLatestBlogCards = (initial: BlogCard[]): BlogCard[] => useLatest<BlogCard[]>(initial, "/api/blogs", toBlogCards);
